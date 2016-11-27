package com.skycision.dao;

import java.util.ArrayList;

import com.skycision.model.Tile;

public interface TileDao
{
	public ArrayList<String> findFieldByFarmId(String farmId);

	public ArrayList<Tile> findTile(String farmId, String fieldName, String type, String date, int altitude);
}
