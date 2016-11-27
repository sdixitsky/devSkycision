package com.skycision.farm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProviderAsyncClient;
import com.amazonaws.services.cognitoidp.model.SignUpRequest;
import com.amazonaws.services.cognitoidp.model.SignUpResult;
import com.skycision.flight.Flight;
import com.skycision.model.Latlng;
import com.skycision.model.ResourceManager;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateList;

@Controller
public class FarmController {
	private static final Logger		logger	= LoggerFactory.getLogger(FarmController.class);
	private static ResourceManager	rm		= ResourceManager.rm();

	private ResourceManager getRm() {
		if (rm == null)
			rm = ResourceManager.rm();

		return rm;
	}
	
	@RequestMapping(value={"/signup"}, method = RequestMethod.POST )
	@ResponseBody
	HashMap<String, Object> signUp(@RequestParam String username, @RequestParam String password) {
		
		AWSCognitoIdentityProviderAsyncClient userClient = new AWSCognitoIdentityProviderAsyncClient();
		
		userClient.setRegion(Region.getRegion(Regions.US_EAST_1));

		SignUpRequest signUpRequest = new SignUpRequest();
		signUpRequest.setUsername(username);
		signUpRequest.setPassword(password);
		
		String clientSecret = new String("rrckl9e1o2b3i89o0j0gipe319hni179e0guqis76rj6t9cp528");
		String clientId = new String("7mo4a915lb54feqfcdnc3a7rbu");
		
		signUpRequest.setClientId(clientId);
		
		Future<SignUpResult> futureResult = userClient.signUpAsync(signUpRequest);
		try {
			SignUpResult result = futureResult.get();
			result.setUserConfirmed(true);
		} catch (InterruptedException | ExecutionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
		
	}

	@SuppressWarnings("unused")
	@RequestMapping(value = { "/getTiles" }, method = RequestMethod.POST)
	@ResponseBody
	HashMap<String, Object> getTiles(@RequestBody HashMap<String, Object> request) {
		String farmId = request.get("farmId").toString();
		String fieldName = request.get("fieldName").toString();
		String type = request.get("imageType").toString();
		String dateString = request.get("date").toString().substring(0, 10);
		int altitude = Integer.valueOf(request.get("altitude").toString());
		HashMap<String, Object> result = new HashMap<String, Object>();
		/*
		 * ArrayList<HashMap<String, Object>> list =
		 * ResourceManager.rm().getTiles(fieldName, type, dateString, altitude);
		 * result.put("tiles", list);
		 */

		return result;
	}

	@RequestMapping(value = { "/loadFarm_2" }, method = RequestMethod.POST)
	@ResponseBody
	HashMap<String, Object> fetchTiles(@RequestBody HashMap<String, Object> request) {
		String farmId = request.get("farmId").toString();
		// String farmId = "us-east-1:5ed6eccc-249d-4c40-a991-1b14315311b4";

		ArrayList<HashMap<String, Object>> tiles = getRm().getTiles(farmId);

		HashMap<String, Object> result = new HashMap<String, Object>();
		result.put("batch", tiles);

		return result;
	}


	@RequestMapping(value = { "/storeFarmMobile" }, method = RequestMethod.POST)
	@ResponseBody
	JSONObject storeFarmMobile(@RequestBody org.json.simple.JSONObject json) {
		logger.info(json.toString());

		JSONObject result = ResourceManager.rm().storeFarmMobile(new JSONObject(json));
		return result;
	}
	
	/** The Constant responseHeaders. */
	private static final HttpHeaders responseHeaders = new HttpHeaders();
	static
	{
		final String ACCESS_CONTROL_ALLOW_ORIGIN_URL = "*";
		responseHeaders.add("Access-Control-Allow-Origin", ACCESS_CONTROL_ALLOW_ORIGIN_URL);
		responseHeaders.add("Access-Control-Allow-Methods", "POST,OPTIONS");
		responseHeaders.add("Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key");
	}
	public static ResponseEntity<Object> wrapHeaders(Object response)
	{	
		return new ResponseEntity<Object>(response, responseHeaders, HttpStatus.OK);
	}
	
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value={"/addField"}, method = RequestMethod.POST)
	@ResponseBody
	ResponseEntity<Object> addNewFields(@RequestBody org.json.simple.JSONObject body) {
		JSONObject input = new JSONObject(body);
		JSONArray fieldList = input.getJSONArray("fields");
		
		HashMap<String,Object> farm = new HashMap<String,Object>();
		farm.put("farmId",input.getString("farmId"));
		
		ArrayList<String> fieldNames = new ArrayList<String>();
		ArrayList<Flight> generatedFlightArray = new ArrayList<Flight>();
		for (int i = 0; i < fieldList.length(); i++) {
			JSONArray coordList = fieldList.getJSONObject(i).getJSONArray("boundary");
			fieldNames.add(fieldList.getJSONObject(i).getString("fieldName"));
			CoordinateList fieldBounds = new CoordinateList();
			for (int j = 0; j < coordList.length(); j++) {
				JSONObject coord = coordList.getJSONObject(j);
				double lat = coord.getDouble("lat");
				double lng = coord.getDouble("lng");
	
				fieldBounds.add(new Coordinate(lat, lng));
			}
				
			Flight newFlight = getRm().createBaseMesh(fieldBounds);
			generatedFlightArray.add(newFlight);
		}
		
		return wrapHeaders(buildFarmJson(generatedFlightArray, farm, fieldNames));
	}
	
//	@RequestMapping(value = { "/loadfarminfo" }, method = RequestMethod.POST)
//	@ResponseBody
//	ResponseEntity<Object> loadFarmJson(@RequestBody String farmId) {
//
//		// File jsonFile = new File();
//
//		String jsonTxt = "";
//		InputStream is;
//		try {
//			is = new FileInputStream(System.getProperty("user.home")
//					+ "/git/flightplanning/src/main/java/com/skycision/farm/testfarm.json");
//			jsonTxt = IOUtils.toString(is);
//		} catch (IOException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//			jsonTxt = e.toString();
//		}
//		HashMap<String, Object> json = buildFarmJson();
//		logger.info((new JSONObject(json).toString()));
//		return wrapHeaders(json);
//
//		// JSONObject json = new JSONObject(jsonTxt);
//		// logger.info(json.toString());
//		// return json.toString();
//	}


