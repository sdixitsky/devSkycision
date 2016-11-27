package com.skycision.farm;

import java.util.ArrayList;

import com.skycision.flight.UTMConverter;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateList;
import com.vividsolutions.jts.math.Vector2D;

public class DistanceCalculation
{

	// Specifications of the DJI X3 camera
	final static double	sensorWidth			= 6.248; // Width of the camera sensor in
													 // millimeters
	final static double	sensorHeight		= 4.686; // Height of the camera sensor in
	// millimeters
	final static double	focalLength			= 3.846; // Effective focal length of the camera in
	// millimeters
	final static double	horizontalPixels	= 4000;	 // Width of picture in pixels
	final static double	verticalPixels		= 3000;	 // Height of picture in pixels

//	public static double[] calculateMove(double distanceToGround, double centerLat, double centerLong, double originalLat,
//			double originalLong, double heading)
//	{
//
//		// Calculations
//		double horizontalMetersPerPixel = getMetersPerPixel(sensorWidth, horizontalPixels, focalLength, distanceToGround);
//		System.out.println("Each horizontal pixel represents " + horizontalMetersPerPixel + " meters");
//
//		double verticalMetersPerPixel = getMetersPerPixel(sensorHeight, verticalPixels, focalLength, distanceToGround);
//		System.out.println("Each vertical pixel represents " + verticalMetersPerPixel + " meters");
//
//		if (Math.abs(horizontalMetersPerPixel - verticalMetersPerPixel) <= 0.000001)
//		{
//			System.out.println("The vertical and horizontal meters per pixel agree!");
//		}
//
//		double horizontalDistance = componentDistanceBetweenCoordinates(centerLat, centerLong, originalLat, originalLong,
//				heading, true);
//		System.out.println("Horizontal: " + horizontalDistance);
//		System.out.println(
//				"The image needs to be displaced " + horizontalDistance / horizontalMetersPerPixel + " pixels to the right.");
//
//		double verticalDistance = componentDistanceBetweenCoordinates(centerLat, centerLong, originalLat, originalLong, heading,
//				false);
//		System.out.println("Vertical: " + verticalDistance);
//		System.out.println("The image needs to be displaced " + verticalDistance / verticalMetersPerPixel + " pixels down.");
//
//		return new double[]
//		{ (horizontalDistance / horizontalMetersPerPixel), (verticalDistance / verticalMetersPerPixel) };
//
//	}

	public static double getFOV(double distToSubject, double angleOfView)
	{
		return 2.0 * distToSubject * Math.tan(angleOfView / 2.0);
	}

	public static double getAOV(double focalLength, double sensorLength)
	{
		return 2.0 * Math.atan(sensorLength / (focalLength * 2.0));
	}

	public static double[] getMetersPerPixel(double sensorLength, double numPixels, double focalLength, double distToSubject)
	{
		double aov = getAOV(focalLength, sensorLength);
		double fov = getFOV(distToSubject, aov);
		return new double[]{fov / numPixels, fov};
	}

	public static double[] getMetersPerPixel(double distToSubject, double pixelLength, boolean horizontal)
	{
		double sensorLength = horizontal ? sensorWidth : sensorHeight;
		return getMetersPerPixel(sensorLength, pixelLength, focalLength, distToSubject);
	}

