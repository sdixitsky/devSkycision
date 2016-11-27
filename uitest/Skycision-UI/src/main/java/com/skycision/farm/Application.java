package com.skycision.farm;

import org.apache.catalina.Context;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.boot.context.web.SpringBootServletInitializer;

import com.skycision.model.ResourceManager;

@SpringBootApplication
public class Application extends SpringBootServletInitializer {
	
	TomcatEmbeddedServletContainerFactory tomcat = new TomcatEmbeddedServletContainerFactory() {
	    @Override
	    protected void postProcessContext(Context context) {
	        SecurityConstraint securityConstraint = new SecurityConstraint();
	        securityConstraint.setUserConstraint("CONFIDENTIAL");
	        SecurityCollection collection = new SecurityCollection();
	        collection.addPattern("/*");
	        securityConstraint.addCollection(collection);
	        context.addConstraint(securityConstraint);
	    }
	};
	
	@Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }
	
	
	public static void main(String[] args) throws Exception {
		int isInit = ResourceManager.init();
		
		if (isInit == 1) {
			SpringApplication app = new SpringApplication(Application.class);
//			// ... customize app settings here
			app.run(args);
		}
	}
}
