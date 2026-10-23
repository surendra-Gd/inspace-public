package com.backend.demo.common;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import javax.annotation.PostConstruct;
import java.util.TimeZone;

@Component
public class TimeZoneInitializr {

    private static final Logger logger = LoggerFactory.getLogger(TimeZoneInitializr.class);

    @PostConstruct
    public void init() {
        // Set the time zone programmatically
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));

        // Log the current time zone to verify it's set
        logger.info("Current TimeZone: {}", TimeZone.getDefault().getID());
    }
}

