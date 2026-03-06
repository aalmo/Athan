package com.athan.service;

import com.athan.model.PrayerConfig;
import com.batoulapps.adhan.*;
import com.batoulapps.adhan.data.DateComponents;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

@Service
public class PrayerTimeService {
    private static final Logger logger = LoggerFactory.getLogger(PrayerTimeService.class);

    public Map<String, LocalDateTime> calculatePrayerTimes(PrayerConfig config) {
        Map<String, LocalDateTime> prayerTimes = new LinkedHashMap<>();

        try {
            Coordinates coordinates = new Coordinates(config.getLatitude(), config.getLongitude());
            DateComponents dateComponents = DateComponents.from(new Date());
            CalculationParameters parameters = getCalculationParameters(config.getCalculationMethod());

            PrayerTimes times = new PrayerTimes(coordinates, dateComponents, parameters);

            ZoneId zoneId = ZoneId.of(config.getTimezone() != null ? config.getTimezone() : ZoneId.systemDefault().getId());

            // Base times with offsets applied
            LocalDateTime fajr    = convertToLocalDateTime(times.fajr,    zoneId).plusMinutes(config.getFajrOffsetMinutes());
            LocalDateTime maghrib = convertToLocalDateTime(times.maghrib,  zoneId).plusMinutes(config.getMaghribOffsetMinutes());

            prayerTimes.put("FAJR",    fajr);
            prayerTimes.put("SUNRISE", convertToLocalDateTime(times.sunrise, zoneId));
            prayerTimes.put("DHUHR",   convertToLocalDateTime(times.dhuhr,   zoneId));
            prayerTimes.put("ASR",     convertToLocalDateTime(times.asr,     zoneId));
            prayerTimes.put("MAGHRIB", maghrib);
            prayerTimes.put("ISHA",    convertToLocalDateTime(times.isha,    zoneId));

            // Calculate Tasbee7 times
            LocalDateTime midnight = fajr.toLocalDate().atStartOfDay(); // midnight 00:00 of the same day

            // Calculate time difference in minutes between Fajr and midnight
            long minutesBetweenMidnightAndFajr = java.time.Duration.between(midnight, fajr).toMinutes();

            // Tasbee7 1: 1/3 of the time between Fajr and midnight
            long tasbee7_1_offset = minutesBetweenMidnightAndFajr / 3;
            LocalDateTime tasbee7_1 = midnight.plusMinutes(tasbee7_1_offset);

            // Tasbee7 2: 2/3 of the time between Fajr and midnight
            long tasbee7_2_offset = (minutesBetweenMidnightAndFajr * 2) / 3;
            LocalDateTime tasbee7_2 = midnight.plusMinutes(tasbee7_2_offset);

            // Tasbee7 3: 1/2 of the time between Fajr and Tasbee7 2
            long minutesBetweenFajrAndTasbee7_2 = java.time.Duration.between(fajr, tasbee7_2).toMinutes();
            LocalDateTime tasbee7_3 = fajr.plusMinutes(minutesBetweenFajrAndTasbee7_2 / 2);

            prayerTimes.put("TASBEE7_1", tasbee7_1);
            prayerTimes.put("TASBEE7_2", tasbee7_2);
            prayerTimes.put("TASBEE7_3", tasbee7_3);

            logger.info("Prayer times calculated for {}: {}", config.getCity(), prayerTimes);
        } catch (Exception e) {
            logger.error("Error calculating prayer times", e);
        }

        return prayerTimes;
    }

    private LocalDateTime convertToLocalDateTime(Date date, ZoneId zoneId) {
        return ZonedDateTime.ofInstant(date.toInstant(), zoneId).toLocalDateTime();
    }

    private CalculationParameters getCalculationParameters(String method) {
        if (method == null) {
            return CalculationMethod.MUSLIM_WORLD_LEAGUE.getParameters();
        }

        return switch (method) {
            case "EGYPTIAN" -> CalculationMethod.EGYPTIAN.getParameters();
            case "KARACHI" -> CalculationMethod.KARACHI.getParameters();
            case "UMM_AL_QURA" -> CalculationMethod.UMM_AL_QURA.getParameters();
            case "DUBAI" -> CalculationMethod.DUBAI.getParameters();
            case "MOON_SIGHTING_COMMITTEE" -> CalculationMethod.MOON_SIGHTING_COMMITTEE.getParameters();
            case "NORTH_AMERICA" -> CalculationMethod.NORTH_AMERICA.getParameters();
            case "KUWAIT" -> CalculationMethod.KUWAIT.getParameters();
            case "QATAR" -> CalculationMethod.QATAR.getParameters();
            default -> CalculationMethod.MUSLIM_WORLD_LEAGUE.getParameters();
        };
    }

    public String getNextPrayer(Map<String, LocalDateTime> prayerTimes) {
        LocalDateTime now = LocalDateTime.now();

        for (Map.Entry<String, LocalDateTime> entry : prayerTimes.entrySet()) {
            if (entry.getValue().isAfter(now) && !entry.getKey().equals("SUNRISE")) {
                return entry.getKey();
            }
        }

        return "FAJR"; // Next day Fajr
    }
}

