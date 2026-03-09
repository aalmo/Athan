package com.athan.service;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.rolling.RollingFileAppender;
import ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy;
import ch.qos.logback.core.util.FileSize;
import com.athan.model.LogConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

@Service
public class LogConfigService {

    private static final org.slf4j.Logger logger = LoggerFactory.getLogger(LogConfigService.class);
    private static final String LOG_CONFIG_FILE = "log-config.json";
    private static final String APPENDER_NAME = "ATHAN_FILE";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private LogConfig logConfig;

    public LogConfigService() {
        loadConfig();
        applyConfig(logConfig);
    }

    // ─── Persistence ──────────────────────────────────────────────

    public LogConfig getConfig() {
        if (logConfig == null) logConfig = new LogConfig();
        return logConfig;
    }

    public void saveConfig(LogConfig config) {
        this.logConfig = config;
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(LOG_CONFIG_FILE), config);
            applyConfig(config);
            logger.info("Log configuration saved and applied: level={}, path={}", config.getLogLevel(), config.getLogFilePath());
        } catch (IOException e) {
            logger.error("Error saving log configuration", e);
        }
    }

    private void loadConfig() {
        try {
            File f = new File(LOG_CONFIG_FILE);
            if (f.exists()) {
                logConfig = objectMapper.readValue(f, LogConfig.class);
                logger.info("Log configuration loaded from {}", LOG_CONFIG_FILE);
            } else {
                logConfig = new LogConfig();
                saveConfig(logConfig); // persist defaults
            }
        } catch (IOException e) {
            logger.error("Error loading log configuration", e);
            logConfig = new LogConfig();
        }
    }

    // ─── Logback Dynamic Reconfiguration ──────────────────────────

    public void applyConfig(LogConfig config) {
        try {
            LoggerContext ctx = (LoggerContext) LoggerFactory.getILoggerFactory();

            // 1. Set log level on the root com.athan package
            Logger athanLogger = ctx.getLogger("com.athan");
            athanLogger.setLevel(Level.valueOf(config.getLogLevel().toUpperCase()));

            // 2. Stop and detach any existing file appender we manage
            Logger rootLogger = ctx.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME);
            var existingAppender = rootLogger.getAppender(APPENDER_NAME);
            if (existingAppender != null) {
                existingAppender.stop();
                rootLogger.detachAppender(APPENDER_NAME);
            }

            // 3. Ensure parent log dir exists
            Path logPath = Paths.get(config.getLogFilePath());
            if (logPath.getParent() != null) {
                Files.createDirectories(logPath.getParent());
            }

            // 4. Build encoder
            PatternLayoutEncoder encoder = new PatternLayoutEncoder();
            encoder.setContext(ctx);
            encoder.setPattern("%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n");
            encoder.start();

            // 5. Build rolling policy
            RollingFileAppender<ILoggingEvent> fileAppender = new RollingFileAppender<>();
            fileAppender.setName(APPENDER_NAME);
            fileAppender.setContext(ctx);
            fileAppender.setFile(config.getLogFilePath());

            SizeAndTimeBasedRollingPolicy<ILoggingEvent> policy = new SizeAndTimeBasedRollingPolicy<>();
            policy.setContext(ctx);
            policy.setParent(fileAppender);
            policy.setFileNamePattern(config.getLogFilePath() + ".%d{yyyy-MM-dd}.%i.gz");
            policy.setMaxFileSize(new FileSize(config.getMaxFileSizeMB() * 1024L * 1024L));
            policy.setMaxHistory(config.getMaxHistory());
            policy.start();

            fileAppender.setRollingPolicy(policy);
            fileAppender.setEncoder(encoder);
            fileAppender.start();

            // 6. Attach to root logger so ALL output goes to file too
            rootLogger.addAppender(fileAppender);

            logger.info("Log file appender applied: {} (level={})", config.getLogFilePath(), config.getLogLevel());
        } catch (Exception e) {
            logger.error("Failed to apply log configuration", e);
        }
    }

    // ─── Log Reading ──────────────────────────────────────────────

    /**
     * Returns the last {@code maxLines} lines of the configured log file.
     */
    public List<String> readRecentLogs(int maxLines) {
        Path path = Paths.get(logConfig.getLogFilePath());
        if (!Files.exists(path)) {
            return List.of("No log file found at: " + path.toAbsolutePath());
        }
        try {
            List<String> allLines = Files.readAllLines(path, StandardCharsets.UTF_8);
            int from = Math.max(0, allLines.size() - maxLines);
            return allLines.subList(from, allLines.size());
        } catch (IOException e) {
            logger.error("Error reading log file", e);
            return List.of("Error reading log file: " + e.getMessage());
        }
    }

    /**
     * Returns log file metadata.
     */
    public Map<String, Object> getLogFileMeta() {
        Path path = Paths.get(logConfig.getLogFilePath());
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("path", path.toAbsolutePath().toString());
        meta.put("exists", Files.exists(path));
        try {
            if (Files.exists(path)) {
                meta.put("sizeKB", Files.size(path) / 1024);
                meta.put("lastModified", Files.getLastModifiedTime(path).toString());
            }
        } catch (IOException ignored) {}
        return meta;
    }
}


