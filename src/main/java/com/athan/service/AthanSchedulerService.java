package com.athan.service;

import com.athan.model.PrayerConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
public class AthanSchedulerService {
    private static final Logger logger = LoggerFactory.getLogger(AthanSchedulerService.class);

    @Autowired
    private PrayerTimeService prayerTimeService;

    @Autowired
    private AudioPlayerService audioPlayerService;

    @Autowired
    private ConfigService configService;

    @Autowired
    private IslamicHolidayService islamicHolidayService;

    private Map<String, LocalDateTime> todaysPrayerTimes;

    // Check every minute if it's time for prayer
    @Scheduled(fixedRate = 60000) // 60 seconds
    public void checkPrayerTime() {
        PrayerConfig config = configService.getConfig();

        if (!config.getAudioConfig().isEnabled()) {
            return;
        }

        // Recalculate prayer times if needed (e.g., new day or first run)
        if (todaysPrayerTimes == null || isNewDay()) {
            todaysPrayerTimes = prayerTimeService.calculatePrayerTimes(config);
            logger.info("Prayer times updated: {}", todaysPrayerTimes);
        }

        LocalDateTime now = LocalDateTime.now();

        // Check if current time matches any prayer time (within 1 minute window)
        for (Map.Entry<String, LocalDateTime> entry : todaysPrayerTimes.entrySet()) {
            String prayerName = entry.getKey();
            LocalDateTime prayerTime = entry.getValue();

            // Skip sunrise as it's not a prayer time
            if (prayerName.equals("SUNRISE")) {
                continue;
            }

            long minutesDiff = ChronoUnit.MINUTES.between(prayerTime, now);

            // If we're within the same minute as prayer time
            if (minutesDiff == 0) {
                playAthan(prayerName, config);
            }
        }

        // Check for Islamic holidays Takbeer times
        checkIslamicHolidaysTakbeer(config, now);
    }

    private void checkIslamicHolidaysTakbeer(PrayerConfig config, LocalDateTime now) {
        // Check if Islamic holidays feature is enabled
        if (!config.getAudioConfig().isIslamicHolidaysEnabled()) {
            return;
        }

        // Check if today is an Islamic holiday
        String todaysHoliday = islamicHolidayService.getTodaysHoliday(now.toLocalDate());

        if (todaysHoliday == null) {
            return; // Not a holiday today
        }

        logger.info("Today is {}", todaysHoliday);

        // Get configured Takbeer times for this holiday
        Map<String, List<String>> takbeerTimesConfig = config.getAudioConfig().getTakbeerTimes();

        if (takbeerTimesConfig == null || !takbeerTimesConfig.containsKey(todaysHoliday)) {
            logger.warn("No Takbeer times configured for {}", todaysHoliday);
            return;
        }

        List<String> takbeerTimes = takbeerTimesConfig.get(todaysHoliday);

        if (takbeerTimes == null || takbeerTimes.isEmpty()) {
            return;
        }

        // Check each configured Takbeer time
        for (String timeStr : takbeerTimes) {
            try {
                // Parse time string (HH:MM format)
                String[] parts = timeStr.split(":");
                if (parts.length != 2) {
                    logger.warn("Invalid Takbeer time format: {}", timeStr);
                    continue;
                }

                int hour = Integer.parseInt(parts[0]);
                int minute = Integer.parseInt(parts[1]);

                // Check if current time matches this Takbeer time
                if (now.getHour() == hour && now.getMinute() == minute) {
                    playTakbeer(todaysHoliday, config);
                    break; // Only play once per minute
                }
            } catch (NumberFormatException e) {
                logger.error("Error parsing Takbeer time: {}", timeStr, e);
            }
        }
    }

    private void playTakbeer(String holiday, PrayerConfig config) {
        logger.info("It's time for Takbeer - {}", holiday);

        // Get audio files for this holiday
        Map<String, List<String>> holidayAudioFiles = config.getAudioConfig().getIslamicHolidayAudioFiles();

        if (holidayAudioFiles == null || !holidayAudioFiles.containsKey(holiday)) {
            logger.warn("No audio files configured for {}", holiday);
            return;
        }

        List<String> audioFiles = holidayAudioFiles.get(holiday);
        int volume = config.getAudioConfig().getVolume();

        if (audioFiles != null && !audioFiles.isEmpty()) {
            logger.info("Playing {} Takbeer audio file(s) for {}", audioFiles.size(), holiday);
            audioPlayerService.playAudioSequence(audioFiles, volume);
        } else {
            logger.warn("No audio files configured for {}", holiday);
        }
    }

    private void playAthan(String prayerName, PrayerConfig config) {
        logger.info("It's time for {}", prayerName);

        // Check if Ramadan mode is enabled and use appropriate audio files
        boolean isRamadan = config.getAudioConfig().isRamadanMode();
        List<String> audioFiles;

        if (isRamadan && config.getAudioConfig().getRamadanAudioFiles() != null) {
            audioFiles = config.getAudioConfig().getRamadanAudioFiles().get(prayerName);
            logger.info("Ramadan mode enabled - using special Ramadan audio for {}", prayerName);
        } else {
            audioFiles = config.getAudioConfig().getPrayerAudioFiles().get(prayerName);
        }

        int volume = config.getAudioConfig().getVolume();

        if (audioFiles != null && !audioFiles.isEmpty()) {
            logger.info("Playing {} audio file(s) for {}", audioFiles.size(), prayerName);
            audioPlayerService.playAudioSequence(audioFiles, volume);
        } else {
            logger.warn("No audio files configured for {}", prayerName);
        }
    }

    private boolean isNewDay() {
        if (todaysPrayerTimes == null || todaysPrayerTimes.isEmpty()) {
            return true;
        }

        LocalDateTime firstPrayerTime = todaysPrayerTimes.values().iterator().next();
        LocalDateTime now = LocalDateTime.now();

        return !firstPrayerTime.toLocalDate().equals(now.toLocalDate());
    }

    public Map<String, LocalDateTime> getTodaysPrayerTimes() {
        if (todaysPrayerTimes == null) {
            todaysPrayerTimes = prayerTimeService.calculatePrayerTimes(configService.getConfig());
        }
        return todaysPrayerTimes;
    }

    public void refreshPrayerTimes() {
        todaysPrayerTimes = prayerTimeService.calculatePrayerTimes(configService.getConfig());
    }
}

