package com.skycision.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Set;

import com.skycision.farm.ImageType;

public class Farm {

	private LinkedHashMap<Integer, ArrayList<String>> rgbTileMap = new LinkedHashMap<Integer, ArrayList<String>>();
	private LinkedHashMap<Integer, String> rgbHeadingFiles = new LinkedHashMap<Integer, String>();

	private LinkedHashMap<Integer, ArrayList<String>> ndviTileMap = new LinkedHashMap<Integer, ArrayList<String>>();
	private LinkedHashMap<Integer, String> ndviHeadingFiles = new LinkedHashMap<Integer, String>();

	public void addTile(ImageType imageType, int batchId, String tileURI) {
		LinkedHashMap<Integer, ArrayList<String>> tileMap = imageType == ImageType.RGB ? rgbTileMap : ndviTileMap;
		ArrayList<String> tileList = tileMap.get(batchId);
		if (tileList == null) {
			tileList = new ArrayList<String>();
			tileMap.put(batchId, tileList);
		}
		tileList.add(tileURI);
	}

	public void addHeadingFile(ImageType imageType, Integer batchId, String key) {
		LinkedHashMap<Integer, String> headingMap = imageType == ImageType.RGB ? rgbHeadingFiles : ndviHeadingFiles;
		headingMap.put(batchId, key);
	}

	public Set<Integer> getBatches(ImageType imageType) {
		LinkedHashMap<Integer, ArrayList<String>> tileMap = imageType == ImageType.RGB ? rgbTileMap : ndviTileMap;
		return tileMap.keySet();
	}

	public ArrayList<String> getTilesByBatchId(ImageType imageType, Integer batchId) {
		LinkedHashMap<Integer, ArrayList<String>> tileMap = imageType == ImageType.RGB ? rgbTileMap : ndviTileMap;
		return tileMap.get(batchId);
	}
	
    public String getHeadingURI(ImageType imageType, Integer batchId)
    {
		LinkedHashMap<Integer, String> headingMap = imageType == ImageType.RGB ? rgbHeadingFiles : ndviHeadingFiles;
		return headingMap.get(batchId);
    }
}
