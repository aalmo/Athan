package com.athan.model;

import com.athan.util.PrayerAudioFilesDeserializer;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.util.*;

public class AudioConfig {
    @JsonProperty
    @JsonDeserialize(using = PrayerAudioFilesDeserializer.class)
    private Map<String, List<String>> prayerAudioFiles;

    @JsonProperty
    private int volume; // 0-100

    @JsonProperty
    private boolean enabled;

    @JsonProperty
    private String outputDevice; // Audio output device ID (null or "default" for system default)

    @JsonProperty
    private boolean ramadanMode; // Enable special Ramadan audio configuration

    @JsonProperty
    @JsonDeserialize(using = PrayerAudioFilesDeserializer.class)
    private Map<String, List<String>> ramadanAudioFiles; // Special audio files for Ramadan

    @JsonProperty
    private boolean islamicHolidaysEnabled; // Enable Islamic holidays audio

    @JsonProperty
    @JsonDeserialize(using = PrayerAudioFilesDeserializer.class)
    private Map<String, List<String>> islamicHolidayAudioFiles; // Audio files for Islamic holidays (EID_FITR, EID_ADHA)

    @JsonProperty
    private Map<String, List<String>> takbeerTimes; // Takbeer times for each holiday (e.g., "EID_FITR" -> ["06:00", "07:00", "08:00"])

    public AudioConfig() {
        this.prayerAudioFiles = new HashMap<>();
        // Initialize with single file per prayer (backward compatible)
        this.prayerAudioFiles.put("FAJR", Arrays.asList("fajr.mp3"));
        this.prayerAudioFiles.put("DHUHR", Arrays.asList("dhuhr.mp3"));
        this.prayerAudioFiles.put("ASR", Arrays.asList("asr.mp3"));
        this.prayerAudioFiles.put("MAGHRIB", Arrays.asList("maghrib.mp3"));
        this.prayerAudioFiles.put("ISHA", Arrays.asList("isha.mp3"));
        this.prayerAudioFiles.put("TASBEE7_1", Arrays.asList("tasbee7.mp3"));
        this.prayerAudioFiles.put("TASBEE7_2", Arrays.asList("tasbee7.mp3"));
        this.prayerAudioFiles.put("TASBEE7_3", Arrays.asList("tasbee7.mp3"));
        this.volume = 80;
        this.enabled = true;
        this.outputDevice = "default";

        // Initialize Ramadan configuration
        this.ramadanMode = false;
        this.ramadanAudioFiles = new HashMap<>();
        this.ramadanAudioFiles.put("FAJR", Arrays.asList("ramadan-fajr.mp3"));
        this.ramadanAudioFiles.put("DHUHR", Arrays.asList("ramadan-dhuhr.mp3"));
        this.ramadanAudioFiles.put("ASR", Arrays.asList("ramadan-asr.mp3"));
        this.ramadanAudioFiles.put("MAGHRIB", Arrays.asList("ramadan-maghrib.mp3"));
        this.ramadanAudioFiles.put("ISHA", Arrays.asList("ramadan-isha.mp3"));
        this.ramadanAudioFiles.put("TASBEE7_1", Arrays.asList("ramadan-tasbee7.mp3"));
        this.ramadanAudioFiles.put("TASBEE7_2", Arrays.asList("ramadan-tasbee7.mp3"));
        this.ramadanAudioFiles.put("TASBEE7_3", Arrays.asList("ramadan-tasbee7.mp3"));

        // Initialize Islamic holidays configuration
        this.islamicHolidaysEnabled = true;
        this.islamicHolidayAudioFiles = new HashMap<>();
        this.islamicHolidayAudioFiles.put("EID_FITR", Arrays.asList("eid-fitr-takbeer.mp3"));
        this.islamicHolidayAudioFiles.put("EID_ADHA", Arrays.asList("eid-adha-takbeer.mp3"));

        this.takbeerTimes = new HashMap<>();
        this.takbeerTimes.put("EID_FITR", Arrays.asList("06:00", "07:00", "08:00"));
        this.takbeerTimes.put("EID_ADHA", Arrays.asList("06:00", "07:00", "08:00"));
    }

    public Map<String, List<String>> getPrayerAudioFiles() {
        return prayerAudioFiles;
    }

    public void setPrayerAudioFiles(Map<String, List<String>> prayerAudioFiles) {
        this.prayerAudioFiles = prayerAudioFiles;
    }

    public int getVolume() {
        return volume;
    }

    public void setVolume(int volume) {
        this.volume = volume;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getOutputDevice() {
        return outputDevice;
    }

    public void setOutputDevice(String outputDevice) {
        this.outputDevice = outputDevice;
    }

    public boolean isRamadanMode() {
        return ramadanMode;
    }

    public void setRamadanMode(boolean ramadanMode) {
        this.ramadanMode = ramadanMode;
    }

    public Map<String, List<String>> getRamadanAudioFiles() {
        // Ensure backward compatibility - initialize if null
        if (ramadanAudioFiles == null) {
            ramadanAudioFiles = new HashMap<>();
            ramadanAudioFiles.put("FAJR", Arrays.asList("ramadan-fajr.mp3"));
            ramadanAudioFiles.put("DHUHR", Arrays.asList("ramadan-dhuhr.mp3"));
            ramadanAudioFiles.put("ASR", Arrays.asList("ramadan-asr.mp3"));
            ramadanAudioFiles.put("MAGHRIB", Arrays.asList("ramadan-maghrib.mp3"));
            ramadanAudioFiles.put("ISHA", Arrays.asList("ramadan-isha.mp3"));
            ramadanAudioFiles.put("TASBEE7_1", Arrays.asList("ramadan-tasbee7.mp3"));
            ramadanAudioFiles.put("TASBEE7_2", Arrays.asList("ramadan-tasbee7.mp3"));
            ramadanAudioFiles.put("TASBEE7_3", Arrays.asList("ramadan-tasbee7.mp3"));
        }
        return ramadanAudioFiles;
    }

    public void setRamadanAudioFiles(Map<String, List<String>> ramadanAudioFiles) {
        this.ramadanAudioFiles = ramadanAudioFiles;
    }

    public boolean isIslamicHolidaysEnabled() {
        return islamicHolidaysEnabled;
    }

    public void setIslamicHolidaysEnabled(boolean islamicHolidaysEnabled) {
        this.islamicHolidaysEnabled = islamicHolidaysEnabled;
    }

    public Map<String, List<String>> getIslamicHolidayAudioFiles() {
        if (islamicHolidayAudioFiles == null) {
            islamicHolidayAudioFiles = new HashMap<>();
            islamicHolidayAudioFiles.put("EID_FITR", Arrays.asList("eid-fitr-takbeer.mp3"));
            islamicHolidayAudioFiles.put("EID_ADHA", Arrays.asList("eid-adha-takbeer.mp3"));
        }
        return islamicHolidayAudioFiles;
    }

    public void setIslamicHolidayAudioFiles(Map<String, List<String>> islamicHolidayAudioFiles) {
        this.islamicHolidayAudioFiles = islamicHolidayAudioFiles;
    }

    public Map<String, List<String>> getTakbeerTimes() {
        if (takbeerTimes == null) {
            takbeerTimes = new HashMap<>();
            takbeerTimes.put("EID_FITR", Arrays.asList("06:00", "07:00", "08:00"));
            takbeerTimes.put("EID_ADHA", Arrays.asList("06:00", "07:00", "08:00"));
        }
        return takbeerTimes;
    }

    public void setTakbeerTimes(Map<String, List<String>> takbeerTimes) {
        this.takbeerTimes = takbeerTimes;
    }
}

