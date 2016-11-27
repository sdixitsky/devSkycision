package com.skycision.farm;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.lang.Thread.UncaughtExceptionHandler;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.imgscalr.Scalr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.skycision.dao.DataStore.ImageDescriptor;

import javaxt.io.Image;



public class ImageProcessor implements Runnable, UncaughtExceptionHandler
{
	private static final double				FOCAL_LENGTH	= 0.02;
	private static final double				SENSOR_D1		= 0.04233;
	private static final double				SENSOR_D2		= 0.03175;
	private static final double				OVERLAP			= 0.4;

	private static final Logger				logger			= LoggerFactory.getLogger(ImageProcessor.class);

	private int								imgCount		= 0;
	private LinkedHashMap<String, String>	imgData			= new LinkedHashMap<String, String>();
	private ImageDescriptor					descriptor;

	private ArrayList<Throwable>			exceptions		= new ArrayList<Throwable>();

	public ImageProcessor(ImageDescriptor theDescriptor)
	{
		super();
		descriptor = theDescriptor;
	}

	@Override
	public void run()
	{
		try
		{

//			logger.info("ImageDescriptor Processing Started");
			Thread.currentThread().setUncaughtExceptionHandler(this);
			Image image = descriptor.getImage();
			// extract dimensions from EXIF data
			int width = image.getWidth();
			int height = image.getHeight();
			
			double alt = 20;
			double lat = 40;
			double lon =-79;
			
			if ( image.getGPSCoordinate() != null) {
				// extract latitude and longitude from EXIF
				lon = image.getGPSCoordinate()[0];
				lat = image.getGPSCoordinate()[1];
					
				HashMap<Integer, Object> gpsTags = image.getGpsTags();
				String[] tempAlt = ((String) gpsTags.get(6)).split("/");
				alt = Double.parseDouble(tempAlt[0]) / Double.parseDouble(tempAlt[1]);
			}
			
			// { horizontal_dist, vertical_dist}
			double[] dims = getGroundDimensionsForAltitude(alt);
			
			if (height == 2250) {
				dims[1] = dims[1] * 2250/3000;
			}

			int[] miniDim = getMiniImgDimensions(dims[0], dims[1], alt, width, height);

			switch (descriptor.getType())
			{
				case NDVI:
					NDVICalculator ndviCalculator = new NDVICalculator(descriptor);
					ndviCalculator.run();
					break;
				case RGB:
					break;
			}

			BufferedImage srcImage = descriptor.getBufferedImage();
//			BufferedImage croppedImage = cropImg(miniDim[0], miniDim[1], srcImage);
			BufferedImage croppedImage = Scalr.crop(srcImage, miniDim[0], miniDim[1]);
			BufferedImage downSampled;
			if (croppedImage == null) {
				downSampled = srcImage;
			} else {
				downSampled = Scalr.resize(croppedImage, Scalr.Method.SPEED, Math.round(miniDim[0] / 6),
					Math.round(miniDim[1] / 6), Scalr.OP_ANTIALIAS);
			}
			srcImage.flush();
			
			ArrayList<Integer> croppedImgPixBounds = getMiniImgPixelBounds(new int[]
			{ width, height }, miniDim);

			ArrayList<Double> bounds = DistanceCalculation.calculateBounds(dims[0], dims[1], lat, lon, descriptor.getHeading());

			descriptor.setThumbnail(downSampled);
			descriptor.setBounds(bounds);
			descriptor.withAltitude(alt);
			descriptor.setCroppedImgPixBounds(croppedImgPixBounds);

//			logger.info("{} ImageDescriptor processed",descriptor.getKey());
//			logger.info("{} Beginning Storage",descriptor.getKey());

			descriptor.store();
//			logger.info("{} Storage complete.",descriptor.getKey());
		}
		catch (Throwable e)
		{
			logger.error("{} caught {} ", getClass().getSimpleName(), e.getMessage(), e);
			exceptions.add(e);
		}
		finally
		{
			Thread.currentThread().setUncaughtExceptionHandler(Thread.getDefaultUncaughtExceptionHandler());
		}

	}


