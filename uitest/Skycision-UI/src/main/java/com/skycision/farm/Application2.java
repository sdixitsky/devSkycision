package com.skycision.farm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Deprecated
public class Application2
{
	
	private static final Logger	logger				= LoggerFactory.getLogger(Application2.class);

	public static final String	FILE_SEPARATOR		= System.getProperty("file.separator");
	public static final String	CLR_SCALE_FILE_PATH	= "TestFiles" + FILE_SEPARATOR + "scale2.csv";

	public static void main(String[] args) throws Exception
	{
		
		return;
//		SpringApplication.run(SampleController.class, args);
		//ResourceManager.processIncomingImages(getPath("IN_BUCKET"), getPath("OUT_BUCKET"));
	}
	@SuppressWarnings("unused")
	private static String getPath(String envFolderName)
	{
		String path = System.getenv(envFolderName);
		if (path == null || path.isEmpty())
			switch (envFolderName)
			{
				case "IN_BUCKET":
//					path = System.getProperty("user.home") + "/Google Drive/Skycision/run/incoming/";
					
					path = "http://s3.amazonaws.com/skycisiondropbucket/";
					
					break;
				case "OUT_BUCKET":
//					path = System.getProperty("user.home") + "/Google Drive/Skycision/run/data/";
					
					path = "http://s3.amazonaws.com/skycisiondatabucket/";
					break;
				default:
					break;
			}
		logger.info("Found root path: " + path);
		return path;
	}
}
