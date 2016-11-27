package com.skycision.dao;

import java.util.ArrayList;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.skycision.dao.impl.jdbcTileDao;
import com.skycision.model.Tile;
@Deprecated
@SuppressWarnings("unused")
public class OldLocalDataStore 
{
	private static final Logger					logger	= LoggerFactory.getLogger(DataStore.class);
	private ArrayList<HashMap<String, Object>>	farmBoundary;
	private ArrayList<HashMap<String, Object>>	fieldBoundary;
	private ArrayList<HashMap<String, Object>>	fieldsList;
	private jdbcTileDao							tileDao;

	public OldLocalDataStore(){
		tileDao = new jdbcTileDao();
	}

	public ArrayList<String> getFieldList(String farmId)
	{
		ArrayList<String> result = tileDao.findFieldByFarmId(farmId);
		return result;
	}

	public ArrayList<HashMap<String, Object>> getTiles(String farmId, String fieldName, String type, String date, int altitude)
	{
		ArrayList<HashMap<String, Object>> result = new ArrayList<HashMap<String, Object>>();
		ArrayList<Tile> tiles = tileDao.findTile(farmId, fieldName, type, date, altitude);
		System.out.println("qqqqqqqqqqqqqqqqqq" + tiles);
		for (int i = 0; i < tiles.size(); i++)
		{
			Tile curr = tiles.get(i);
			HashMap<String, Object> tmp = new HashMap<String, Object>();
			tmp.put("id", curr.getTileId());
			tmp.put("lat1", curr.getLat1());
			tmp.put("lat2", curr.getLat2());
			tmp.put("lng1", curr.getLng1());
			tmp.put("lng2", curr.getLng2());
			tmp.put("type", curr.getType());
			tmp.put("thumbUrl", curr.getThumbUrl());
			tmp.put("fullUrl", curr.getFullUrl());
			result.add(tmp);
		}
		System.out.println("rrrrrrrrrrrrrrrrrrr" + result);
		return result;
	}
}
