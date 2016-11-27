package com.skycision.farm;

import com.amazonaws.auth.ClasspathPropertiesFileCredentialsProvider;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;

public class BatchImageProcessor implements Runnable
{
	String s3Bucket;
	AmazonS3 s3 = new AmazonS3Client(new ClasspathPropertiesFileCredentialsProvider());
	String farmId;
	String batchId;

	public BatchImageProcessor(String s3Bucket, String farmId, String batchId)
	{
		super();
		this.s3Bucket = s3Bucket;
		this.farmId = farmId;
		this.batchId = batchId;
	}

	@Override
	public void run()
	{
		// Scan that particular farms directory for this particular batch.
		// Get list of images. If none sleep and try again until you find them.
		// for each image, processImage()

	}

}
