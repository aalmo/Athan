package com.athan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AthanApplication {
    public static void main(String[] args) {
        SpringApplication.run(AthanApplication.class, args);
    }
}

