package com.skycision.model;

import java.io.File;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;

public class PrepBuckets implements Runnable {
	
	private static final Logger logger = LoggerFactory.getLogger(PrepBuckets.class);
	
	private static final String COGNITO_ID = "us-east-1:bea672d8-a746-4a94-98b4-c84481931c64";
	private static final String bucketName = "skycisiondropbucket";
	public void run() {
		
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
//		ProfileCredentialsProvider credentialsProvider = new ProfileCredentialsProvider();
		AmazonS3Client s3Client = new AmazonS3Client();
//		String bucketName = "skycisiondropbucket";
//		ObjectListing listToDelete = s3Client.listObjects(bucketName, COGNITO_ID + "/");
//
//		if (!listToDelete.getObjectSummaries().isEmpty()) {
//			List<KeyVersion> keys = new ArrayList<KeyVersion>();
//			for (S3ObjectSummary summ : listToDelete.getObjectSummaries()) {
//				keys.add(new KeyVersion(summ.getKey()));
//			}
//	
//			DeleteObjectsRequest delReq = new DeleteObjectsRequest(bucketName).withKeys(keys);
//			s3Client.deleteObjects(delReq);
//		}
		logger.info("prepBuckets starting uploads");
		fillBatch(s3Client, bucketName, System.getProperty("user.home") + "/dev/img/03-21-16/jpegs/west/conv", 5, 0.1415024326862323);
//		fillBatch(s3Client, bucketName, System.getProperty("user.home") + "/dev/img/03-21-16/jpegs/north", 6, 90.26706671885958);
		
//		ListObjectsRequest listRequest = new ListObjectsRequest().withBucketName("skycisiondatabucket").withPrefix("us-east-1:bea672d8-a746-4a94-98b4-c84481931c64").withDelimiter("/");
//		ObjectListing objectListing = s3Client.listObjects(listRequest);
//		
//		for (S3ObjectSummary summ : objectListing.getObjectSummaries()) {
//			if (summ.getKey().endsWith("_thumb.JPG")) {
//				ObjectMetadata meta = new ObjectMetadata();
//			}
//		}
		return;
	}

	private void fillBatch(AmazonS3Client s3, String bucketName, String pathPrefix, int batchNum, double heading) {
		File jpegDir = new File(pathPrefix);

		File[] files = jpegDir.listFiles();
		int i = 0;
		for (File jpeg : files) {
			if ( i > 20) {
				break;
			}
			if (jpeg.getName().endsWith("JPG")) {
				ObjectMetadata meta = new ObjectMetadata();
				meta.setContentType("image/jpeg");
				meta.addUserMetadata("heading", new Double(heading).toString());
				meta.addUserMetadata("imagetype", "rgb");
				String name = COGNITO_ID+ "/"+(new Integer(batchNum)).toString() + "_rgb/";
	
				PutObjectRequest putReq = new PutObjectRequest(bucketName, name + jpeg.getName().replace(".JPG", "-test.JPG"), jpeg).withMetadata(meta);
				s3.putObject(putReq);
			}
			logger.info("Uploaded image {}",i);
			i++;
		}
	}
}
