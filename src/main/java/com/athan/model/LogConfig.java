package com.athan.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LogConfig {

    @JsonProperty
    private String logFilePath = "logs/athan.log";

    @JsonProperty
    private String logLevel = "INFO";          // TRACE, DEBUG, INFO, WARN, ERROR

    @JsonProperty
    private int maxFileSizeMB = 10;            // rolling file max size (MB)

    @JsonProperty
    private int maxHistory = 7;               // days / files to keep

    @JsonProperty
    private int maxDisplayLines = 500;         // lines returned to the UI

    public String getLogFilePath() { return logFilePath; }
    public void setLogFilePath(String logFilePath) { this.logFilePath = logFilePath; }

    public String getLogLevel() { return logLevel; }
    public void setLogLevel(String logLevel) { this.logLevel = logLevel; }

    public int getMaxFileSizeMB() { return maxFileSizeMB; }
    public void setMaxFileSizeMB(int maxFileSizeMB) { this.maxFileSizeMB = maxFileSizeMB; }

    public int getMaxHistory() { return maxHistory; }
    public void setMaxHistory(int maxHistory) { this.maxHistory = maxHistory; }

    public int getMaxDisplayLines() { return maxDisplayLines; }
    public void setMaxDisplayLines(int maxDisplayLines) { this.maxDisplayLines = maxDisplayLines; }
}

