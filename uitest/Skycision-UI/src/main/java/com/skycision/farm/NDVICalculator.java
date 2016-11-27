package com.skycision.farm;

import java.awt.Point;
import java.awt.image.BufferedImage;
import java.awt.image.ColorModel;
import java.awt.image.DataBuffer;
import java.awt.image.DataBufferByte;
import java.awt.image.Raster;
import java.awt.image.SampleModel;
import java.io.IOException;
import java.io.OutputStream;

import javax.media.jai.PlanarImage;
import javax.media.jai.RasterFactory;
import javax.media.jai.TiledImage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.skycision.dao.DataStore.ImageDescriptor;
import com.sun.media.jai.codec.ImageCodec;
import com.sun.media.jai.codec.ImageEncoder;
import com.sun.media.jai.codec.JPEGEncodeParam;

public class NDVICalculator implements Runnable
{
	private static final Logger	logger		= LoggerFactory.getLogger(NDVICalculator.class);

	private ImageDescriptor		descriptor;
	private final int[][]				colorScale	= colorScale0;//biggerColorScale;

	public NDVICalculator(ImageDescriptor descriptor)
	{
		this.descriptor = descriptor;
	}

	/**
	 * Generates an NDVI image from a Blue+NIR image, mapping the values to colors in the given
	 * scale
	 * 
	 * @param source
	 *            Path to the Blue+NIR image
	 * @param output
	 *            Path to the output image (stored as JPEG)
	 * @param colorscale2
	 *            Map containing the color scale
	 * @return Array containing the NDVI values for each pixel
	 */
	public void run()
	{
		PlanarImage pi = PlanarImage.wrapRenderedImage(descriptor.getBufferedImage());
		SampleModel sm = pi.getSampleModel();
		int width = pi.getWidth();
		int height = pi.getHeight();
		int nbandsRGB = sm.getNumBands();

		byte[] pixelOut = calculate(pi, width, height, nbandsRGB);
		descriptor.setBufferedImage(rasterize(width, height, nbandsRGB, pixelOut));
		
		logger.info("{} NDVI Done!",descriptor.getKey());
	}

	private byte[] calculate(PlanarImage pi, int width, int height, int nbandsRGB) {
		Raster inputRaster = pi.getData();
		int[] pixelRGB = new int[nbandsRGB * width * height];
		inputRaster.getPixels(0, 0, width, height, pixelRGB);
//		System.out.println("Loaded Blue + NIR image: " + (long) width * (long) height + " pixels, " + nbandsRGB + " band(s)");

		// Calculate NDVI for each pixel
//		System.out.println("Calculating NDVI for each pixel");
		int offsetRGB;
		int offsetNDVI;
		int offsetRGB_;
		int offsetNDVI_;
		int blueIndex = 2;
		int nirIndex = 0;
		float[] pixelNDVI = new float[pixelRGB.length / nbandsRGB]; // Array to hold the NDVI
																	 // values
		byte[] pixelOut = new byte[pixelRGB.length]; // Array to hold the RGB values of the
													 // output image
		float max = -1;
		float min = 10000;
		float sum = 0;
		// Scan each pixel of the source image
		for (int w = 0; w < width; w++)
		{
			for (int h = 0; h < height; h++)
			{
				offsetRGB = w * height * nbandsRGB + h * nbandsRGB;
				offsetNDVI = w * height + h;
				// Get blue reflectance (0-1)
				float blue = (float) (((float) pixelRGB[offsetRGB + blueIndex]) / 255.0);
				// Get NIR reflectance (0-1)
				float nir = (float) (((float) pixelRGB[offsetRGB + nirIndex]) / 255.0);
				float ndvi = (nir - blue) / (nir + blue); // Calculate ndvi
				if (ndvi > max)
					max = ndvi;
				if (ndvi < min)
					min = ndvi;
				sum += ndvi;
				pixelNDVI[offsetNDVI] = ndvi;
				
			}
		}
//		logger.info("max: " + max + " min: " + min);
		
		float mean = sum/pixelNDVI.length;
		float stdDev = standardDev(pixelNDVI,mean);
		float adjMin = mean-2*stdDev;
		float adjMax = mean+2*stdDev;
		
		for (int ww = 0; ww < width; ww++)
		{
			for (int hh = 0; hh < height; hh++)
			{
				offsetRGB_ = ww * height * nbandsRGB + hh * nbandsRGB;
				offsetNDVI_ = ww * height + hh;
				
				float ndviAdj = Math.max(Math.min(pixelNDVI[offsetNDVI_], adjMax), adjMin);
				
				float ndviNorm = (ndviAdj-adjMin)/(adjMax-adjMin);
				int index = (int) Math.min(colorScale.length-1, Math.floor(ndviNorm * colorScale.length));
				int[] rgb = colorScale[index]; // pixel's
				
				pixelOut[offsetRGB_ + 0] = (byte) rgb[2]; // Blue
				pixelOut[offsetRGB_ + 1] = (byte) rgb[1]; // Green
				pixelOut[offsetRGB_ + 2] = (byte) rgb[0]; // Red
			}
		}
		return pixelOut;
	}
	
