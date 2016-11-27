package com.skycision.farm;

import java.util.HashMap;
import java.util.Properties;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SendMail {
	private static final Logger logger = LoggerFactory.getLogger(SendMail.class);
	
	public static void sendMail(HashMap<String,Object> request) {
		
		String firstName = request.get("firstName").toString();
		String lastName = request.get("lastName").toString();
		String email = request.get("email").toString();
		String subject = request.get("subject").toString();
		String messageContent = request.get("message").toString();
		
		Properties props = new Properties();
		props.put("mail.smtp.auth", "true");
		props.put("mail.smtp.starttls.enable", "true");
		props.put("mail.smtp.host", "smtp.gmail.com");
		props.put("mail.smtp.port", "587");

		Session session = Session.getInstance(props, new javax.mail.Authenticator() {
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(System.getenv("MAIL_USER"), System.getenv("MAIL_PASS"));
			}
		});

		try {

			Message message = new MimeMessage(session);
			message.setFrom(new InternetAddress("skycisiontest@gmail.com"));
			message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("alec.assaad@gmail.com"));
			message.setSubject("Skycision.com Contact: "+firstName + " " + lastName);
			message.setText( firstName+" "+lastName+"\n\nSubject: " + subject + "\nMessage Content: "+messageContent+"\n\n contact email: "+email);

			Transport.send(message);

			logger.info("MAIL SENT");

		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}
	}

}