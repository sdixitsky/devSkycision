package com.skycision.flight;

import java.util.ArrayList;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.vividsolutions.jts.algorithm.ConvexHull;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateList;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LinearRing;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.math.Vector2D;

public class FlightPlanGenerator {

	private static final Logger				logger			= LoggerFactory.getLogger(FlightPlanGenerator.class);
	private static final double				FOCAL_LENGTH	= 0.02;
	private static final double				SENSOR_D1		= 0.04233;
	private static final double				SENSOR_D2		= 0.03175;

	private static final GeometryFactory	gf				= new GeometryFactory();

	@SuppressWarnings("unchecked")
	public Flight createFlightPlanFromField(CoordinateList fieldCoords, double altitude, double overlap, int iterations) {
		HashMap<String, Double> overlapValues = overlapCalc(altitude, overlap);
		Double overlapD1 = overlapValues.get("D1").doubleValue();
		Double overlapD2 = overlapValues.get("D2").doubleValue();

		fieldCoords.add(fieldCoords.get(0));

		UTMConverter utmc = new UTMConverter();
		Coordinate[] utmCoords = utmc.convertToUTM(fieldCoords);

		LinearRing outerBound = gf.createLinearRing(utmCoords);
		Polygon field = gf.createPolygon(outerBound, null);
		ConvexHull hull = new ConvexHull(field);

		Coordinate[] c = hull.getConvexHull().getCoordinates();

		Flight flight = new Flight();
		Vector2D[] allWaypoints;
		CoordinateList internalWaypoints;
		try {
			flight = buildFlightWithRotatingCalipers(c,fieldCoords);
			flight.setUTMC(utmc);
			flight.setAltitude(altitude);
			flight.setOverlap(overlap);
			allWaypoints = findAllWaypoints(c, flight, overlapD1, overlapD2);

			internalWaypoints = findInternalWaypoints(field, allWaypoints);

		} catch (WaypointCountException e) {
			return flight.withErrorEntity(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage() + " " + e.getCause().getMessage()));
		} catch (NullPointerException e) {
			return flight.withErrorEntity(ResponseEntity.status(HttpStatus.BAD_REQUEST).body("nullpointer"));
		}
		
		CoordinateList optimalRoute = customImplementation(internalWaypoints, iterations);
		
		CoordinateList optimalLatLon = utmc.convertToLatLon(optimalRoute);

		flight.setCoordinatesWithCoordinateList(optimalLatLon);

