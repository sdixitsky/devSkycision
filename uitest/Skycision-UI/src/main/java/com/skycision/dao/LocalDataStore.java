package com.skycision.dao;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.FileImageOutputStream;

import org.json.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.skycision.farm.ImageType;

import javaxt.io.Image;

public class LocalDataStore implements DataStore {
	private static final Logger			logger	= LoggerFactory.getLogger(LocalDataStore.class);

	private static final String			JPG		= ".jpg";
	private File						inDir;
	private File						outDir;

	public LocalDataStore() {
		inDir = new File(getPath("IN_DIR"));
		outDir = new File(getPath("OUT_DIR"));
	}

	private String getPath(String envFolderName) {
		String path = System.getenv(envFolderName);
		if (path == null || path.isEmpty()) {
			path = System.getProperty("user.home") + "/Google Drive/Skycision/run/";
			switch (envFolderName) {
			case "IN_DIR":
			case "in_dir":
				path = path + "incoming/";
				break;
			case "OUT_DIR":
			case "out_dir":
				path = path + "data/";
				break;
			default:
				break;
			}
		}
		logger.info("Found root path: " + path);
		return path;
	}

	@Override
	public ArrayList<String> getFieldList(String farmId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ArrayList<HashMap<String, Object>> getTiles(String farmId) throws IOException, ParseException {

		HashMap<Integer, HashMap<String, Object>> batchesMap = new HashMap<Integer, HashMap<String, Object>>();
		// ArrayListresult = new
		// ArrayList<HashMap<String,Object>>();
		String outDir = getPath("OUT_DIR");
		logger.info("PATH:" + outDir);

		File farmDir = new File(outDir + farmId + "/");
		if (farmDir.isDirectory()) {

			File[] batchesNdvi = listFilesByExtension(farmDir, "_ndvi");
			File[] batchesRgb = listFilesByExtension(farmDir, "_rgb");
			int numBatches = batchesNdvi.length;

			for (int batchId = 1; batchId <= numBatches; batchId++) {
				HashMap<String, Object> batchMap = new HashMap<String, Object>();
				batchMap.put("batchId", batchId);
				batchMap.put("batchName", "Batch " + batchId);
				batchMap.put("heading",
						getHeading(new File(outDir + farmId + "/" + batchId + "_ndvi" + "/heading.txt")));

				for (File batch : batchesNdvi) {

					File[] files = listFilesByExtension(batch, ".json");

					ArrayList<HashMap<String, Object>> ndviList = new ArrayList<HashMap<String, Object>>();

					int imgID = 1;
					for (File jsonFile : files) {

						ArrayList<Double> bounds = getBoundsFromJson(jsonFile);

						HashMap<String, Object> ndviMap = new HashMap<String, Object>();
						ndviMap.put("id", imgID);
						imgID++;
						ndviMap.put("thumbUrl", (jsonFile.getName()).replace(".json", "_thumb.JPG"));
						ndviMap.put("fullUrl", (jsonFile.getName()).replace(".json", ".JPG"));
						ndviMap.put("lat1", bounds.get(0));
						ndviMap.put("lat2", bounds.get(1));
						ndviMap.put("lng1", bounds.get(2));
						ndviMap.put("lng2", bounds.get(3));

						ndviList.add(ndviMap);
					}
					batchMap.put("ndviList", ndviList);
				}
				batchesMap.put(batchId, batchMap);
			}

			numBatches = batchesRgb.length;
			for (int batchId = 1; batchId <= numBatches; batchId++) {
				HashMap<String, Object> batchMap = batchesMap.get(batchId);
				if (batchMap == null) {
					batchMap = new HashMap<String, Object>();
					batchesMap.put(batchId, batchMap);
					batchMap.put("batchId", batchId);
					batchMap.put("batchName", "Batch " + batchId);
					batchMap.put("heading",
							getHeading(new File(outDir + farmId + "/" + batchId + "_rgb" + "/heading.txt")));
				}

				for (File batch : batchesRgb) {

					File[] files = listFilesByExtension(batch, ".json");

					ArrayList<HashMap<String, Object>> rgbList = new ArrayList<HashMap<String, Object>>();

					int imgID = 1;
					for (File jsonFile : files) {

						ArrayList<Double> bounds = getBoundsFromJson(jsonFile);

						HashMap<String, Object> rgbMap = new HashMap<String, Object>();
						rgbMap.put("id", imgID);
						imgID++;
						rgbMap.put("thumbUrl", (jsonFile.getName()).replace(".json", "_thumb.JPG"));
						rgbMap.put("fullUrl", (jsonFile.getName()).replace(".json", ".JPG"));
						rgbMap.put("lat1", bounds.get(0));
						rgbMap.put("lat2", bounds.get(1));
						rgbMap.put("lng1", bounds.get(2));
						rgbMap.put("lng2", bounds.get(3));

						rgbList.add(rgbMap);
					}
					batchMap.put("rgbList", rgbList);
				}

			}

		}
		return new ArrayList<HashMap<String, Object>>(batchesMap.values());
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	private ArrayList<Double> getBoundsFromJson(File jsonFile) throws IOException, ParseException {
		JSONParser parser = new JSONParser();

		BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(jsonFile)));
		String s = "";
		StringBuilder jsonContent = new StringBuilder();
		while ((s = br.readLine()) != null) {
			jsonContent.append(s);
		}
		br.close();

		logger.info("JSONSTRING: " + jsonContent.toString());

		Object json = parser.parse(jsonContent.toString());
		JSONObject obj = (JSONObject) json;
		logger.info("parsed: " + obj.get("heading"));

		ArrayList<Double> bounds = (ArrayList<Double>) ((HashMap) json).get("bounds");

		return bounds;
	}

