package com.athan.model;

import java.time.LocalDateTime;

public class PrayerTime {
    private String name;
    private LocalDateTime time;

    public PrayerTime(String name, LocalDateTime time) {
        this.name = name;
        this.time = time;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}