		return flight;
	}
	
	public Flight createFlightPlanFromDefaults(CoordinateList fieldCoords) {
		return createFlightPlanFromField(fieldCoords, 40, 0.33, 3);
	}

	private Flight buildFlightWithRotatingCalipers(Coordinate[] c, CoordinateList cl) throws WaypointCountException {
		Flight newFlight = new Flight();
		newFlight.setBoundary(cl);
		Double minimumArea = Double.NaN;

		int n = c.length - 1;
		int j = 1;
		int k = 0;
		int m = 0;

		for (int i = 0; i < n; i++) {

			// Find vertex on 1st perpendicular line of support
			while (dotFun(c, n, i, j) > 0) {
				j++;
			}

			// Find vertex on parallel line of support
			if (i == 0) {
				k = j;
			}
			
			while (crossFun(c, n, i, k) > 0) {
				k++;
			}

			// Find vertex on second perpendicular line of support
			if (i == 0) {
				m = k;
			}
			
			while (dotFun(c, n, i, m) < 0) {
				m++;
			}

			double d1;
			double d2;

			Vector2D s1 = Vector2D.create(c[i % n], c[(i + 1) % n]);
			s1 = s1.divide(s1.length());

			Vector2D s2 = s1.rotateByQuarterCircle(3);

			d1 = distFun(c[i % n], c[k % n], s1);
			d2 = distFun(c[j % n], c[m % n], s2);

			Vector2D secondPerpToIthVertex = Vector2D.create(c[i % n], c[m % n]);
			Vector2D rectCornerVector = (Vector2D.create(c[i % n])).add(s1.multiply(secondPerpToIthVertex.dot(s1)));
			
			if ( Double.valueOf(secondPerpToIthVertex.length()).equals(0) || Double.valueOf(rectCornerVector.length()).equals(0)) {
				throw new WaypointCountException("Resulting polygon ill-formed", new WaypointCountException.TooFewWaypointsException(), true);
			}
			
			Double Ai = d1 * d2;

			if (i == 1 || Ai < minimumArea) {
				minimumArea = Ai;
				newFlight.setSaerCorner(rectCornerVector);
				newFlight.setSaerV1(s1.multiply(d1));
				newFlight.setSaerV2(s2.multiply(d2));
				newFlight.setBaseCorner1((Coordinate)cl.get(i%n));
			}
		}
		
		return newFlight;
	}

	private double dotFun(Coordinate[] c, int n, int i, int j) {
		Vector2D v1 = Vector2D.create(c[i % n], c[(i + 1) % n]);
		Vector2D v2 = Vector2D.create(c[j % n], c[(j + 1) % n]);
		v1 = v1.divide(v1.length());
		v2 = v2.divide(v2.length());

		return v1.dot(v2);
	}

	private double crossFun(Coordinate[] c, int n, int i, int j) {
		Vector2D v1 = Vector2D.create(c[i % n], c[(i + 1) % n]);
		Vector2D v2 = Vector2D.create(c[j % n], c[(j + 1) % n]);
		v1 = v1.divide(v1.length());
		v2 = v2.divide(v2.length());

		double cross1 = v1.getX() * v2.getY();
		double cross2 = v2.getX() * v1.getY();

		return cross2 - cross1;
	}

	private double distFun(Coordinate p1, Coordinate p2, Vector2D s) {
		s = s.divide(s.length());

		Vector2D vec = Vector2D.create(p1, p2);
		return (vec.subtract(s.multiply(vec.dot(s)))).length();
	}

	/*
	 * Generate grid of waypoints covering entire Smallest Enclosing Rectangle
	 */
	private Vector2D[] findAllWaypoints(Coordinate[] c, Flight flight, double overlapD1, double overlapD2) throws WaypointCountException {
		
		// North is (lat:1, lng:0)
		Vector2D north = Vector2D.create(1.0, 0.0);

		double saerD1 = flight.getSaerDist1();
		double saerD2 = flight.getSaerDist2();

		Vector2D parallel = flight.getSaerDir1();
		Vector2D perpendicular = flight.getSaerDir2();
		Vector2D corner = flight.getSaerCorner();

		Double num1 = (Math.ceil(saerD1 / overlapD1)) * (Math.ceil(saerD2 / overlapD2));
		Double num2 = (Math.ceil(saerD2 / overlapD1)) * (Math.ceil(saerD1 / overlapD2));
		logger.info("\tnum: {}", Math.min(num1, num2));
		if (num1 >= 1000 || num2 >= 1000) {
			throw new WaypointCountException("Maximum waypoint count exceeded: ", new WaypointCountException.TooManyWaypointsException(), true);
		} else if (num1 < 4 || num2 < 4) {
			throw new WaypointCountException("Minimum waypoint count not met: ", new WaypointCountException.TooFewWaypointsException(), true);
		}
		

		double W;
		double L;
		Double numW;
		Double numL;
		int numWaypoints;

//		if (num1 < num2) {
			W = overlapD1;
			L = overlapD2;

			flight.setHeading(north.angleTo(perpendicular)*180/Math.PI);
//			flight.setHeading(perpendicular.angleTo(north)*180/Math.PI);
			
			flight.setImgDims(W,L);
			
//
//			// going from {lat1,lng1} -> {lat2,lng}, find bearing
//
//			double y = Math.sin(lng2-lng1) * Math.cos(lat2);
//
//			double x = Math.cos(lat1)*Math.sin(lat2) -
//			        Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1);
//			double brng = Math.atan2(y, x).toDegrees();
//			
			

			numW = Math.ceil(saerD1 / overlapD1);
			numL = Math.ceil(saerD2 / overlapD2);

			numWaypoints = num1.intValue();
//		} else {
//			W = overlapD2;
//			L = overlapD1;
//
////			flight.setHeading(north.angleTo(parallel)*180/Math.PI);
//			flight.setHeading(parallel.angleTo(north)*180/Math.PI);
//			
//			flight.setImgDims(W,L);
//			
//			numW = Math.ceil(saerD1 / overlapD2);
//			numL = Math.ceil(saerD2 / overlapD1);
//
//			numWaypoints = num2.intValue();
//		}

		int nw = numW.intValue();
		int nl = numL.intValue();

		Vector2D[] allWaypoints = new Vector2D[numWaypoints];
		int index;
		for (int u = 0; u < nw; u++) {
			for (int v = 0; v < nl; v++) {

				index = (u * nl) + v;

				Vector2D cur = corner;
				cur = cur.add(perpendicular.multiply(W * u + W / 2));
				cur = cur.add(parallel.multiply(L * v + L / 2));

				allWaypoints[index] = cur;
			}
		}
		return allWaypoints;
	}

	/*
	 * Check grid of waypoints for points lying within field boundary
	 */
	@SuppressWarnings("unchecked")
	private CoordinateList findInternalWaypoints(Polygon field, Vector2D[] allWaypoints)  throws WaypointCountException {
		CoordinateList internalWaypoints = new CoordinateList();

		for (int i = 0; i < allWaypoints.length; i++) {

			Coordinate temp = new Coordinate(allWaypoints[i].getX(), allWaypoints[i].getY());

			Geometry point = gf.createPoint(temp);

			if (field.contains(point)) {
				internalWaypoints.add(temp);
			}
		}
		logger.info(Integer.toString(internalWaypoints.size()) + " internal waypoints");
		if (internalWaypoints.size() <= 3) {
			throw new WaypointCountException("Minimum waypoint count exceeded", new WaypointCountException.TooFewWaypointsException(), true);
		}
		return internalWaypoints;
	}

	private HashMap<String, Double> overlapCalc(double altitude, double overlap) {
		HashMap<String, Double> result = new HashMap<String, Double>();

		double tgtD1 = altitude * SENSOR_D1 / FOCAL_LENGTH;
		double tgtD2 = altitude * SENSOR_D2 / FOCAL_LENGTH;

		Double ovlD1 = tgtD1 * (1 - 2*overlap);
		Double ovlD2 = tgtD2 * (1 - 2*overlap);

		result.put("D1", ovlD1);
		result.put("D2", ovlD2);

		return result;
	}

	@SuppressWarnings("unchecked")
	private CoordinateList customImplementation(CoordinateList internalWaypoints, int numIterations) {
		
		int numWaypoints = internalWaypoints.size();
		Vector2D[] waypoints = new Vector2D[numWaypoints];
		for (int i=0; i < numWaypoints; i++) {
			waypoints[i] = Vector2D.create((Coordinate) internalWaypoints.get(i));
		}
		
		double[][] distMat = euclideanMatrix(waypoints);
		int[] pmin = null, p, pE, s = randPerm(numWaypoints);
		double Lmin = 100000, L;
		
		for (int k = 0; k < numIterations; k++) {
			p = greedy(s[Math.min(s.length-1,k)], distMat);
			pE = exchange2(p, distMat);
			L = tourLength(pE, waypoints);

			if (L < Lmin) {
				Lmin = L;
				pmin = pE.clone();
			}
		}
		
		CoordinateList output = new CoordinateList();
		if (pmin != null) {
			for (int m : pmin) {
				output.add((Coordinate) internalWaypoints.get(m));
			}
		}
		return output;
	}

	private double[][] euclideanMatrix(Vector2D[] waypoints) {
		int l = waypoints.length;
		double[][] output = new double[l][l];

		for (int i = 0; i < l; i++) {
			for (int j = 0; j < l; j++) {
				output[i][j] = Math.abs(waypoints[i].distance(waypoints[j]));
			}
		}
		return output;
	}

	private int[] greedy(int sIn, double[][] D) {
		int ss = sIn;
		int n = D.length;
		
		double[][] d = new double[n][n];
		for (int h = 0;h<n;h++){
			d[h] = D[h].clone();
		}
		
		int[] p = new int[n];
		p[0] = ss;
		
		for (int t = 1; t < n; t++) {

			for (int q = 0; q < n; q++) {
				d[ss][q] = 100000;
			}

			double min = 100000;
			
			int sPlaceholder = ss;
			for (int r = 0; r < n; r++) {
				double val = d[r][sPlaceholder];
				if (val < min) {
					min = val;
					ss = r;
				}		
			}
			p[t] = ss;
		}
		return p;
	}

	private int[] randPerm(int n) {
		int[] indices = new int[n];
		ArrayList<Integer> arr = new ArrayList<Integer>();
		
		for (int i = 0; i < n; i++) {
			arr.add(new Integer(i));
		}

		// Create random tour to start
		java.util.Collections.shuffle(arr);
		java.util.Collections.shuffle(arr);
		
		for (int i = 0; i < n; i++) {
			indices[i] = arr.get(i);
		}
		return indices;
	}

	private int[] exchange2(int[] p, double[][] D){
		final double EPSILON = 0.0000000000001;
		int n = p.length-1;
		int i, a, b, c, d, j, imin=-1, jmin = -1;
		double  Dab, zmin=-1, z;
		
		int[] newP = p.clone();
		
		while (Math.abs(zmin) < EPSILON)
		{
			zmin = 0;
			i = -1;
			b = newP[n];
			
			while (i < n-2)
			{
				a = b;
				i = i+1;
				b = newP[i];
				Dab = D[a][b];
				j = i+1;
				d = newP[j];
				while (j < n)
				{
					c = d;
					j = j+1;
					d = newP[j];
					
					// Tour length diff z
					// Note: a==d will occur and give z=0
					z = (D[a][c] - D[c][d]) + D[b][d] - Dab;
					// keep best exchange
					if (z < zmin)
					{
						zmin = z;
						imin = i;
						jmin = j;
					}
				}
			}
			if (Math.abs(zmin) < EPSILON)
			{
				int count = 0;
				int[] ptemp = newP.clone();
				for (int ii = imin; ii < jmin; ii++)
				{
					newP[ii] = ptemp[jmin-1-count];
					count++;
				}
			}
		}
		return newP;	
	}
	
	private double tourLength(int[] pE, Vector2D[] waypoints)
	{
		int length = pE.length;
		double sum = 0;
		for (int i=0;i<length-1;i++)
		{
			sum = sum + waypoints[pE[i]].distance(waypoints[pE[i+1]]);
		}
		logger.info("\t Route Length: {}", (Math.ceil(sum*100)/100) );
		return sum;
	}
}