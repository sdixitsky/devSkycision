package com.skycision.dao;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;

import org.json.JSONObject;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.sqs.model.Message;
import com.skycision.farm.ImageType;

import javaxt.io.Image;

public interface DataStore // extends Runnable
{
	public enum Type {
		S3, LOCAL
	}

	public enum Size {
		FULL, THUMBNAIL
	}

	public class ImageDescriptor {
		@SuppressWarnings("unused")
		private static final Logger	logger				= LoggerFactory.getLogger(ImageDescriptor.class);
		private Type				target				= null;
		private Message				message				= null;
		private Image				image				= null;
		private BufferedImage		bufferedImage		= null;
		private BufferedImage		thumbnail			= null;
		private ImageType			type				= null;
		private String				inputURI			= null;
		private String				outputURI			= null;
		private double				heading				= -1;
		private DataStore			dataStore;
		private ArrayList<Double>	bounds;
		private JSONObject			json				= null;
		private double				altitude			= Double.NaN;
		private ArrayList<Integer>	croppedImgPixBounds	= null;
		private String				bucket;
		private String				key;
		private String				queueUrl;
		private double				latitude;
		private double				longitude;

		public ImageDescriptor(DataStore theStore) {
			dataStore = theStore;
		}

		public Image getImage() {
			if (image == null)
				dataStore.loadImage(this);
			return image;
		}

		public ImageDescriptor withImage(Image image) {
			this.image = image;
			return this;
		}

		public ImageType getType() {
			return type;
		}

		public ImageDescriptor withType(ImageType type) {
			this.type = type;
			return this;
		}

		public String getInputURI() {
			return inputURI;
		}

		public ImageDescriptor withInputURI(String inputURI) {
			this.inputURI = inputURI;
			return this;
		}

		public String getOutputURI() {
			return outputURI;
		}

		public ImageDescriptor withOutputURI(String outputURI) {
			this.outputURI = outputURI;
			return this;
		}

		public ImageDescriptor withHeading(double heading2) {
			this.heading = heading2;
			return this;
		}

		public ImageDescriptor withLatitude(double latitude) {
			this.latitude = latitude;
			return this;
		}

		public ImageDescriptor withLongitude(double longitude) {
			this.longitude = longitude;
			return this;
		}

		public ImageDescriptor withSqsMessage(Message theMessage) {
			this.message = theMessage;
			return this;
		}

		public Message getSqsMessage() {
			return this.message;
		}

		public double getHeading() {
			return heading;
		}

		public void store() throws IOException {
			dataStore.store(this);
		}

		public void copy() throws IOException {
			dataStore.copy(this);
		}

		public void setBufferedImage(BufferedImage theImage) {
			this.bufferedImage = theImage;
		}

		public BufferedImage getBufferedImage() {
			if (bufferedImage == null)
				bufferedImage = image.getBufferedImage();
			return bufferedImage;
		}

		public BufferedImage getThumbnail() {
			return this.thumbnail;
		}

		public void setThumbnail(BufferedImage thumbnail) {
			this.thumbnail = thumbnail;
		}

		public void setBounds(ArrayList<Double> calculatedBounds) {
			this.bounds = calculatedBounds;
		}

		public ArrayList<Double> getBounds() {
			return bounds;
		}

		public void setJSON() {
			HashMap<String, Object> jsonMap = new HashMap<String, Object>();
			jsonMap.put("altitude", getAltitude());
			jsonMap.put("heading", getHeading());
			jsonMap.put("type", getType().toString());
			jsonMap.put("bounds", getBounds());
			jsonMap.put("pixelBounds", getCroppedImgPixBounds());
			this.json = (new JSONObject(jsonMap));
		}

		public JSONObject getJSON() {
			if (json == null)
				setJSON();
			return this.json;
		}

		public double getAltitude() {
			return altitude;
		}

		public ImageDescriptor withAltitude(double altitude) {
			this.altitude = altitude;
			return this;
		}

		public ArrayList<Integer> getCroppedImgPixBounds() {
			return croppedImgPixBounds;
		}

		public void setCroppedImgPixBounds(ArrayList<Integer> croppedImgPixBounds) {
			this.croppedImgPixBounds = croppedImgPixBounds;
		}

		public ImageDescriptor withBucket(String dropBucket) {
			bucket = dropBucket;
			return this;
		}

		public String getBucket() {
			return bucket;
		}

		public String getKey() {
			return key;
		}

		public ImageDescriptor withKey(String key) {
			this.key = key;
			return this;
		}

		public ImageDescriptor withQueueUrl(String theQueueUrl) {
			this.queueUrl = theQueueUrl;
			return this;
		}

		public String getQueueUrl() {
			return this.queueUrl;
		}

		public double getLatitude() {
			return this.latitude;

		}

		public double getLongitude() {
			return this.longitude;
		}

	}

	ArrayList<String> getFieldList(String farmId);

	void loadImage(ImageDescriptor imageDescriptor);

	ArrayList<HashMap<String, Object>> getTiles(String farmId) throws IOException, ParseException;

	Collection<ImageDescriptor> scanForImages() throws IOException;

	void copy(ImageDescriptor imgDesc) throws IOException;

	void move(ImageDescriptor imgDesc);

	void store(ImageDescriptor imgDesc) throws IOException;

	ImageDescriptor read(String inputURI);

	ImageDescriptor createDescriptorFromKey(String key);

	HashMap<String, Object> getClients(String cognitoId);

	int addPartner(String partnerId, String[] splitIds);

	JSONObject storeFarmMobile(JSONObject json);
}
