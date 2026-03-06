package com.athan.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PrayerConfig {
    @JsonProperty
    private String city;

    @JsonProperty
    private double latitude;

    @JsonProperty
    private double longitude;

    @JsonProperty
    private String timezone;

    @JsonProperty
    private String calculationMethod; // MUSLIM_WORLD_LEAGUE, EGYPTIAN, KARACHI, UMM_AL_QURA, DUBAI, MOON_SIGHTING_COMMITTEE, NORTH_AMERICA, KUWAIT, QATAR

    @JsonProperty
    private int fajrOffsetMinutes;     // offset in minutes (+/-) applied to Fajr time

    @JsonProperty
    private int maghribOffsetMinutes;  // offset in minutes (+/-) applied to Maghrib time

    @JsonProperty
    private AudioConfig audioConfig;

    public PrayerConfig() {
        this.audioConfig = new AudioConfig();
        this.calculationMethod = "MUSLIM_WORLD_LEAGUE";
    }

    // Getters and Setters
    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getCalculationMethod() {
        return calculationMethod;
    }

    public void setCalculationMethod(String calculationMethod) {
        this.calculationMethod = calculationMethod;
    }

    public int getFajrOffsetMinutes() {
        return fajrOffsetMinutes;
    }

    public void setFajrOffsetMinutes(int fajrOffsetMinutes) {
        this.fajrOffsetMinutes = fajrOffsetMinutes;
    }

    public int getMaghribOffsetMinutes() {
        return maghribOffsetMinutes;
    }

    public void setMaghribOffsetMinutes(int maghribOffsetMinutes) {
        this.maghribOffsetMinutes = maghribOffsetMinutes;
    }

    public AudioConfig getAudioConfig() {
        return audioConfig;
    }

    public void setAudioConfig(AudioConfig audioConfig) {
        this.audioConfig = audioConfig;
    }
}

