package com.skycision.flight;

import java.util.ArrayList;

import org.springframework.http.ResponseEntity;

import com.vividsolutions.jts.geom.CoordinateList;
import com.vividsolutions.jts.math.Vector2D;
import com.skycision.model.Latlng;
import com.vividsolutions.jts.geom.Coordinate;

public class Flight {
	int flightId;
	int fieldId;
	ArrayList<Latlng> coordinates;
	private ArrayList<Latlng> boundary;
	double altitude;
	double overlap;
	private double heading;
	private Vector2D saerV1;
	private Vector2D saerV2;
	private Vector2D saerCorner;
	private long calculationTime;
	private Coordinate baseCorner1;
	private double imgHeight;
	private double imgWidth;
	private ResponseEntity<Object> errorEntity;
	protected UTMConverter UTMC;
	
	public int getFlightId() {
		return flightId;
	}
	public void setFlightId(int flightId) {
		this.flightId = flightId;
	}
	public int getFieldId() {
		return fieldId;
	}
	public void setFieldId(int fieldId) {
		this.fieldId = fieldId;
	}
	public ArrayList<Latlng> getCoordinates() {
		return coordinates;
	}
	public void setCoordinatesWithLatlngList(ArrayList<Latlng> coordinates) {
		this.coordinates = coordinates;
	}
	
	public void setCoordinatesWithCoordinateList(CoordinateList inputCoordinates) {
		this.coordinates = new ArrayList<Latlng>();
		for (int i = 0;i<inputCoordinates.size(); i++)
			this.coordinates.add(new Latlng(inputCoordinates.getCoordinate(i)));
	}
	
	public double getAltitude() {
		return altitude;
	}
	public void setAltitude(double altitude) {
		this.altitude = altitude;
	}
	public double getOverlap() {
		return overlap;
	}
	public void setOverlap(double overlap) {
		this.overlap = overlap;
	}
	
	public double getHeading() {
		return heading;
	}
	
	public void setHeading(double heading) {
		this.heading = heading;
	}
	
	public Vector2D getSaerCorner() {
		return saerCorner;
	}
	
	public void setSaerCorner(Vector2D saerCorner) {
		this.saerCorner = saerCorner;
	}
	
	public double getSaerDist1() {
		return getSaerV1().length();
	}
	
	public void setSaerD1(Vector2D saerD1) {
		this.setSaerV1(saerD1);
	}
	
	public double getSaerDist2() {
		return getSaerV2().length();
	}
	
	public void setSaerDist2(Vector2D saerD2) {
		this.setSaerV2(saerD2);
	}
	
	public Vector2D getSaerDir1() {
		return getSaerV1().divide(getSaerV1().length());
	}
	
	public Vector2D getSaerDir2() {
		return getSaerV2().divide(getSaerV2().length());
	}
	
	public Vector2D getSaerV1() {
		return saerV1;
	}
	
	public void setSaerV1(Vector2D saerV1) {
		this.saerV1 = saerV1;
	}
	
	public Vector2D getSaerV2() {
		return saerV2;
	}
	
	public void setSaerV2(Vector2D saerV2) {
		this.saerV2 = saerV2;
	}
	public void setCalculationTime(long l) {
		this.calculationTime = l;
	}
//	public void setCalculationTime(double l) {
//		this.calculationTime = l;
//	}
	public double getCalculationTime() {
		return this.calculationTime;
	}
	
	public void setBoundary(CoordinateList boundList) {
		this.boundary = new ArrayList<Latlng>();
		for (int i = 0;i<boundList.size(); i++)
			this.boundary.add(new Latlng(boundList.getCoordinate(i)));
	}
	
	public ArrayList<Latlng> getBoundary() {
		return boundary;
	}
	public void setBaseCorner1(Coordinate cd) {
		// TODO Auto-generated method stub
		this.baseCorner1 = cd;
	}
	public void setUTMC(UTMConverter utmc) {
		this.UTMC = utmc;		
	}
	
	public void setImgDims(double h, double w) {
		this.imgHeight = h;
		this.imgWidth = w;
	}
	
	public double getImgHeight() {
		return this.imgHeight;
	}
	
	public double getImgWidth() {
		return this.imgWidth;
	}
	public Flight withErrorEntity(ResponseEntity<Object> entity) {
		this.errorEntity = entity;
		return this;
	}
	
	public ResponseEntity<Object> getErrorEntity() {
		return this.errorEntity;
	}
}