	public HashMap<String, Object> buildFarmJson(ArrayList<Flight> flightArray, 
			HashMap<String, Object> farm, ArrayList<String> fieldNames) {
		ArrayList<HashMap<String, Object>> fields = new ArrayList<HashMap<String, Object>>();
		
		int i = 0;
		for (Flight fp : flightArray) {
			HashMap<String, Object> field = new HashMap<String, Object>();
			
			field.put("fieldName", fieldNames.get(i));
			field.put("boundary", latLngListToJsonObject(fp.getBoundary()));

			field.put("heading", fp.getHeading());
			field.put("overlap", fp.getOverlap());
			
			HashMap<String,Object> imageDims = new HashMap<String,Object>();
			imageDims.put("height",fp.getImgHeight());
			imageDims.put("width",fp.getImgWidth());
			
			field.put("imageDims",imageDims);
			ArrayList<HashMap<String, Object>> emptyList = new ArrayList<HashMap<String, Object>>();

			ArrayList<HashMap<String, Object>> altitudes = new ArrayList<HashMap<String, Object>>();
			HashMap<String, Object> altitude = new HashMap<String, Object>();
			altitude.put("alt", 20);
			altitude.put("meshIndices", emptyList );
			altitudes.add(altitude);

			altitude = new HashMap<String, Object>();
			altitude.put("alt", 40);
			altitudes.add(altitude);

			altitude.put("meshIndices", emptyList);
			altitude = new HashMap<String, Object>();
			altitude.put("alt", 60);
			altitudes.add(altitude);

			altitude.put("meshIndices", emptyList);

			field.put("altitudes", altitudes);

			i++;

			if ( fp.getErrorEntity() != null ) {
				field.put("error", fp.getErrorEntity());
				field.put("baseMesh", field.get("boundary"));
			} else {
				field.put("baseMesh", latLngListToJsonObject(fp.getCoordinates()));
			}
			
			fields.add(field);
		}

		farm.put("fields", fields);
		return farm;
	}

	@SuppressWarnings("unused")
	private ArrayList<HashMap<String, Object>> coordinateListToJsonObject(Flight fp) {
		return latLngListToJsonObject(fp.getCoordinates());
	}

	private ArrayList<HashMap<String, Object>> latLngListToJsonObject(ArrayList<Latlng> cl) {
		ArrayList<HashMap<String, Object>> out = new ArrayList<HashMap<String, Object>>();
		int i = 0;
		for (Latlng c : cl) {
			HashMap<String, Object> cMap = new HashMap<String, Object>();
			cMap.put("lat", c.getLat());
			cMap.put("lng", c.getLng());
			cMap.put("ind", i);
			out.add(cMap);
			i++;
		}
		return out;
	}

}