	@Override
	public Collection<ImageDescriptor> scanForImages() throws IOException {
		ArrayList<ImageDescriptor> scanList = new ArrayList<ImageDescriptor>();
		File[] farmList = listDirs(inDir);
		for (File farm : farmList) {
			logger.info("Found farm: " + farm.getAbsolutePath());
			File[] batchList = listDirs(farm);
			for (File batchDir : batchList)
				scanList.addAll(scanBatch(batchDir, farm, getBatchType(batchDir)));
		}
		logger.info("  Found batch: " + scanList);
		return scanList;
	}

	public ImageType getBatchType(File batchDir) {
		String typeName = batchDir.getName().toLowerCase();
		if (typeName.endsWith(ImageType.RGB.name().toLowerCase()))
			return ImageType.RGB;
		if (typeName.endsWith(ImageType.NDVI.name().toLowerCase()))
			return ImageType.NDVI;
		return null;
	}

	private List<ImageDescriptor> scanBatch(File batchInDir, File farmDir, ImageType batchType) throws IOException {
		File headingFile = new File(batchInDir, "heading.txt");
		if (!headingFile.exists()) {
			logger.error("No heading file found in batch: " + batchInDir.getAbsolutePath());
			return null;
		}

		int heading;
		List<ImageDescriptor> scanList = new ArrayList<ImageDescriptor>();
		heading = getHeading(headingFile);
		File batchOutDir = mkBatchOutDir(batchInDir, farmDir);
		Files.copy(headingFile.toPath(),
				new File(batchOutDir.getAbsolutePath() + File.separator + "heading.txt").toPath(),
				StandardCopyOption.REPLACE_EXISTING);
		File[] imageList = listFilesByExtension(batchInDir, JPG);

		for (File imgFile : imageList) {
			File imgOut = new File(batchOutDir.getAbsolutePath() + File.separator + imgFile.getName());

			if (imgOut.exists()) {
				// TODO: If JSON exists in batchOutDir, delete imgOut.
			} else {
				scanList.add(new ImageDescriptor(this).withImage(new Image(imgFile.toString()))
						.withInputURI(imgFile.getAbsolutePath()).withType(batchType)
						.withOutputURI(imgOut.getAbsolutePath()).withHeading(heading));
			}

			logger.info("     Found image: " + imgFile.getAbsolutePath());
		}

		return scanList;
	}

