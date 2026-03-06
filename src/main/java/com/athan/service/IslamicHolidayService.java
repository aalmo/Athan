package com.athan.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class IslamicHolidayService {
    private static final Logger logger = LoggerFactory.getLogger(IslamicHolidayService.class);

    // Islamic calendar is lunar and approximately 354-355 days
    // These dates are estimates and should be adjusted based on moon sighting
    // For production, you'd want to use a proper Islamic calendar library or API

    /**
     * Calculate Islamic holidays for the current year
     * Note: These are approximate dates. In practice, Islamic dates depend on moon sighting
     * and should be confirmed by local Islamic authorities.
     */
    public Map<String, LocalDate> calculateIslamicHolidays(int gregorianYear) {
        Map<String, LocalDate> holidays = new LinkedHashMap<>();

        // Approximate dates for Islamic year 1447-1448 (2025-2026)
        // These should be updated yearly or fetched from an Islamic calendar API

        if (gregorianYear == 2026) {
            // Eid al-Fitr (end of Ramadan) - approximately March 20-21, 2026
            holidays.put("EID_FITR", LocalDate.of(2026, 3, 21));

            // Eid al-Adha (Festival of Sacrifice) - approximately May 28-29, 2026
            holidays.put("EID_ADHA", LocalDate.of(2026, 5, 29));
        } else if (gregorianYear == 2027) {
            // Eid al-Fitr - approximately March 10-11, 2027
            holidays.put("EID_FITR", LocalDate.of(2027, 3, 11));

            // Eid al-Adha - approximately May 18-19, 2027
            holidays.put("EID_ADHA", LocalDate.of(2027, 5, 19));
        } else {
            // Default/fallback - use 2026 dates
            holidays.put("EID_FITR", LocalDate.of(2026, 3, 21));
            holidays.put("EID_ADHA", LocalDate.of(2026, 5, 29));
        }

        logger.info("Islamic holidays calculated for year {}: {}", gregorianYear, holidays);
        return holidays;
    }

    /**
     * Get the configured Takbeer times for a specific Islamic holiday
     * Takbeer times can be customized (e.g., after Fajr, before Eid prayer, etc.)
     */
    public List<LocalDateTime> getTakbeerTimes(LocalDate holidayDate, Map<String, LocalTime> configuredTimes) {
        List<LocalDateTime> takbeerTimes = new ArrayList<>();

        if (configuredTimes != null && !configuredTimes.isEmpty()) {
            // Use configured times
            for (Map.Entry<String, LocalTime> entry : configuredTimes.entrySet()) {
                takbeerTimes.add(LocalDateTime.of(holidayDate, entry.getValue()));
            }
        } else {
            // Default Takbeer times for Eid
            takbeerTimes.add(LocalDateTime.of(holidayDate, LocalTime.of(6, 0)));  // After Fajr
            takbeerTimes.add(LocalDateTime.of(holidayDate, LocalTime.of(7, 0)));  // Before Eid prayer
            takbeerTimes.add(LocalDateTime.of(holidayDate, LocalTime.of(8, 0)));  // Eid prayer time
        }

        return takbeerTimes;
    }

    /**
     * Check if today is an Islamic holiday
     */
    public String getTodaysHoliday(LocalDate today) {
        int year = today.getYear();
        Map<String, LocalDate> holidays = calculateIslamicHolidays(year);

        for (Map.Entry<String, LocalDate> holiday : holidays.entrySet()) {
            if (holiday.getValue().equals(today)) {
                return holiday.getKey();
            }
        }

        return null; // No holiday today
    }
}