	public static double distanceBetweenCoordinates(double lat1, double lon1, double lat2, double lon2)
	{
		// Uses the haversine formula (assumes Earth is a sphere)
		double r = 6371000; // Radius of earth in meters
		double phi1 = Math.toRadians(lat1);
		double phi2 = Math.toRadians(lat2);
		double deltaPhi = Math.toRadians(lat2 - lat1);
		double deltaLambda = Math.toRadians(lon2 - lon1);

		double a = Math.sin(deltaPhi / 2.0) * Math.sin(deltaPhi / 2.0)
				+ Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2.0) * Math.sin(deltaLambda / 2.0);
		double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return r * c;
	}

	public static double bearingBetweenCoordinates(double lat1, double lon1, double lat2, double lon2)
	{
		double phi1 = Math.toRadians(lat1);
		double phi2 = Math.toRadians(lat2);
		double lambda1 = Math.toRadians(lon1);
		double lambda2 = Math.toRadians(lon2);

		double y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
		double x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);

		double brng = Math.toDegrees(Math.atan2(y, x));
		return (brng + 360.0) % 360.0;
	}

	public static double componentDistanceBetweenCoordinates(double lat1, double lon1, double lat2, double lon2, double heading,
			boolean horizontal)
	{
		double hypothenuse = distanceBetweenCoordinates(lat1, lon1, lat2, lon2);
		double absoluteBearing = bearingBetweenCoordinates(lat1, lon1, lat2, lon2);
		double relativeBearing = (absoluteBearing - heading + 360.0) % 360.0;

		double acute = relativeBearing % 90.0;
		double distance = 0;

		if (relativeBearing < 90)
		{
			if (horizontal)
			{
				distance = hypothenuse * Math.sin(Math.toRadians(acute));
			}
			else
			{
				distance = -1.0 * hypothenuse * Math.sin(Math.toRadians(90.0 - acute));
			}
		}
		else if (relativeBearing < 180)
		{
			if (horizontal)
			{
				distance = hypothenuse * Math.sin(Math.toRadians(90.0 - acute));
			}
			else
			{
				distance = hypothenuse * Math.sin(Math.toRadians(acute));
			}
		}
		else if (relativeBearing < 270)
		{
			if (horizontal)
			{
				distance = -1.0 * hypothenuse * Math.sin(Math.toRadians(acute));
			}
			else
			{
				distance = hypothenuse * Math.sin(Math.toRadians(90.0 - acute));
			}
		}
		else
		{
			if (horizontal)
			{
				distance = -1.0 * hypothenuse * Math.sin(Math.toRadians(90.0 - acute));
			}
			else
			{
				distance = -1.0 * hypothenuse * Math.sin(Math.toRadians(acute));
			}
		}

		return distance;
	}

	public static double[] destinationPoint(double lat, double lon, double distance, double heading)
	{
		double r = 6371000; // Radius of earth in meters
		double delta = distance / r;
		double phi = Math.toRadians(lat);
		double lambda = Math.toRadians(lon);
		double theta = Math.toRadians(heading);
		double phi2 = Math.asin(Math.sin(phi) * Math.cos(delta) + Math.cos(phi) * Math.sin(delta) * Math.cos(theta));
		double lambda2 = lambda + Math.atan2(Math.sin(theta) * Math.sin(delta) * Math.cos(phi),
				Math.cos(delta) - Math.sin(phi) * Math.sin(phi2));
		return new double[]
		{ Math.toDegrees(phi2), Math.toDegrees(lambda2) };
	}

	
	@Deprecated
	public static ArrayList<Double> calculateBoundsOld(double horizontalDistance, double verticalDistance, double lat, double lon,
			double heading, boolean meters)
	{
		if (!meters)
		{
			double metersPerFeet = 0.3048;
			horizontalDistance = horizontalDistance * metersPerFeet;
			verticalDistance = verticalDistance * metersPerFeet;
		}

		double diagonal = Math.sqrt(Math.pow(horizontalDistance / 2.0, 2) + Math.pow(verticalDistance / 2.0, 2));
		double hAngle = Math.toDegrees(Math.asin((horizontalDistance / 2.0) / (diagonal)));
		double vAngle = Math.toDegrees(Math.asin((verticalDistance / 2.0) / (diagonal)));
		double[] upperLeft = destinationPoint(lat, lon, diagonal, (heading - hAngle + 360.0) % 360.0);
		double[] lowerRight = destinationPoint(lat, lon, diagonal, (heading + 90.0 + vAngle + 360.0) % 360.0);

		// Returns {north, south, east, west}
		ArrayList<Double> result = new ArrayList<Double>();
		double north = (Math.max(upperLeft[0], lowerRight[0]));
		double south = (Math.min(upperLeft[0], lowerRight[0]));
		double east = (Math.max(upperLeft[1], lowerRight[1]));
		double west = (Math.min(upperLeft[1], lowerRight[1]));
		
		
		com.vividsolutions.jts.geom.Coordinate sw = new com.vividsolutions.jts.geom.Coordinate(west,south);
		com.vividsolutions.jts.geom.Coordinate ne = new com.vividsolutions.jts.geom.Coordinate(east,north);
		Vector2D diag = new Vector2D(sw, ne);
		Vector2D rotatedDiag = diag.rotate(-heading);
		
		result.add(south);
		result.add(west);
		result.add(south+rotatedDiag.getY());
		result.add(east+rotatedDiag.getX());
		return result;
	}
	
	@SuppressWarnings("unchecked")
	public static ArrayList<Double> calculateBounds(double h, double w, double lat, double lon, double heading) {
		
		UTMConverter uc = new UTMConverter();
		CoordinateList cl = new CoordinateList();
		cl.add(new Coordinate(lat,lon));
		
		Coordinate[] utmCoord = uc.convertToUTM(cl);
		Vector2D origin = new Vector2D(utmCoord[0].y,utmCoord[0].x);
		Vector2D center = new Vector2D(0,0);
		Vector2D hVector = new Vector2D(w/2,0);
		Vector2D vVector = new Vector2D(0,h/2);
		
		Vector2D bottomLeft = center.subtract(hVector).subtract(vVector);
		Vector2D topRight = center.add(hVector).add(vVector);
		
		Vector2D southWest = bottomLeft.add(origin);
		Vector2D northEast = topRight.add(origin);
		
		CoordinateList newCorners = new CoordinateList();
		newCorners.add(new Coordinate(southWest.getY(),southWest.getX()));
		newCorners.add(new Coordinate(northEast.getY(),northEast.getX()));
		
		CoordinateList latLon = uc.convertToLatLon(newCorners);
		Coordinate sw = latLon.getCoordinate(0);
		Coordinate ne = latLon.getCoordinate(1);
		
		ArrayList<Double> result = new ArrayList<Double>();
		
		result.add(sw.x);
		result.add(ne.x);
		result.add(sw.y);
		result.add(ne.y);
		
		return result;	
	}
}
