package com.skycision.model;

import java.util.Scanner;

public class CommandLineMultiThread implements Runnable
{
	private Scanner s;
	private ResourceManager rm;//= ResourceManager.rm();
	
//	private InputThread myThread;
	
    public CommandLineMultiThread(ResourceManager rm)
    {
    	this.rm = rm;
        s = new Scanner(System.in);

        // Makes and runs the background thread.
        
//        myThread = new InputThread();
//        Thread t = new Thread(myThread);
//        t.start();


    }
    
//    class InputThread implements Runnable
//    {
//    	String thisTrigger = trigger;
//        boolean running = true;                // Boolean to keep thread alive.
//        long greetingTime = Long.MAX_VALUE;    // Time to greet at.
//
//        public void setGreetIn(int i)
//        {
//            greetingTime = System.currentTimeMillis() + (i * 1000);
//        }
//
//        public void quit()
//        {
//            running = false;
//        }
//
//        public void run()
//        {
//            while (running)
//            {
//                if (System.currentTimeMillis() > greetingTime)
//                {
//                    System.out.println("Hello!");
//                    greetingTime = Long.MAX_VALUE;
//                }
//
//                try
//                {
//                    Thread.sleep(100);
//                }
//                catch (InterruptedException e) {}
//            }
//        }
//    }

	@Override
	public void run() {
		
		s.useDelimiter("\\n");
		boolean end = false;
        // Get the number of seconds to wait from the console.
        // Exit when "0" is entered.
//        int waitDuration;
        do {
        	
        	String cmdLine = s.nextLine();
        	System.out.println(cmdLine);
        	if ( cmdLine.equals("add") ) {
        		
        		System.out.println("Enter CognitoID:");
        		String partnerId = s.nextLine();
        		System.out.println("\t" + partnerId);
        		
        		System.out.println("Enter partnerIds, comma-separated:");
        		String clientIds = s.nextLine().trim();
        		String[] splitIds = clientIds.split(",");
        		
        		rm.addPartner(partnerId,splitIds);
        		
        	} else if ( cmdLine.equals("end") ) {
        		end = true;
        	}
//            waitDuration = s.nextInt();
//            myThread.setGreetIn(waitDuration);
        	try {
				Thread.sleep(500);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        } while (end == false);
        
//        myThread.quit();
		
	}
}