	/**
	 * Crops a thumbnail from a large picture
	 * 
	 * @param thumbnailWidth
	 *            Required width of the thumbnail
	 * @param thumbnailHeight
	 *            Required height of the thumnail
	 * @param origImg
	 *            Object containing the image to crop
	 * @param shiftH
	 *            Number of pixels to shift the cropped area to the right
	 *            (negative: to the left)
	 * @param shiftV
	 *            Number of pixels to shift the cropped area down (negative: up)
	 * @throws IOException
	 */
	public BufferedImage cropImg(int mW, int mH, BufferedImage origImg)
	{

		// x coordinate of new center of thumbnail
		double shiftedCenterX = origImg.getWidth() / 2;

		// y coordinate of new center of thumbnail
		double shiftedCenterY = origImg.getHeight() / 2;

		// calculate the top left and bottom right corners of the thumbnail
		double topLeftX = shiftedCenterX - mW / 2;
		double topLeftY = shiftedCenterY - mH / 2;
		double bottomRightX = shiftedCenterX + mW / 2;
		double bottomRightY = shiftedCenterY + mH / 2;

		BufferedImage croppedImage2 = new BufferedImage((int) mW, (int) mH, origImg.getType());
		Graphics g = croppedImage2.createGraphics();
		g.drawImage(origImg, 0, 0, (int) mW, (int) mH, (int) topLeftX, (int) topLeftY, (int) bottomRightX, (int) bottomRightY,
				Color.black, null);
		g.dispose();
		// logger.info("Center of thumbnail x: " + shiftedCenterX + " y: " +
		// shiftedCenterY);
		return croppedImage2;
	}

	/**
	 * Calculates the size of a thumbnail based on the distance between pictures
	 * 
	 * @param hDist
	 *            Planned distance between pictures along the horizontal
	 *            direction
	 * @param vDist
	 *            Planned distance between pictures along the vertical direction
	 * @param distanceToGround
	 *            Planned distance to ground (altitude)
	 * @param originalWidth
	 *            Original image width (px)
	 * @param originalHeight
	 *            Original image height (px)
	 * @param meters
	 *            True if distance units are in meters, false assumes distances
	 *            are in feet
	 * @return horizontal and vertical dimensions of the thumbnail
	 */
	public static int[] getMiniImgDimensions(double hDist, double vDist, double alt, int origW, int origH)
	{	
		// if (!meters) {
		// double metersPerFeet = 0.3048;
		// hDist = hDist * metersPerFeet;
		// vDist = vDist * metersPerFeet;
		// distanceToGround = distanceToGround * metersPerFeet;
		// }
		double[] result = DistanceCalculation.getMetersPerPixel(alt, origW, true);
		double metersPerPixel = result[0];
		double fov = result[1];
		return new int[]
		{ (int) Math.round(hDist / metersPerPixel), (int) Math.round(vDist / metersPerPixel) };
	}

	/**
	 * Gets the coordinates of the mini image within the full size image
	 * 
	 * @param move
	 *            The horizontal and vertical shift used to crop the mini image
	 * @param fullDim
	 *            The dimensions of the full image (width, height)
	 * @param miniDim
	 *            The dimensions of the mini image (width, height)
	 * @return coordinates of the mini image (up, down, right, left)
	 */
	public static ArrayList<Integer> getMiniImgPixelBounds(int[] fullDim, int[] miniDim)
	{
		int centerX = (fullDim[0] / 2);// + (int) move[0];
		int centerY = (fullDim[1] / 2);// + (int) move[1];
		int up = centerY - (miniDim[1] / 2);
		int down = centerY + (miniDim[1] / 2);
		int left = centerX - (miniDim[0] / 2);
		int right = centerX + (miniDim[0] / 2);

		ArrayList<Integer> result = new ArrayList<Integer>();
		result.add(up);
		result.add(down);
		result.add(right);
		result.add(left);
		return result;
	}

	// meters
	public double[] getGroundDimensionsForAltitude(double alt)
	{
		double W = alt * SENSOR_D1 / FOCAL_LENGTH;
		double H = alt * SENSOR_D2 / FOCAL_LENGTH;

		double wComp = W * (1 - 2*OVERLAP);
		double hComp = H * (1 - 2*OVERLAP);

		double[] result = new double[2];
		result[0] = wComp;
		result[1] = hComp;

		return result;
	}

	public int generateImageID()
	{
		return ++imgCount;
	}

	@SuppressWarnings("unused")
	@Deprecated
	public void storeJSONData() throws IOException
	{
		for (Map.Entry<String, String> entry : imgData.entrySet())
		{
			/*
			 * String key = entry.getKey(); imgData.put(key, entry.getValue() +
			 * "]}"); File file = new File(OUTPUT_IMG_PATH + key.split("_")[0] +
			 * Application.FILE_SEPARATOR + key.split("_")[1].replaceAll("/",
			 * "_") + Application.FILE_SEPARATOR + "json_" + key.split("_")[0] +
			 * "_" + key.split("_")[1].replaceAll("/", "_") + ".txt");
			 * file.getParentFile().mkdirs(); if (!file.exists()) {
			 * file.createNewFile(); }
			 * 
			 * FileWriter writer = new FileWriter(file.getAbsoluteFile());
			 * BufferedWriter bw = new BufferedWriter(writer);
			 * bw.write(imgData.get(key)); bw.close();
			 */
		}

	}

	@Override
	public void uncaughtException(Thread t, Throwable e)
	{
		exceptions.add(e);
	}
}
