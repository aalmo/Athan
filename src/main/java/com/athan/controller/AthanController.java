package com.athan.controller;

import com.athan.model.LogConfig;
import com.athan.model.PrayerConfig;
import com.athan.service.AthanSchedulerService;
import com.athan.service.AudioPlayerService;
import com.athan.service.ConfigService;
import com.athan.service.IslamicHolidayService;
import com.athan.service.LogConfigService;
import com.athan.service.PrayerTimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class AthanController {

    @Autowired
    private ConfigService configService;

    @Autowired
    private PrayerTimeService prayerTimeService;

    @Autowired
    private AthanSchedulerService schedulerService;

    @Autowired
    private AudioPlayerService audioPlayerService;

    @Autowired
    private IslamicHolidayService islamicHolidayService;

    @Autowired
    private LogConfigService logConfigService;

    @GetMapping("/")
    public String index(Model model) {
        PrayerConfig config = configService.getConfig();
        Map<String, LocalDateTime> prayerTimes = schedulerService.getTodaysPrayerTimes();

        // Format prayer times for display — sorted by time (earliest first)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        Map<String, String> formattedTimes = prayerTimes.entrySet().stream()
            .sorted(Map.Entry.comparingByValue())
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().format(formatter),
                (a, b) -> a,
                LinkedHashMap::new
            ));

        // Get Islamic holidays for current year
        int currentYear = LocalDateTime.now().getYear();
        Map<String, java.time.LocalDate> islamicHolidays = islamicHolidayService.calculateIslamicHolidays(currentYear);
        Map<String, String> formattedHolidays = new LinkedHashMap<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy");
        for (Map.Entry<String, java.time.LocalDate> entry : islamicHolidays.entrySet()) {
            formattedHolidays.put(entry.getKey(), entry.getValue().format(dateFormatter));
        }

        model.addAttribute("config", config);
        model.addAttribute("prayerTimes", formattedTimes);
        model.addAttribute("islamicHolidays", formattedHolidays);
        model.addAttribute("nextPrayer", prayerTimeService.getNextPrayer(prayerTimes));
        model.addAttribute("audioFiles", getAvailableAudioFiles());
        model.addAttribute("calculationMethods", getCalculationMethods());
        model.addAttribute("timezones", getCommonTimezones());
        model.addAttribute("audioDevices", audioPlayerService.getAvailableAudioDevices());

        // 24-hour times for countdown JS (locale-independent)
        DateTimeFormatter fmt24 = DateTimeFormatter.ofPattern("HH:mm");
        Map<String, String> times24h = prayerTimes.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().format(fmt24)
            ));
        model.addAttribute("prayerTimes24h", times24h);

        return "index";
    }

    @PostMapping("/api/config")
    @ResponseBody
    public ResponseEntity<?> updateConfig(@RequestBody PrayerConfig config) {
        try {
            configService.saveConfig(config);
            schedulerService.refreshPrayerTimes();
            return ResponseEntity.ok(Map.of("success", true, "message", "Configuration updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/api/audio-files")
    @ResponseBody
    public ResponseEntity<?> getAudioFiles() {
        return ResponseEntity.ok(getAvailableAudioFiles());
    }

    @GetMapping("/api/prayer-times")
    @ResponseBody
    public ResponseEntity<?> getPrayerTimes() {
        Map<String, LocalDateTime> prayerTimes = schedulerService.getTodaysPrayerTimes();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");

        Map<String, String> formattedTimes = prayerTimes.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().format(formatter)
            ));

        return ResponseEntity.ok(formattedTimes);
    }

    @GetMapping("/api/prayer-times/tomorrow")
    @ResponseBody
    public ResponseEntity<?> getTomorrowPrayerTimes() {
        PrayerConfig config = configService.getConfig();
        java.time.LocalDate tomorrow = java.time.LocalDate.now().plusDays(1);
        Map<String, LocalDateTime> prayerTimes = prayerTimeService.calculatePrayerTimesForDate(config, tomorrow);
        DateTimeFormatter fmt24 = DateTimeFormatter.ofPattern("HH:mm");

        Map<String, String> formattedTimes = prayerTimes.entrySet().stream()
            .filter(e -> !e.getKey().equals("SUNRISE"))
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().format(fmt24)
            ));

        return ResponseEntity.ok(formattedTimes);
    }

    @PostMapping("/api/test-audio")
    @ResponseBody
    public ResponseEntity<?> testAudio(@RequestBody Map<String, Object> request) {
        int volume = configService.getConfig().getAudioConfig().getVolume();

        // Support both single file and file list
        if (request.containsKey("files")) {
            @SuppressWarnings("unchecked")
            List<String> files = (List<String>) request.get("files");
            audioPlayerService.playAudioSequence(files, volume);
        } else if (request.containsKey("filename")) {
            String filename = (String) request.get("filename");
            audioPlayerService.playAudio(filename, volume);
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No filename or files provided"));
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/api/stop-audio")
    @ResponseBody
    public ResponseEntity<?> stopAudio() {
        try {
            audioPlayerService.stopCurrentPlayback();
            return ResponseEntity.ok(Map.of("success", true, "message", "Audio stopped"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/api/audio-devices")
    @ResponseBody
    public ResponseEntity<?> getAudioDevices() {
        try {
            List<Map<String, String>> devices = audioPlayerService.getAvailableAudioDevices();
            return ResponseEntity.ok(devices);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/api/upload-audio")
    @ResponseBody
    public ResponseEntity<?> uploadAudioFile(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No file uploaded"));
            }

            // Get original filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid filename"));
            }

            // Validate file extension
            String lowercaseFilename = originalFilename.toLowerCase();
            if (!lowercaseFilename.endsWith(".mp3") && !lowercaseFilename.endsWith(".wav")) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Only MP3 and WAV files are supported"));
            }

            // Ensure audio directory exists
            File audioDir = new File("audio");
            if (!audioDir.exists()) {
                audioDir.mkdirs();
            }

            // Save file
            Path targetPath = Paths.get("audio", originalFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "File uploaded successfully",
                "filename", originalFilename
            ));

        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Unexpected error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/api/delete-audio/{filename}")
    @ResponseBody
    public ResponseEntity<?> deleteAudioFile(@PathVariable("filename") String filename) {
        try {
            // Validate filename
            if (filename == null || filename.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid filename"));
            }

            // Prevent path traversal attacks
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid filename"));
            }

            // Delete file
            Path filePath = Paths.get("audio", filename);
            File file = filePath.toFile();

            if (!file.exists()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "File not found"));
            }

            if (file.delete()) {
                return ResponseEntity.ok(Map.of("success", true, "message", "File deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to delete file"));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Error deleting file: " + e.getMessage()));
        }
    }

    private List<String> getAvailableAudioFiles() {
        File audioDir = new File("audio");
        if (!audioDir.exists()) {
            audioDir.mkdirs();
        }

        File[] files = audioDir.listFiles((dir, name) ->
            name.toLowerCase().endsWith(".mp3") || name.toLowerCase().endsWith(".wav")
        );

        if (files == null || files.length == 0) {
            return new ArrayList<>();
        }

        return Arrays.stream(files)
            .map(File::getName)
            .sorted()
            .collect(Collectors.toList());
    }

    // ─── Log Configuration & Viewer ────────────────────────────────────

    @GetMapping("/api/log-config")
    @ResponseBody
    public ResponseEntity<?> getLogConfig() {
        return ResponseEntity.ok(logConfigService.getConfig());
    }

    @PostMapping("/api/log-config")
    @ResponseBody
    public ResponseEntity<?> saveLogConfig(@RequestBody LogConfig config) {
        try {
            // Validate level
            List<String> validLevels = Arrays.asList("TRACE", "DEBUG", "INFO", "WARN", "ERROR");
            if (!validLevels.contains(config.getLogLevel().toUpperCase())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid log level"));
            }
            config.setLogLevel(config.getLogLevel().toUpperCase());
            logConfigService.saveConfig(config);
            return ResponseEntity.ok(Map.of("success", true, "message", "Log configuration saved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/api/logs")
    @ResponseBody
    public ResponseEntity<?> getLogs(@RequestParam(value = "lines", defaultValue = "500") int lines) {
        try {
            lines = Math.min(lines, 2000); // hard cap
            List<String> logLines = logConfigService.readRecentLogs(lines);
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("lines", logLines);
            result.put("meta", logConfigService.getLogFileMeta());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private List<String> getCalculationMethods() {
        return Arrays.asList(
            "MUSLIM_WORLD_LEAGUE",
            "EGYPTIAN",
            "KARACHI",
            "UMM_AL_QURA",
            "DUBAI",
            "MOON_SIGHTING_COMMITTEE",
            "NORTH_AMERICA",
            "KUWAIT",
            "QATAR"
        );
    }

    private List<String> getCommonTimezones() {
        return Arrays.asList(
            "Asia/Riyadh",
            "Asia/Dubai",
            "Asia/Kuwait",
            "Asia/Qatar",
            "Asia/Bahrain",
            "Asia/Muscat",
            "Asia/Karachi",
            "Asia/Jakarta",
            "Asia/Kuala_Lumpur",
            "Asia/Istanbul",
            "Europe/London",
            "Europe/Paris",
            "America/New_York",
            "America/Chicago",
            "America/Los_Angeles"
        );
    }
}

