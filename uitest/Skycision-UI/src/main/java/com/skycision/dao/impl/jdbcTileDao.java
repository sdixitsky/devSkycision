package com.skycision.dao.impl;

import java.util.ArrayList;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.sql.DataSource;

import com.skycision.dao.TileDao;
import com.skycision.model.Tile;

public class jdbcTileDao implements TileDao{

    @SuppressWarnings("unused")
	private DataSource dataSource;
	private static Connection conn = null;
 // JDBC driver name and database URL
    static final String JDBC_DRIVER = "com.mysql.jdbc.Driver";  
    static final String DB_URL = "jdbc:mysql:///flightPlan";

    //  Database credentials
    static final String USER = "root";
    static final String PASS = "";
    
	public void setDataSource(DataSource dataSource) {
		this.dataSource = dataSource;
		
	}
	
	@Override
	public ArrayList<String> findFieldByFarmId(String farmId) {
		String sql = "SELECT DISTINCT fieldName FROM TILE WHERE farmId = "+ farmId;
		
		try {
			Class.forName(JDBC_DRIVER);
			conn = DriverManager.getConnection(DB_URL,USER,PASS);
			PreparedStatement ps = conn.prepareStatement(sql);
			ArrayList<String> result = new ArrayList<String>();
			ResultSet rs = ps.executeQuery();
			System.out.println("nushdisjdbfsksjdf" + rs);
			
			while (rs.next()) {
				System.out.println(rs.getString("fieldName"));
                result.add(rs.getString("fieldName"));
			}
			rs.close();
			ps.close();
			System.out.println(result);
			return result;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		} catch(Exception e1){
			throw new RuntimeException(e1);
		}finally {
			if (conn != null) {
				try {
				conn.close();
				} catch (SQLException e) {}
			}
		}
	}

	@Override
	public ArrayList<Tile> findTile(String farmId, String fieldName,
			String type,  String date, int altitude) {
        
		String sql = "SELECT * FROM TILE WHERE farmId = '"+ farmId + "' AND (fieldName = '"+ fieldName + "' AND (type = '" + type + "' AND (date = '" + date+ "' AND altitude = "+altitude + ")))";
		System.out.println("SSQQQQQQQQQQQ: " + sql);
		
		try {
			Class.forName(JDBC_DRIVER);
			conn = DriverManager.getConnection(DB_URL,USER,PASS);
			PreparedStatement ps = conn.prepareStatement(sql);
			ArrayList<Tile> tiles = new ArrayList<Tile>();
			
			ResultSet rs = ps.executeQuery();
			System.out.println("ksjhiububasdf" + rs);
			while (rs.next()) {
                Tile tile = new Tile();
                tile.setTileId(rs.getInt("tileId"));
                tile.setLat1(rs.getDouble("lat1"));
                tile.setLng1(rs.getDouble("lng1"));
                tile.setLat2(rs.getDouble("lat2"));
                tile.setLng2(rs.getDouble("lng2"));
                tile.setDate(rs.getString("date"));
                tile.setFarmId(rs.getString("farmId"));
                tile.setType(rs.getString("type"));
                tile.setThumbUrl(rs.getString("thumbUrl"));
                tile.setFullUrl(rs.getString("fullUrl"));
                tile.setFieldName(rs.getString("fieldName"));
                tile.setAltitude(rs.getInt("altitude"));
				tiles.add(tile);
			}
			rs.close();
			ps.close();
			return tiles;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		} catch(Exception e1){
			throw new RuntimeException(e1);
		}finally {
			if (conn != null) {
				try {
				conn.close();
				} catch (SQLException e) {}
			}
		}
	}

}
