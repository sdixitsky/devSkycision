package com.skycision.dao;

import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.AmazonClientException;
import com.amazonaws.services.cognitosync.AmazonCognitoSyncClient;
import com.amazonaws.services.cognitosync.model.ListRecordsRequest;
import com.amazonaws.services.cognitosync.model.Record;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.event.S3EventNotification;
import com.amazonaws.services.s3.event.S3EventNotification.S3EventNotificationRecord;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ListObjectsRequest;
import com.amazonaws.services.s3.model.ObjectListing;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.amazonaws.services.simpledb.AmazonSimpleDBClient;
import com.amazonaws.services.simpledb.model.Attribute;
import com.amazonaws.services.simpledb.model.GetAttributesRequest;
import com.amazonaws.services.simpledb.model.GetAttributesResult;
import com.amazonaws.services.simpledb.model.PutAttributesRequest;
import com.amazonaws.services.simpledb.model.ReplaceableAttribute;
import com.amazonaws.services.sqs.AmazonSQSClient;
import com.amazonaws.services.sqs.model.ChangeMessageVisibilityBatchRequest;
import com.amazonaws.services.sqs.model.ChangeMessageVisibilityBatchRequestEntry;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.amazonaws.services.sqs.model.ReceiveMessageResult;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skycision.farm.ImageType;
import com.skycision.model.Farm;
import com.vividsolutions.jts.geom.CoordinateList;

import javaxt.io.Image;

public class S3DataStore implements DataStore {
	private static final String	FARM_JSON				= "farm.json";
	private static final String	ID_POOL					= "us-east-1:15eec0e9-05d9-47d1-9fe6-a344788eed1d";
	private static final String	SKYCISION_PARTNERS		= "skycisionPartners";
	private static final String	INCOMING_IMAGE_QUEUE	= "IncomingImageQueue";
	private static final String	DROP_BUCKET				= "skycisiondropbucket";
	private static final String	DATA_BUCKET				= "skycisiondatabucket";
	private static final String	FARM_BUCKET				= "skycisionfarmbucket";
	private static final String	DELIMITER				= "/";
	private static final Logger	logger					= LoggerFactory.getLogger(S3DataStore.class);
	private final JsonFactory	factory					= new JsonFactory();
	AmazonS3Client				s3Client				= new AmazonS3Client();
	AmazonSQSClient				sqsClient				= new AmazonSQSClient();
	AmazonSimpleDBClient		sdbClient				= new AmazonSimpleDBClient();
	AmazonCognitoSyncClient		cogClient				= new AmazonCognitoSyncClient();
	private CoordinateList		fieldCoords;

	public S3DataStore() {
	}