	private float standardDev(float[] pix, float mean) {
		int len = pix.length;
		float sdSum = 0;
		for (int i=0;i<len;i++)
		{
			sdSum = sdSum + (float)Math.pow((pix[i] - mean),2);
		}
		return (float) Math.sqrt(sdSum/len);
	}

	private BufferedImage rasterize(int width, int height, int nbandsRGB, byte[] pixelOut)
	{
		DataBufferByte dbuffer = new DataBufferByte(pixelOut, pixelOut.length);
		SampleModel sampleModel = RasterFactory.createPixelInterleavedSampleModel(DataBuffer.TYPE_BYTE, width, height,
				nbandsRGB);
		ColorModel colorModel = PlanarImage.createColorModel(sampleModel);
		Raster raster = RasterFactory.createWritableRaster(sampleModel, dbuffer, new Point(0, 0));
		final TiledImage tiledImage = new TiledImage(0, 0, width, height, 0, 0, sampleModel, colorModel);
		tiledImage.setData(raster);
		return tiledImage.getAsBufferedImage();
	}

	@SuppressWarnings("unused")
	@Deprecated
	private void encodeImage(TiledImage img, OutputStream out)
	{
		ImageEncoder encoder = null;
		JPEGEncodeParam encodeParam = new JPEGEncodeParam();
		encodeParam.setQuality(0.9F); // Set compression quality (0-1)
		encoder = ImageCodec.createImageEncoder("JPEG", out, encodeParam);
		try
		{
			encoder.encode(img);
			out.close();
		}
		catch (IOException e)
		{
			System.out.println("IOException at encoding..");
			System.exit(1);
		}
	}
	@SuppressWarnings("unused")
	private static final int[][]	SmallColorScale	=
	{
			{ 165, 0, 38 },
			{ 215, 48, 39 },
			{ 244, 109, 67 },
			{ 253, 174, 97 },
			{ 254, 224, 139 },
			{ 255, 255, 191 },
			{ 217, 239, 139 },
			{ 166, 217, 106 },
			{ 102, 189, 99 },
			{ 26, 152, 80 },
			{ 0, 104, 55 } };
	@SuppressWarnings("unused")
	private static final int[][] biggerColorScale =
	{
			{ 21, 21, 144 },
			{ 159, 159, 159 },
			{ 249, 249, 249 },
			{ 249, 249, 249 },
			{ 250, 250, 250 },
			{ 250, 250, 250 },
			{ 251, 251, 251 },
			{ 251, 251, 251 },
			{ 251, 251, 251 },
			{ 252, 252, 252 },
			{ 252, 252, 252 },
			{ 252, 252, 252 },
			{ 253, 253, 253 },
			{ 253, 253, 253 },
			{ 254, 254, 254 },
			{ 254, 254, 254 },
			{ 254, 254, 254 },
			{ 255, 255, 255 },
			{ 255, 255, 255 },
			{ 242, 239, 235 },
			{ 229, 223, 213 },
			{ 217, 207, 193 },
			{ 204, 192, 172 },
			{ 191, 176, 152 },
			{ 179, 161, 131 },
			{ 166, 145, 111 },
			{ 153, 129, 90 },
			{ 141, 113, 69 },
			{ 128, 97, 48 },
			{ 115, 82, 28 },
			{ 103, 67, 7 },
			{ 112, 76, 14 },
			{ 120, 86, 22 },
			{ 129, 95, 29 },
			{ 137, 104, 36 },
			{ 146, 113, 43 },
			{ 155, 123, 51 },
			{ 163, 132, 58 },
			{ 172, 141, 65 },
			{ 180, 150, 72 },
			{ 189, 160, 80 },
			{ 197, 169, 87 },
			{ 206, 178, 94 },
			{ 200, 177, 91 },
			{ 195, 175, 89 },
			{ 189, 174, 86 },
			{ 183, 172, 84 },
			{ 177, 171, 81 },
			{ 172, 170, 78 },
			{ 166, 168, 76 },
			{ 160, 167, 73 },
			{ 155, 166, 71 },
			{ 149, 164, 68 },
			{ 143, 163, 65 },
			{ 137, 161, 63 },
			{ 132, 160, 60 },
			{ 126, 159, 57 },
			{ 120, 157, 55 },
			{ 114, 156, 52 },
			{ 109, 154, 50 },
			{ 103, 153, 47 },
			{ 97, 152, 44 },
			{ 92, 150, 42 },
			{ 86, 149, 39 },
			{ 80, 147, 37 },
			{ 74, 146, 34 },
			{ 69, 145, 31 },
			{ 63, 143, 29 },
			{ 57, 142, 26 },
			{ 52, 141, 24 },
			{ 46, 139, 21 },
			{ 40, 138, 18 },
			{ 34, 136, 16 },
			{ 29, 135, 13 },
			{ 23, 134, 10 },
			{ 17, 132, 8 },
			{ 11, 131, 5 },
			{ 6, 129, 3 },
			{ 0, 128, 0 },
			{ 0, 126, 4 },
			{ 0, 123, 4 },
			{ 0, 121, 4 },
			{ 0, 118, 4 },
			{ 0, 116, 4 },
			{ 0, 113, 4 },
			{ 0, 111, 4 },
			{ 0, 108, 4 },
			{ 0, 106, 4 },
			{ 0, 103, 4 },
			{ 0, 101, 4 },
			{ 0, 98, 3 },
			{ 0, 96, 3 },
			{ 0, 94, 3 },
			{ 0, 91, 3 },
			{ 0, 89, 3 },
			{ 0, 86, 3 },
			{ 0, 84, 3 },
			{ 0, 81, 3 },
			{ 0, 79, 3 },
			{ 0, 76, 3 },
			{ 0, 74, 3 },
			{ 0, 71, 2 },
			{ 0, 69, 2 },
			{ 0, 66, 2 },
			{ 0, 64, 2 },
			{ 0, 62, 2 },
			{ 0, 59, 2 },
			{ 0, 57, 2 },
			{ 0, 54, 2 },
			{ 0, 52, 2 },
			{ 0, 49, 2 },
			{ 0, 47, 2 },
			{ 0, 44, 2 },
			{ 0, 42, 1 },
			{ 0, 39, 1 },
			{ 0, 37, 1 },
			{ 0, 34, 1 },
			{ 0, 32, 1 },
			{ 0, 30, 1 },
			{ 0, 27, 1 },
			{ 0, 25, 1 },
			{ 0, 22, 1 },
			{ 0, 20, 1 },
			{ 0, 17, 1 },
			{ 0, 15, 1 },
			{ 0, 12, 0 },
			{ 0, 10, 0 },
			{ 0, 10, 0 }};

//	@SuppressWarnings("unused")
	private static final int[][]	colorScale0		=
	{
			{ 255, 255, 255 },
			{ 250, 250, 250 },
			{ 246, 246, 246 },
			{ 242, 242, 242 },
			{ 238, 238, 238 },
			{ 233, 233, 233 },
			{ 229, 229, 229 },
			{ 225, 225, 225 },
			{ 221, 221, 221 },
			{ 216, 216, 216 },
			{ 212, 212, 212 },
			{ 208, 208, 208 },
			{ 204, 204, 204 },
			{ 200, 200, 200 },
			{ 195, 195, 195 },
			{ 191, 191, 191 },
			{ 187, 187, 187 },
			{ 183, 183, 183 },
			{ 178, 178, 178 },
			{ 174, 174, 174 },
			{ 170, 170, 170 },
			{ 166, 166, 166 },
			{ 161, 161, 161 },
			{ 157, 157, 157 },
			{ 153, 153, 153 },
			{ 149, 149, 149 },
			{ 145, 145, 145 },
			{ 140, 140, 140 },
			{ 136, 136, 136 },
			{ 132, 132, 132 },
			{ 128, 128, 128 },
			{ 123, 123, 123 },
			{ 119, 119, 119 },
			{ 115, 115, 115 },
			{ 111, 111, 111 },
			{ 106, 106, 106 },
			{ 102, 102, 102 },
			{ 98, 98, 98 },
			{ 94, 94, 94 },
			{ 90, 90, 90 },
			{ 85, 85, 85 },
			{ 81, 81, 81 },
			{ 77, 77, 77 },
			{ 73, 73, 73 },
			{ 68, 68, 68 },
			{ 64, 64, 64 },
			{ 60, 60, 60 },
			{ 56, 56, 56 },
			{ 52, 52, 52 },
			{ 56, 56, 56 },
			{ 60, 60, 60 },
			{ 64, 64, 64 },
			{ 68, 68, 68 },
			{ 73, 73, 73 },
			{ 77, 77, 77 },
			{ 81, 81, 81 },
			{ 85, 85, 85 },
			{ 90, 90, 90 },
			{ 94, 94, 94 },
			{ 98, 98, 98 },
			{ 102, 102, 102 },
			{ 106, 106, 106 },
			{ 111, 111, 111 },
			{ 115, 115, 115 },
			{ 119, 119, 119 },
			{ 123, 123, 123 },
			{ 128, 128, 128 },
			{ 132, 132, 132 },
			{ 136, 136, 136 },
			{ 140, 140, 140 },
			{ 145, 145, 145 },
			{ 149, 149, 149 },
			{ 153, 153, 153 },
			{ 157, 157, 157 },
			{ 161, 161, 161 },
			{ 166, 166, 166 },
			{ 170, 170, 170 },
			{ 174, 174, 174 },
			{ 178, 178, 178 },
			{ 183, 183, 183 },
			{ 187, 187, 187 },
			{ 191, 191, 191 },
			{ 195, 195, 195 },
			{ 200, 200, 200 },
			{ 204, 204, 204 },
			{ 208, 208, 208 },
			{ 212, 212, 212 },
			{ 216, 216, 216 },
			{ 221, 221, 221 },
			{ 225, 225, 225 },
			{ 229, 229, 229 },
			{ 233, 233, 233 },
			{ 238, 238, 238 },
			{ 242, 242, 242 },
			{ 246, 246, 246 },
			{ 250, 250, 250 },
			{ 255, 255, 255 },
			{ 250, 250, 250 },
			{ 245, 245, 245 },
			{ 240, 240, 240 },
			{ 235, 235, 235 },
			{ 230, 230, 230 },
			{ 225, 225, 225 },
			{ 220, 220, 220 },
			{ 215, 215, 215 },
			{ 210, 210, 210 },
			{ 205, 205, 205 },
			{ 200, 200, 200 },
			{ 195, 195, 195 },
			{ 190, 190, 190 },
			{ 185, 185, 185 },
			{ 180, 180, 180 },
			{ 175, 175, 175 },
			{ 170, 170, 170 },
			{ 165, 165, 165 },
			{ 160, 160, 160 },
			{ 155, 155, 155 },
			{ 151, 151, 151 },
			{ 146, 146, 146 },
			{ 141, 141, 141 },
			{ 136, 136, 136 },
			{ 131, 131, 131 },
			{ 126, 126, 126 },
			{ 121, 121, 121 },
			{ 116, 116, 116 },
			{ 111, 111, 111 },
			{ 106, 106, 106 },
			{ 101, 101, 101 },
			{ 96, 96, 96 },
			{ 91, 91, 91 },
			{ 86, 86, 86 },
			{ 81, 81, 81 },
			{ 76, 76, 76 },
			{ 71, 71, 71 },
			{ 66, 66, 66 },
			{ 61, 61, 61 },
			{ 56, 56, 56 },
			{ 66, 66, 80 },
			{ 77, 77, 105 },
			{ 87, 87, 130 },
			{ 98, 98, 155 },
			{ 108, 108, 180 },
			{ 119, 119, 205 },
			{ 129, 129, 230 },
			{ 140, 140, 255 },
			{ 131, 147, 239 },
			{ 122, 154, 223 },
			{ 113, 161, 207 },
			{ 105, 168, 191 },
			{ 96, 175, 175 },
			{ 87, 183, 159 },
			{ 78, 190, 143 },
			{ 70, 197, 127 },
			{ 61, 204, 111 },
			{ 52, 211, 95 },
			{ 43, 219, 79 },
			{ 35, 226, 63 },
			{ 26, 233, 47 },
			{ 17, 240, 31 },
			{ 8, 247, 15 },
			{ 0, 255, 0 },
			{ 7, 255, 0 },
			{ 15, 255, 0 },
			{ 23, 255, 0 },
			{ 31, 255, 0 },
			{ 39, 255, 0 },
			{ 47, 255, 0 },
			{ 55, 255, 0 },
			{ 63, 255, 0 },
			{ 71, 255, 0 },
			{ 79, 255, 0 },
			{ 87, 255, 0 },
			{ 95, 255, 0 },
			{ 103, 255, 0 },
			{ 111, 255, 0 },
			{ 119, 255, 0 },
			{ 127, 255, 0 },
			{ 135, 255, 0 },
			{ 143, 255, 0 },
			{ 151, 255, 0 },
			{ 159, 255, 0 },
			{ 167, 255, 0 },
			{ 175, 255, 0 },
			{ 183, 255, 0 },
			{ 191, 255, 0 },
			{ 199, 255, 0 },
			{ 207, 255, 0 },
			{ 215, 255, 0 },
			{ 223, 255, 0 },
			{ 231, 255, 0 },
			{ 239, 255, 0 },
			{ 247, 255, 0 },
			{ 255, 255, 0 },
			{ 255, 249, 0 },
			{ 255, 244, 0 },
			{ 255, 239, 0 },
			{ 255, 233, 0 },
			{ 255, 228, 0 },
			{ 255, 223, 0 },
			{ 255, 217, 0 },
			{ 255, 212, 0 },
			{ 255, 207, 0 },
			{ 255, 201, 0 },
			{ 255, 196, 0 },
			{ 255, 191, 0 },
			{ 255, 185, 0 },
			{ 255, 180, 0 },
			{ 255, 175, 0 },
			{ 255, 170, 0 },
			{ 255, 164, 0 },
			{ 255, 159, 0 },
			{ 255, 154, 0 },
			{ 255, 148, 0 },
			{ 255, 143, 0 },
			{ 255, 138, 0 },
			{ 255, 132, 0 },
			{ 255, 127, 0 },
			{ 255, 122, 0 },
			{ 255, 116, 0 },
			{ 255, 111, 0 },
			{ 255, 106, 0 },
			{ 255, 100, 0 },
			{ 255, 95, 0 },
			{ 255, 90, 0 },
			{ 255, 85, 0 },
			{ 255, 79, 0 },
			{ 255, 74, 0 },
			{ 255, 69, 0 },
			{ 255, 63, 0 },
			{ 255, 58, 0 },
			{ 255, 53, 0 },
			{ 255, 47, 0 },
			{ 255, 42, 0 },
			{ 255, 37, 0 },
			{ 255, 31, 0 },
			{ 255, 26, 0 },
			{ 255, 21, 0 },
			{ 255, 15, 0 },
			{ 255, 10, 0 },
			{ 255, 5, 0 },
			{ 255, 0, 0 },
			{ 255, 0, 15 },
			{ 255, 0, 31 },
			{ 255, 0, 47 },
			{ 255, 0, 63 },
			{ 255, 0, 79 },
			{ 255, 0, 95 },
			{ 255, 0, 111 },
			{ 255, 0, 127 },
			{ 255, 0, 143 },
			{ 255, 0, 159 },
			{ 255, 0, 175 },
			{ 255, 0, 191 },
			{ 255, 0, 207 },
			{ 255, 0, 223 },
			{ 255, 0, 239 } };

}
