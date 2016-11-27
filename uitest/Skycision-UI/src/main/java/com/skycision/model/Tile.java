package com.skycision.model;

public class Tile {
	int tileId;
	double lat1;
	double lng1;
	double lat2;
	double lng2;
	int altitude;
	String date;
	String type;
	String thumbUrl;
	String fullUrl;
	String fieldName;
	String farmId;
	
	
	public int getAltitude() {
		return altitude;
	}
	public void setAltitude(int altitude) {
		this.altitude = altitude;
	}
	
	public int getTileId() {
		return tileId;
	}
	public void setTileId(int tileId) {
		this.tileId = tileId;
	}
	public double getLat1() {
		return lat1;
	}
	public void setLat1(double lat1) {
		this.lat1 = lat1;
	}
	public double getLng1() {
		return lng1;
	}
	public void setLng1(double lng1) {
		this.lng1 = lng1;
	}
	public double getLat2() {
		return lat2;
	}
	public void setLat2(double lat2) {
		this.lat2 = lat2;
	}
	public double getLng2() {
		return lng2;
	}
	public void setLng2(double lng2) {
		this.lng2 = lng2;
	}
	public String getDate() {
		return date;
	}
	public void setDate(String date) {
		this.date = date;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getThumbUrl() {
		return thumbUrl;
	}
	public void setThumbUrl(String thumbUrl) {
		this.thumbUrl = thumbUrl;
	}
	public String getFullUrl() {
		return fullUrl;
	}
	public void setFullUrl(String fullUrl) {
		this.fullUrl = fullUrl;
	}
	public String getFieldName() {
		return fieldName;
	}
	public void setFieldName(String fieldName) {
		this.fieldName = fieldName;
	}
	public String getFarmId() {
		return farmId;
	}
	public void setFarmId(String farmId) {
		this.farmId = farmId;
	}
	
	
}