	private int getHeading(File headingFile) throws IOException {
		int heading = -1;
		BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(headingFile)));
		String headingStr = br.readLine();
		if (headingStr != null)
			heading = Integer.parseInt(headingStr);
		br.close();

		logger.info("     Found camera heading: " + heading);
		return heading;
	}

	private File mkBatchOutDir(File batchDir, File farmDir) {
		String batchName = batchDir.getName();
		String farmName = farmDir.getName();
		File batchOutDir = new File(outDir, farmName);
		if (!batchOutDir.exists())
			batchOutDir.mkdir();
		batchOutDir = new File(batchOutDir, batchName);
		if (!batchOutDir.exists())
			batchOutDir.mkdir();
		logger.info("Creating dir: " + batchOutDir.getAbsolutePath());
		return batchOutDir;
	}

	private File[] listFilesByExtension(File theDir, String extension) {
		File[] list = theDir.listFiles(new FilenameFilter() {
			public boolean accept(File f, String name) {
				return name.toLowerCase().endsWith(extension.toLowerCase());
			}
		});
		return list;
	}

	private File[] listDirs(File theDir) {
		return theDir.listFiles(new FileFilter() {
			@Override
			public boolean accept(File file) {
				return file.isDirectory();
			}
		});
	}

	private String modifyPath(String path, String extension, String suffix) {
		if (path.contains(extension))
			path = path.replace(extension, suffix + extension);
		else if (path.contains(extension.toLowerCase()))
			path = path.replace(extension.toLowerCase(), suffix + extension.toLowerCase());
		return path;
	}

	public void copy(String inputURI, String outputURI) throws IOException {
		Files.copy(new File(inputURI).toPath(), new File(outputURI).toPath());
	}

	/**
	 * Loads a color scale from a csv file Column 0: integer representing the
	 * NDVI value (0-255) Column 1: integer of the corresponding Red value
	 * (0-255) Column 2: integer of the corresponding Green value (0-255) Column
	 * 3: integer of the corresponding Blue value (0-255)
	 * 
	 * @param path
	 *            Path to the color scale file
	 * @return A Map representing the color scale
	 * @throws Exception
	 *             If the file is not found
	 */
	@Deprecated
	public Map<Integer, int[]> loadScaleFromFile(String path) throws Exception {
		HashMap<Integer, int[]> scale = new HashMap<Integer, int[]>();
		BufferedReader br = new BufferedReader(new FileReader(path));
		String line = new String();
		while ((line = br.readLine()) != null) {
			String[] parts = line.split(",");
			int[] rgb = { Integer.parseInt(parts[1]), Integer.parseInt(parts[2]), Integer.parseInt(parts[3]) };
			scale.put(Integer.parseInt(parts[0]), rgb);
		}
		br.close();
		return scale;
	}

	@Override
	public void copy(ImageDescriptor imgDesc) throws IOException {
		copy(imgDesc.getInputURI(), imgDesc.getOutputURI());
	}

	@Override
	public void move(ImageDescriptor imgDesc) {
		// TODO Auto-generated method stub

	}

	@Override
	public void store(ImageDescriptor desc) throws IOException {
		File outFile = new File(desc.getOutputURI());
		ImageIO.write(desc.getBufferedImage(), "jpg", outFile);
		logger.info("		Storing Fullsize: " + outFile);

		JSONObject json = desc.getJSON();
		File jsonFile = new File(desc.getOutputURI().replaceAll(".JPG", ".json"));
		FileWriter jsonWriter = new FileWriter(jsonFile);
		BufferedWriter bw = new BufferedWriter(jsonWriter);
		bw.write(json.toString());
		bw.close();
		logger.info("		Storing JSON: " + jsonFile);

		File thumbFile = new File(modifyPath(desc.getOutputURI(), ".JPG", "_thumb"));
		ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
		ImageWriteParam param = writer.getDefaultWriteParam();
		param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT); // Needed
																	// see
																	// javadoc
		param.setCompressionQuality(0.4F); // Highest quality

		FileImageOutputStream thumbOut = new FileImageOutputStream(thumbFile);
		writer.setOutput(thumbOut);
		writer.write(desc.getThumbnail());
		thumbOut.close();
		logger.info("		Storing thumbnail: " + thumbFile);
	}

	@Override
	public ImageDescriptor read(String inputURI) {
		// TODO Auto-generated method stub
		return null;
	}
	
	@SuppressWarnings("unused")
	private FileOutputStream createOutputStream(String outFile) throws FileNotFoundException {
		return new FileOutputStream(outFile);
	}

	@Override
	public void loadImage(ImageDescriptor imageDescriptor) {
		imageDescriptor.withImage(new Image(imageDescriptor.getInputURI()));
	}

	@Override
	public ImageDescriptor createDescriptorFromKey(String key) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HashMap<String, Object> getClients(String cognitoId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int addPartner(String partnerId, String[] splitIds) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public org.json.JSONObject storeFarmMobile(org.json.JSONObject json) {
		// TODO Auto-generated method stub
		return null;
	}
}
