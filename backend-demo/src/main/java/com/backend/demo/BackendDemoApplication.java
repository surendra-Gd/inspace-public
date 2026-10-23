package com.backend.demo;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendDemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendDemoApplication.class, args);
	}

}

// Todo: There was big error in pagination on projection queries
//  check by changing page size we will get point.