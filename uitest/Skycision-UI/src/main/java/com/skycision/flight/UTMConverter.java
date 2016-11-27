package com.skycision.flight;

import java.util.HashMap;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateList;

public class UTMConverter {
	
	private double minEasting;
	private double minNorthing;
	private String longZone;
	private String latZone;
	private static final CoordinateConversion cv = new CoordinateConversion();
	
	public Coordinate[] convertToUTM(CoordinateList coords) {
		Coordinate[] utmArray = coords.toCoordinateArray();

		HashMap<String,Object> convertedResult = cv.latLon2UTM(utmArray);
		
		Coordinate[] utmCoords = (Coordinate[])convertedResult.get("coordinates");
		longZone = (String)convertedResult.get("longZone");
		latZone = (String)convertedResult.get("latZone");
		minEasting = ((Double)convertedResult.get("minEasting")).doubleValue();
		minNorthing = ((Double)convertedResult.get("minNorthing")).doubleValue();
		
		Coordinate[] result = new Coordinate[utmCoords.length+1];
		
		for(int i=0;i<utmCoords.length;i++){
			result[i] = new Coordinate(utmCoords[i].x-minNorthing,utmCoords[i].y-minEasting);
		}
		result[utmCoords.length] = result[0];
		
		return result;
		
//			Coordinate[] result = new Coordinate[coords.length];
//		
//		
//		
//		for (int i = 0;i < coords.length; i++) {
//			Double north = coords[i].x + minNorthUTM;
//			Double east = coords[i].y + minEastUTM;
//			
//			String utm = regionUTM + " " + (east) + " " + (north);
//			
//			double[] latLon = cv.utm2LatLon(utm);
//			result[i] = new Coordinate(latLon[0],latLon[1]);
//		}
//		return result;
	}
	
	public CoordinateList convertToLatLon(CoordinateList coords) {
//		Coordinate[] result = new Coordinate[coords.length];
//		
//		CoordinateConversion cv = new CoordinateConversion();
//		
//		double minEast = Double.NaN;
//		double minNorth = Double.NaN;
//		
//		for (int i = 0;i < coords.length; i++) {
//			String utm = cv.latLon2UTM(coords[i].x,coords[i].y);
//			String[] splitUTM = utm.split(" ");
//			
//			if (i == 0) {
//				this.regionUTM = splitUTM[0] + " " + splitUTM[1];
//			}
//			
//			double easting = Double.parseDouble(splitUTM[2]);
//			double northing = Double.parseDouble(splitUTM[3]);
//			
//			if (i == 0 || easting < minEast) {
//				minEast = easting;
//			}
//			if (i == 0 || northing < minNorth) {
//				minNorth = northing;
//			}
//		}
//		
//		this.minNorthUTM = minNorth;
//		this.minEastUTM = minEast;
//		
//		for (int j = 0; j < coords.length; j++) {
//			String utm = cv.latLon2UTM(coords[j].x,coords[j].y);
//			
//			String[] splitUtm = utm.split(" ");
//			
//			double easting = Double.parseDouble(splitUtm[2]);
//			double northing = Double.parseDouble(splitUtm[3]);
//			
//			result[j] = new Coordinate(northing-minNorth,easting-minEast);
//		}
//		
//		return result;
		
		
		Coordinate[] reapplyShift = new Coordinate[coords.size()];
		for(int i=0;i<coords.size();i++) {
			Coordinate temp = coords.getCoordinate(i);
			reapplyShift[i] = new Coordinate(temp.x+minNorthing,temp.y+minEasting);
		}
		
		Coordinate[] latlonCoords = cv.utm2LatLon(reapplyShift, latZone, longZone);
		Coordinate[] result = new Coordinate[latlonCoords.length];
		for(int i=0;i<latlonCoords.length;i++){
			result[i] = new Coordinate(latlonCoords[i].x,latlonCoords[i].y);
		}
		return new CoordinateList(result);
	}
}