	@Override
	public ArrayList<String> getFieldList(String farmId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ArrayList<HashMap<String, Object>> getTiles(String farmId) throws IOException {
		// Date expiration = buildLinkExpiration();
		Farm farmListing = listFarm(farmId);

		LinkedHashMap<Integer, HashMap<String, Object>> tmpMap = new LinkedHashMap<Integer, HashMap<String, Object>>();

		for (ImageType imageType : ImageType.values()) {
			for (Integer batchId : farmListing.getBatches(imageType)) {
				HashMap<String, Object> batchMap = tmpMap.get(batchId);
				if (batchMap == null) {
					batchMap = new HashMap<String, Object>();
					tmpMap.put(batchId, batchMap);
				}
				batchMap.put("batchId", batchId);
				batchMap.put("batchName", "Batch " + batchId);

				double minLat = 1000;
				double maxLat = -1000;
				double minLon = 1000;
				double maxLon = -1000;

				int imgID = 1;
				ArrayList<Map<String, Object>> typeList = new ArrayList<Map<String, Object>>();
				for (String fullKey : farmListing.getTilesByBatchId(imageType, batchId)) {
					
					if(fullKey.endsWith("_small.JPG")){
						continue;
					}
					
					String thumbKey = fullKey.replace(".JPG", "_thumb.JPG");
					
					
					Map<String, String> thumbMeta = (s3Client.getObjectMetadata(DATA_BUCKET, thumbKey))
							.getUserMetadata();
					HashMap<String, Object> typeMap = new HashMap<String, Object>();
					typeMap.put("id", imgID++);

					double lat1 = Double.parseDouble(thumbMeta.get("lat1"));
					double lat2 = Double.parseDouble(thumbMeta.get("lat2"));
					double lon1 = Double.parseDouble(thumbMeta.get("lng1"));
					double lon2 = Double.parseDouble(thumbMeta.get("lng2"));

					if (lat1 < minLat)
						minLat = lat1;
					if (lat2 > maxLat)
						maxLat = lat2;
					if (lon1 < minLon)
						minLon = lon1;
					if (lon2 > maxLon)
						maxLon = lon2;
					
					if (batchId == 3 || batchId == 4 ) {
						String smallKey = fullKey.replace(".JPG", "_small.JPG");
						typeMap.put("smallKey", smallKey);
					}
					typeMap.put("thumbKey", thumbKey);
					typeMap.put("fullKey", fullKey);
					
					typeMap.put("lat1", lat1);
					typeMap.put("lat2", lat2);
					typeMap.put("lng1", lon1);
					typeMap.put("lng2", lon2);
					typeMap.put("heading", Double.parseDouble(thumbMeta.get("heading")));
					typeList.add(typeMap);
				}
				batchMap.put("batchLat", (minLat + maxLat) / 2);
				batchMap.put("batchLon", (minLon + maxLon) / 2);
				batchMap.put(imageType == ImageType.NDVI ? "ndviList" : "rgbList", typeList);
			}
		}
		
		ArrayList<HashMap<String, Object>> hm = new ArrayList<HashMap<String, Object>>(tmpMap.values());
		
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		ObjectMapper mapper = new ObjectMapper();
		mapper.writeValue(out,hm);
		
		ObjectMetadata meta = new ObjectMetadata();
		byte[] bytes = out.toByteArray();
		out.flush();
		ByteArrayInputStream in = new ByteArrayInputStream(bytes);
		meta.setContentLength(bytes.length);
		PutObjectRequest req = new PutObjectRequest(DATA_BUCKET, farmId+DELIMITER+"tiles.json",in,meta);
		s3Client.putObject(req);
		return hm;
	}

	private Date buildLinkExpiration() {
		Calendar cal = Calendar.getInstance(); // creates calendar
		cal.setTime(new Date()); // sets calendar time/date
		cal.add(Calendar.HOUR_OF_DAY, 1); // adds one hour
		return cal.getTime(); // returns new date object, one hour in the
								// future;
	}

	private Farm listFarm(String farmId) {

		final String farmSuffix = farmId + DELIMITER;
		final String ndviSuffix = "_ndvi" + DELIMITER;
		final String rgbSuffix = "_rgb" + DELIMITER;
		final String thumbSuffix = "_thumb.JPG";
		final String headingSuffix = "heading.txt";
		Farm farm = new Farm();

		ListObjectsRequest listObjectsRequest = new ListObjectsRequest().withBucketName(DATA_BUCKET)
				.withPrefix(farmId + DELIMITER);// .withDelimiter(DELIMITER);
		ObjectListing objectListing = s3Client.listObjects(listObjectsRequest);

		List<S3ObjectSummary> objectSummaries = objectListing.getObjectSummaries();

		for (S3ObjectSummary objectSummary : objectSummaries) {
			String key = objectSummary.getKey();
			// logger.debug("Key: " + key);
			if (key.endsWith(farmSuffix) || key.endsWith(ndviSuffix) || key.endsWith(rgbSuffix))
				continue;
			if (key.contains(ndviSuffix)) {
				if (key.endsWith(thumbSuffix))
					continue;
				if (key.endsWith("JPG"))
					farm.addTile(ImageType.NDVI, extractBatchId(key), key);
				else if (key.endsWith(headingSuffix))
					farm.addHeadingFile(ImageType.NDVI, extractBatchId(key), key);
			} else if (key.contains(rgbSuffix)) {
				if (key.endsWith(thumbSuffix))
					continue;
				if (key.endsWith("JPG"))
					farm.addTile(ImageType.RGB, extractBatchId(key), key);
				else if (key.endsWith(headingSuffix))
					farm.addHeadingFile(ImageType.RGB, extractBatchId(key), key);
			}
		}
		logger.info("listFarm return statement");
		return farm;
	}

	private int extractBatchId(String key) {
		final String split = key.split(DELIMITER)[1];
		return Integer.parseInt(split.substring(0, split.indexOf("_")));
	}

	@Deprecated
	@SuppressWarnings("unused")
	private HashMap<String, Object> populateBatchMap(HashMap<String, Object> batchMap, HashSet<String> batchesOfType,
			ImageType type, Date expiration) {
		for (String batch : batchesOfType) {
			logger.info("PopulateBatchMap batch: " + batch);
			HashSet<String> files = listS3DirsByExtension(DATA_BUCKET, batch, "_thumb.JPG");

			ArrayList<HashMap<String, Object>> typeList = new ArrayList<HashMap<String, Object>>();

			int imgID = 1;
			for (String thumbKey : files) {
				String fullKey = thumbKey.replace("_thumb.JPG", ".JPG");
				Map<String, String> thumbMeta = (s3Client.getObjectMetadata(DATA_BUCKET, thumbKey)).getUserMetadata();
				logger.info(thumbMeta.get("lat1"));

				HashMap<String, Object> typeMap = new HashMap<String, Object>();
				typeMap.put("id", imgID);
				imgID++;
				typeMap.put("thumbUrl", s3Client.generatePresignedUrl(DATA_BUCKET, thumbKey, expiration));
				typeMap.put("fullUrl", s3Client.generatePresignedUrl(DATA_BUCKET, fullKey, expiration));
				typeMap.put("lat1", Double.parseDouble(thumbMeta.get("lat1")));
				typeMap.put("lat2", Double.parseDouble(thumbMeta.get("lat2")));
				typeMap.put("lng1", Double.parseDouble(thumbMeta.get("lng1")));
				typeMap.put("lng2", Double.parseDouble(thumbMeta.get("lng2")));
				typeMap.put("heading", Integer.parseInt(thumbMeta.get("heading")));

				typeList.add(typeMap);
			}
			if (type == ImageType.NDVI) {
				batchMap.put("ndviList", typeList);
			} else if (type == ImageType.RGB) {
				batchMap.put("rgbList", typeList);
			}
		}
		return batchMap;
	}

	private HashSet<String> listS3DirsByExtension(String dataBucket, String path, String ext) {
		// TODO Auto-generated method stub
		String delimiter = DELIMITER;
		if (ext.endsWith("JPG"))
			delimiter = "";

		HashSet<String> allDirs = listS3Directories(dataBucket, path, delimiter);
		HashSet<String> outDirs = new HashSet<String>();
		for (String dir : allDirs) {
			logger.info("allDirs: " + dir);
			if (dir.endsWith(ext)) {
				outDirs.add(dir);
				logger.info("matchingDir: " + dir);
			}
		}
		return outDirs;
	}

	@Override
	public Collection<ImageDescriptor> scanForImages() {

		String queueUrl = sqsClient.getQueueUrl(INCOMING_IMAGE_QUEUE).getQueueUrl();
		ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest(queueUrl).withMaxNumberOfMessages(10)
				.withWaitTimeSeconds(10);

		ArrayList<ImageDescriptor> descriptors = new ArrayList<ImageDescriptor>();

		ReceiveMessageResult result = sqsClient.receiveMessage(receiveMessageRequest);
		if (result.getMessages().isEmpty()) {
			return descriptors;
		}

		ArrayList<ChangeMessageVisibilityBatchRequestEntry> batchEntries = new ArrayList<ChangeMessageVisibilityBatchRequestEntry>();
		if (!result.getMessages().isEmpty()) {
			List<Message> messages = result.getMessages();
			for (Message message : messages) {

				S3EventNotification notification = S3EventNotification.parseJson(message.getBody());
				List<S3EventNotificationRecord> records = notification.getRecords();
				
				if (records.isEmpty()) {
					return descriptors;
				}
				
				HashSet<String> inList = new HashSet<String>(10,1);
					
				for (S3EventNotificationRecord record : records) {
					String key;
					try {
						key = URLDecoder.decode(record.getS3().getObject().getKey(), "UTF-8");
						if (!inList.contains(key)) {
							inList.add(key);
							ImageDescriptor desc = createDescriptorFromKey(key).withSqsMessage(message)
									.withQueueUrl(queueUrl);
							descriptors.add(desc);
							logger.info("{} found in Queue", key);
							ChangeMessageVisibilityBatchRequestEntry entry = new ChangeMessageVisibilityBatchRequestEntry(
									key.replace("/", "-").replace(".", "-").replace(":", "-"), message.getReceiptHandle());
							batchEntries.add(entry);
						}
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
		}

		ChangeMessageVisibilityBatchRequest batchRequest = new ChangeMessageVisibilityBatchRequest(queueUrl,
				batchEntries);
		sqsClient.changeMessageVisibilityBatch(batchRequest);

		return descriptors;
	}

	@Deprecated
	public Collection<ImageDescriptor> scanForImages_() {

		logger.info("\n\n\tSCAN STARTED - S3 DATASTORE\n\n");

		ArrayList<ImageDescriptor> scanList = new ArrayList<ImageDescriptor>();

		try {
			String rootPrefix = "";
			HashSet<String> farmListing = listS3Directories(DROP_BUCKET, rootPrefix, DELIMITER);

			for (String farm : farmListing) {
				HashSet<String> batchListing = listS3Directories(DROP_BUCKET, farm, DELIMITER);

				for (String batch : batchListing) {
					HashSet<String> fileListing = listS3Files(DROP_BUCKET, batch);

					ImageType batchType = ImageType.RGB;

					if (batch.contains("ndvi")) {
						batchType = ImageType.NDVI;
					} else if (batch.contains("rgb")) {
						batchType = ImageType.RGB;
					}

					// logger.info("\nBATCH: "+batch);
					int heading = getHeading(DROP_BUCKET, batch);
					logger.info("heading found: " + heading);
					if (heading != -1) {
						s3Client.copyObject(DROP_BUCKET, batch + "heading.txt", DATA_BUCKET, batch + "heading.txt");

						for (String file : fileListing) {
							// System.out.println(" Farm: " + farm + "| Batch: "
							// + batch + "| File: " + file);

							if (file.endsWith(".JPG")) {
								// Image imageFromS3 =
								// getImageFromS3(DROP_BUCKET, file);

								scanList.add(new ImageDescriptor(this).withInputURI(file).withBucket(DROP_BUCKET)
										.withOutputURI(file).withType(batchType).withHeading(heading));

								logger.info("     Found image: " + file);
							}
						}
					}
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		logger.info("scanlist has {} entries", scanList.size());
		return scanList;
	}

	private int getHeading(String bucketName, String key) throws IOException {
		int heading = -1;
		logger.info("heading file URI:" + key);

		S3Object headingFile = s3Client.getObject(bucketName, key);
		S3ObjectInputStream content = headingFile.getObjectContent();
		BufferedReader br = new BufferedReader(new InputStreamReader(content));
		String str = br.readLine();
		logger.info("HEADING STRING: " + str);
		heading = Integer.parseInt(str);
		br.close();

		logger.info("\nHEADING: " + heading);
		return heading;
	}

	private Image getImageFromS3(String bucket, String key) throws IOException {
		S3Object imgObj = s3Client.getObject(bucket, key);
		S3ObjectInputStream content = imgObj.getObjectContent();

		ByteArrayOutputStream buffer = new ByteArrayOutputStream();
		IOUtils.copyLarge(content, buffer);
		content.close();
		Image image = new Image(buffer.toByteArray());

		return image;
	}

	private HashSet<String> listS3Directories(String bucketName, String prefix, String delimiter) {
		if (!prefix.endsWith(delimiter) && prefix != "") {
			prefix += delimiter;
		}

		ListObjectsRequest listObjectsRequest = new ListObjectsRequest().withBucketName(bucketName).withPrefix(prefix)
				.withDelimiter(delimiter);
		ObjectListing objects = s3Client.listObjects(listObjectsRequest);
		return new HashSet<String>(objects.getCommonPrefixes());
	}

	private HashSet<String> listS3Files(String bucketName, String prefix) {
		ListObjectsRequest listObjectsRequest = new ListObjectsRequest().withBucketName(bucketName).withPrefix(prefix);
		ObjectListing objects = s3Client.listObjects(listObjectsRequest);

		ArrayList<String> keyList = new ArrayList<String>();
		for (S3ObjectSummary sum : objects.getObjectSummaries()) {
			if (!sum.getKey().endsWith(DELIMITER)) {
				keyList.add(sum.getKey());
			}
		}

		return new HashSet<String>(keyList);
	}

	/*
	 * @Override public void run() { boolean done = false; while (!done) {
	 * scanForImages(); try { Thread.sleep(300000); } catch
	 * (InterruptedException e) { done = true; } } }
	 */
	@Override
	public void copy(ImageDescriptor desc) {
		// TODO Auto-generated method stub

	}

	@Override
	public void move(ImageDescriptor desc) {
		// TODO Auto-generated method stub

	}

	@Override
	public void store(ImageDescriptor desc) throws IOException {
		ArrayList<Double> bounds = desc.getBounds();

		ObjectMetadata thumbMeta = new ObjectMetadata();
		thumbMeta.addUserMetadata("lat1", bounds.get(0).toString());
		thumbMeta.addUserMetadata("lat2", bounds.get(1).toString());
		thumbMeta.addUserMetadata("lng1", bounds.get(2).toString());
		thumbMeta.addUserMetadata("lng2", bounds.get(3).toString());
		thumbMeta.addUserMetadata("heading", ((Double) desc.getHeading()).toString());
		thumbMeta.setContentType("image/jpeg");

		ByteArrayOutputStream osThumb = new ByteArrayOutputStream();
		ImageIO.write(desc.getThumbnail(), "JPG", osThumb);
		byte[] buffer = osThumb.toByteArray();
		thumbMeta.setContentLength(buffer.length);
		ByteArrayInputStream thumbStream = new ByteArrayInputStream(buffer);
		PutObjectRequest thumbRequest = new PutObjectRequest(DATA_BUCKET,
				desc.getOutputURI().replace(".JPG", "_thumb.JPG"), thumbStream, thumbMeta);
		s3Client.putObject(thumbRequest);

		ObjectMetadata fullMeta = new ObjectMetadata();

		ByteArrayOutputStream osFull = new ByteArrayOutputStream();
		ImageIO.write(desc.getBufferedImage(), "JPG", osFull);
		byte[] bufferFull = osFull.toByteArray();
		fullMeta.setContentLength(bufferFull.length);
		fullMeta.setContentType("image/jpeg");
		ByteArrayInputStream fullStream = new ByteArrayInputStream(bufferFull);
		PutObjectRequest fullImgRequest = new PutObjectRequest(DATA_BUCKET, desc.getOutputURI(), fullStream, fullMeta);
		s3Client.putObject(fullImgRequest);

		sqsClient.deleteMessage(desc.getQueueUrl(), desc.getSqsMessage().getReceiptHandle());
	}

	@Override
	public ImageDescriptor read(String inputURI) {
		// TODO Auto-generated method stub
		return null;
	}

	@SuppressWarnings("unused")
	@Deprecated
	private ByteArrayInputStream getStream(BufferedImage image) {

		byte[] buffer = ((DataBufferByte) (image).getRaster().getDataBuffer()).getData();

		ByteArrayInputStream inputStream = new ByteArrayInputStream(buffer);
		return inputStream;
	}

	@SuppressWarnings("unused")
	@Deprecated
	private String modifyPath(String path, String extension, String suffix) {
		if (path.contains(extension))
			path = path.replace(extension, suffix + extension);
		else if (path.contains(extension.toLowerCase()))
			path = path.replace(extension.toLowerCase(), suffix + extension.toLowerCase());
		return path;
	}

	@Override
	public void loadImage(ImageDescriptor imageDescriptor) {
		try {
			imageDescriptor.withImage(getImageFromS3(imageDescriptor.getBucket(), imageDescriptor.getInputURI()));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public ImageDescriptor createDescriptorFromKey(String key) {
		Map<String, String> imageMeta = (s3Client.getObjectMetadata(DROP_BUCKET, key)).getUserMetadata();
		ImageType type;
		if (imageMeta.get("imagetype").equals("ndvi")) {
			type = ImageType.NDVI;
		} else {
			type = ImageType.RGB;
		}
		
		double heading = Double.parseDouble(imageMeta.get("heading"));
//		double altitude = Double.parseDouble(imageMeta.get("altitude"));
//		double latitude = Double.parseDouble(imageMeta.get("lat"));
//		double longitude = Double.parseDouble(imageMeta.get("lng"));

		return new ImageDescriptor(this)
									.withInputURI(key)
									.withOutputURI(key)
									.withHeading(heading)
									.withType(type)
//									.withAltitude(altitude)
//									.withLatitude(latitude)
//									.withLongitude(longitude)
									.withBucket(DROP_BUCKET)
									.withKey(key);
	}

	// shopping, Partner
	// private static final String partner1 =
	// "us-east-1:733d851e-529b-4a67-be0b-0a3a462812fb";
	// brendan, partner
	// private static final String partner2 =
	// "us-east-1:afc17d30-f5c3-4f12-882d-63aa2b951ba6";

	// alec.assaad@gmail.com
	private static final String	newPartner	= "us-east-1:bea672d8-a746-4a94-98b4-c84481931c64";

	// jiazi.wu@skycision.com, HundleyFarms
	private static final String	client1		= "us-east-1:2d0ad3b2-bca8-4bea-87ff-ae7ea664b945";
	// wujiazi213, Sugar Cane
	private static final String	client2		= "us-east-1:5ed6eccc-249d-4c40-a991-1b14315311b4";
	// alec.assaad@gmail.com, TKM Farms
	private static final String	client3		= "us-east-1:bea672d8-a746-4a94-98b4-c84481931c64";

	@Override
	public HashMap<String, Object> getClients(String cognitoId) {

		GetAttributesRequest getAttributesRequest = new GetAttributesRequest(SKYCISION_PARTNERS, cognitoId);
		GetAttributesResult attributesResult = sdbClient.getAttributes(getAttributesRequest);

		logger.info(attributesResult.toString());

		HashMap<String, Object> result = new HashMap<String, Object>();
		if (!attributesResult.getAttributes().isEmpty()) {
			List<Attribute> attributes = attributesResult.getAttributes();
			ArrayList<HashMap<String, Object>> clients = new ArrayList<HashMap<String, Object>>();
			for (Attribute a : attributes) {
				logger.info(a.getName() + " " + a.getValue());
				if (a.getName().startsWith("client")) {

					ListRecordsRequest request = new ListRecordsRequest().withIdentityId(a.getValue())
							.withIdentityPoolId(ID_POOL).withDatasetName("profile");
					List<Record> records = cogClient.listRecords(request).getRecords();

					String farmName = a.getName();
					String farmId = a.getValue();

					for (Record r : records) {
						if (r.getKey().equals("farmName")) {
							farmName = r.getValue();
						}
					}

					clients.add(makeClientMap(farmId, farmName));
				}
			}
			if (!clients.isEmpty()) {
				result.put("clients", clients);
			}
		}

		return result;
	}

	private HashMap<String, Object> makeClientMap(String id, String name) {
		HashMap<String, Object> clientMap = new HashMap<String, Object>();
		clientMap.put("clientId", id);
		clientMap.put("clientName", name);
		return clientMap;
	}

	@Override
	public int addPartner(String partnerId, String[] clientIds) {
		logger.info("partnerId: " + partnerId + " clientIds: " + clientIds.toString());

		ListRecordsRequest request = new ListRecordsRequest().withIdentityId(partnerId).withIdentityPoolId(ID_POOL)
				.withDatasetName("profile");
		List<Record> records = cogClient.listRecords(request).getRecords();

		String email = partnerId;

		for (Record r : records) {
			if (r.getKey().equals("email")) {

				email = r.getKey().isEmpty() ? partnerId : r.getKey();
			}
		}

		try {
			if (System.getProperty("os.name") != "linux") {
				// if (sdbClient.listDomains().getDomainNames().isEmpty()) {
				// CreateDomainRequest createDomainRequest = new
				// CreateDomainRequest(SKYCISION_PARTNERS);
				// sdbClient.createDomain(createDomainRequest);
				// }
				ArrayList<ReplaceableAttribute> coll1 = new ArrayList<ReplaceableAttribute>();

				ReplaceableAttribute attribute1 = new ReplaceableAttribute("Name", email, true);
				coll1.add(attribute1);

				for (int i = 0; i < clientIds.length; i++) {
					String clientId = clientIds[i];
					logger.info("client id added: " + clientId);
					String name = "client";
					ReplaceableAttribute attr = new ReplaceableAttribute(name, clientId, true);
					coll1.add(attr);
				}

				PutAttributesRequest batch = new PutAttributesRequest().withDomainName(SKYCISION_PARTNERS)
						.withItemName(partnerId).withAttributes(coll1);
				sdbClient.putAttributes(batch);

				return 1;
			}

			return 0;

		} catch (Exception e) {
			e.printStackTrace();
			return -1;
		}
	}

	@Override
	public JSONObject storeFarmMobile(JSONObject jsonIn) {
		String farmId = jsonIn.getString("farmId");

		ListObjectsRequest listRequest = new ListObjectsRequest().withBucketName(FARM_BUCKET).withDelimiter(DELIMITER)
				.withPrefix(farmId);
		ObjectListing listing = s3Client.listObjects(listRequest);

		HashMap<String, String> temp = new HashMap<String, String>();
		temp.put("error", "jsonFinal not overwritten");
		JSONObject jsonFinal = new JSONObject(temp);

		if (listing.getObjectSummaries().size() == 1) {

			String key = listing.getObjectSummaries().get(0).getKey();

			if (key.endsWith(FARM_JSON)) {

				GetObjectRequest getObjectRequest = new GetObjectRequest(FARM_BUCKET, key);
				S3ObjectInputStream content = s3Client.getObject(getObjectRequest).getObjectContent();
				JSONObject jsonRemote = null;

				try {
					JsonParser parser = factory.createParser(content);
					jsonRemote = parser.readValueAs(JSONObject.class);
					content.release();
				} catch (AmazonClientException | IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					return new JSONObject(e.getStackTrace().toString());
				}

				jsonFinal = deepMerge(jsonIn, jsonRemote);
				storeJson(jsonFinal, FARM_BUCKET, key);
			}
		} else if (listing.getObjectSummaries().size() == 0 || listing.equals(null)) {
			jsonFinal = jsonIn;
			storeJson(jsonFinal, FARM_BUCKET, farmId + DELIMITER + FARM_JSON);
		}
		return jsonFinal;
	}

	private void storeJson(JSONObject json, String bucket, String key) {
		byte[] bytes = json.toString().getBytes();
		ObjectMetadata thumbMeta = new ObjectMetadata();
		thumbMeta.setContentType("application/json");
		thumbMeta.setContentLength(bytes.length);
		ByteArrayInputStream thumbStream = new ByteArrayInputStream(bytes);
		s3Client.putObject(new PutObjectRequest(bucket, key, thumbStream, thumbMeta));
	}

	/**
	 * Merge "source" into "target". If fields have equal name, merge them
	 * recursively.
	 * 
	 * @return the merged object (target).
	 */
	private JSONObject deepMerge(JSONObject source, JSONObject target) throws JSONException {
		for (String key : JSONObject.getNames(source)) {
			Object value = source.get(key);
			if (!target.has(key)) {
				// new value for "key":
				target.put(key, value);
			} else {
				// existing value for "key" - recursively deep merge:
				if (value instanceof JSONObject) {
					if (target.optJSONArray(key) != null) {
						target.optJSONArray(key).put(value);
					} else {
						JSONObject valueJson = (JSONObject) value;
						deepMerge(valueJson, target.getJSONObject(key));
					}

				} else {
					target.put(key, value);
				}
			}
		}
		return target;
	}
}
