package com.skycision.model;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.json.simple.parser.ParseException;
import com.skycision.dao.DataStore;
import com.skycision.dao.DataStore.ImageDescriptor;
import com.skycision.dao.LocalDataStore;
import com.skycision.dao.S3DataStore;
import com.skycision.farm.ImageProcessor;
import com.skycision.flight.Flight;
import com.skycision.flight.FlightPlanGenerator;
import com.skycision.flight.WaypointCountException;
import com.vividsolutions.jts.geom.CoordinateList;

public class ResourceManager implements Runnable {

	private static final Log				logger			= LogFactory.getLog(ResourceManager.class);
	private static final String				OS_NAME				= System.getProperty("os.name");
	private boolean							done			= false;
	private static ResourceManager			rm;
	private static DataStore				ds;
	private FlightPlanGenerator				fpg;
	private static HashMap<String, Farm>	farmsMap		= new HashMap<String, Farm>();

	private ExecutorService					imageScanner	= Executors.newSingleThreadExecutor();
	private ExecutorService					imageQueue		= Executors.newFixedThreadPool(4);
	// private static CommandLineMultiThread cmdInputScanner;
	private static boolean					TEST_MODE		= false;
	private static boolean					RUN_SCANNER		= false;

	// private static class ExceptionCatchingThreadFactory implements
	// ThreadFactory {
	// private final ThreadFactory delegate;
	//
	// private ExceptionCatchingThreadFactory(ThreadFactory delegate) {
	// this.delegate = delegate;
	// }
	//
	// public Thread newThread(final Runnable r) {
	// Thread t = delegate.newThread(r);
	// t.setUncaughtExceptionHandler(new UncaughtExceptionHandler() {
	// @Override
	// public void uncaughtException(Thread t, Throwable e) {
	// e.printStackTrace(); //replace with your handling logic.
	// }
	// });
	// return t;
	// }
	// }

	protected ResourceManager() {
		// Exists only to defeat instantiation
	}

	protected ResourceManager(DataStore.Type storeType) {
		switch (storeType) {
		case S3:
			ds = new S3DataStore();
			break;
		case LOCAL:
			ds = new LocalDataStore();
			break;
		}
		fpg = new FlightPlanGenerator();
	}

	public Farm getFarm(String farmId) {
		return farmsMap.get(farmId);
	}

	public Flight getFlight(CoordinateList fieldCoords, double altitude, double overlap, int iterations) throws Exception {
		long startTime = System.nanoTime();

		Flight flight = fpg.createFlightPlanFromField(fieldCoords, altitude, overlap, iterations);

		long endTime = System.nanoTime();
		long duration = (endTime - startTime); // divide by 1000000 to get
												// milliseconds

		flight.setCalculationTime(duration);
		return flight;
	}

	public Flight createBaseMesh(CoordinateList boundary) {
		return fpg.createFlightPlanFromDefaults(boundary);
	}

	@Deprecated
	public static String getJSONData(String imgFileName) throws IOException {
		String jsonFileName = imgFileName.replaceAll(".jpg", ".txt");
		BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(jsonFileName)));
		String s = "";
		StringBuilder jsonContent = new StringBuilder();
		while ((s = br.readLine()) != null) {
			jsonContent.append(s);
		}
		br.close();
		return jsonContent.toString();
	}

	public static int init() {
		try {
			DataStore.Type storeType = DataStore.Type.S3;

			if (!OS_NAME.toLowerCase().equals("linux")) {
				String storeSpecifier = getEnv("STORE", storeType.name());
				System.out.println("Store type: " + storeSpecifier);
				if (storeSpecifier != null) {
					switch (storeSpecifier) {
					case "s3":
						storeType = DataStore.Type.S3;
						break;
					case "S3":
						storeType = DataStore.Type.S3;
						break;
					case "local":
						storeType = DataStore.Type.LOCAL;
						break;
					case "LOCAL":
						storeType = DataStore.Type.LOCAL;
						break;
					}
				}
			}

			logger.info("STORE TYPE:" + storeType.toString() + "\n\n");
			rm = new ResourceManager(storeType);
			logger.info(rm);

			if (RUN_SCANNER)
				new Thread(rm).start();

			// Thread t = new Thread(new CommandLineMultiThread(rm));
			// t.start();

			return 1;
		} catch (Exception e) {
			logger.info("ResourceManager.init() exception thrown!");
			e.printStackTrace();
			return -1;
		}
	}

	private static String getEnv(String varName, String defaultValue) {
		String result = System.getenv(varName);
		return result == null ? defaultValue : result;
	}

	public static ResourceManager rm() {
		if (rm == null) {
			try {
				ResourceManager.init();
				if (rm == null)
					throw new Exception("ResourceManagerInitException",
							new Throwable("ResourceManager was not initialized"));
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return rm;
	}

	@Override
	public void run() {
		try {
			Thread.sleep(10000);
		} catch (InterruptedException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		
		if (TEST_MODE && !OS_NAME.toLowerCase().equals("linux")) {
			Future<?> future = imageScanner.submit(new PrepBuckets());
			
//			do {
				try {
					logger.info("Uploading test images....");
					future.get();
					Thread.sleep(3000);
				} catch (InterruptedException | ExecutionException e) {
					// TODO Auto-generated catch block
					if (rm == null)
					e.printStackTrace();
				}
//			} while (!future.isDone());
			
			logger.info("Upload Complete! Beginning scan...");
		}

		final int sleepMillis = 300000;

//		if (OS_NAME.toLowerCase().equals("linux")) {
			while (!done) {
				
				try {
					
					logger.info("Polling Queue...");
					Collection<ImageDescriptor> scanResult = null;
					do {
						
						scanResult = ds.scanForImages();
						if (!scanResult.isEmpty()) {
							try {
								ResourceManager.rm().schedule(scanResult);
							} catch (Exception e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
						}

						Thread.sleep(2000);
					} while (!done && !scanResult.isEmpty());

					logger.info("Polling complete. Resuming scan in " + new Double(sleepMillis / 1000).toString()
							+ "  secs.");
					
					Thread.sleep(sleepMillis);
				} catch (InterruptedException e) {
					done = true;
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
//		}
	}

	public void schedule(Collection<ImageDescriptor> scannedImages) {
		final int imageCount = scannedImages.size();
		logger.info("Found " + new Double(imageCount).toString() + " ImageDescriptors");
		ArrayList<Future<?>> futures = new ArrayList<Future<?>>();

		for (ImageDescriptor desc : scannedImages) {
			futures.add(imageQueue.submit(new ImageProcessor(desc)));
		}
		try {
			for (Future<?> futureTask : futures) {
				futureTask.get();
			}
		} catch (InterruptedException | ExecutionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void stop() {
		done = true;
	}

	public ArrayList<HashMap<String, Object>> getTiles(String farmId) {

		ArrayList<HashMap<String, Object>> result = new ArrayList<HashMap<String, Object>>();
		try {
			return ds.getTiles(farmId);
		} catch (IOException | ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}

	public HashMap<String, Object> getClients(String cognitoId) {
		// TODO Auto-generated method stub
		return ds.getClients(cognitoId);
	}

	public void addPartner(String partnerId, String[] splitIds) {

		int result = ds.addPartner(partnerId, splitIds);
		logger.info("add client result: " + result);

	}

	public JSONObject storeFarmMobile(org.json.JSONObject json) {

		JSONObject result = ds.storeFarmMobile(json);

		return null;
	}

}