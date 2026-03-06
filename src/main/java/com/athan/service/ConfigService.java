package com.athan.service;

import com.athan.model.PrayerConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
public class ConfigService {
    private static final Logger logger = LoggerFactory.getLogger(ConfigService.class);
    private static final String CONFIG_FILE = "config.json";
    private final ObjectMapper objectMapper = new ObjectMapper();
    private PrayerConfig config;

    public ConfigService() {
        loadConfig();
    }

    public PrayerConfig getConfig() {
        if (config == null) {
            config = getDefaultConfig();
        }
        return config;
    }

    public void saveConfig(PrayerConfig config) {
        this.config = config;
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(CONFIG_FILE), config);
            logger.info("Configuration saved successfully");
        } catch (IOException e) {
            logger.error("Error saving configuration", e);
        }
    }

    private void loadConfig() {
        try {
            File configFile = new File(CONFIG_FILE);
            if (configFile.exists()) {
                config = objectMapper.readValue(configFile, PrayerConfig.class);
                logger.info("Configuration loaded successfully");
            } else {
                config = getDefaultConfig();
                saveConfig(config);
            }
        } catch (IOException e) {
            logger.error("Error loading configuration, using defaults", e);
            config = getDefaultConfig();
        }
    }

    private PrayerConfig getDefaultConfig() {
        PrayerConfig defaultConfig = new PrayerConfig();
        defaultConfig.setCity("Mecca");
        defaultConfig.setLatitude(21.4225);
        defaultConfig.setLongitude(39.8262);
        defaultConfig.setTimezone("Asia/Riyadh");
        defaultConfig.setCalculationMethod("UMM_AL_QURA");
        return defaultConfig;
    }
}

