package com.skycision.flight;

public class WaypointCountException extends Exception {

	public WaypointCountException(String message) {
		super(message);
	}
	
	public WaypointCountException(String message, Throwable cause) {
		super(message, cause);
	}

	public WaypointCountException(String message, Throwable cause, boolean enableSuppression) {
		super(message, cause, enableSuppression, true);
	}

	public WaypointCountException() {
		super();
	}

	/**
	 * 
	 */
	private static final long serialVersionUID = -1938428706093903719L;
	

	public static class TooManyWaypointsException extends Throwable {
		/**
		 * 
		 */
		private static final long serialVersionUID = -4057530651113189748L;

		public TooManyWaypointsException() {
			super("More than 1000 waypoints generated.");
		}

	}

	public static class TooFewWaypointsException extends Throwable {
		/**
		 * 
		 */
		private static final long serialVersionUID = -4057530651113189748L;

		public TooFewWaypointsException() {
			super("Fewer than 4 waypoints generated.");
		}

	}

}
