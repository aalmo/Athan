package com.athan.util;

import javax.sound.sampled.*;
import java.io.File;

/**
 * Standalone audio test utility to verify audio playback
 * Run this class directly to test if your audio files work
 */
public class AudioTestUtility {

    public static void main(String[] args) {
        System.out.println("=== Audio Test Utility ===");
        System.out.println("This will test if your audio files can be played.\n");

        String[] audioFiles = {"fajr.mp3", "dhuhr.mp3", "asr.mp3", "maghrib.mp3", "isha.mp3"};
        String audioDir = "audio/";

        System.out.println("Checking audio directory: " + new File(audioDir).getAbsolutePath());
        System.out.println();

        // Check if audio directory exists
        File dir = new File(audioDir);
        if (!dir.exists()) {
            System.err.println("❌ Audio directory does not exist!");
            System.err.println("   Please create: " + dir.getAbsolutePath());
            return;
        }

        // List all audio files in directory
        File[] files = dir.listFiles((d, name) ->
            name.toLowerCase().endsWith(".mp3") || name.toLowerCase().endsWith(".wav")
        );

        if (files == null || files.length == 0) {
            System.err.println("❌ No audio files found in the audio directory!");
            System.err.println("   Please add MP3 or WAV files to: " + dir.getAbsolutePath());
            return;
        }

        System.out.println("Found " + files.length + " audio file(s):");
        for (File f : files) {
            System.out.println("  ✓ " + f.getName() + " (" + (f.length() / 1024) + " KB)");
        }
        System.out.println();

        // Check for expected prayer files
        System.out.println("Checking for expected prayer audio files:");
        for (String fileName : audioFiles) {
            File file = new File(audioDir + fileName);
            if (file.exists()) {
                System.out.println("  ✓ " + fileName + " - Found");
            } else {
                System.out.println("  ⚠ " + fileName + " - Not found (you can configure a different file)");
            }
        }
        System.out.println();

        // Check Java Sound API support
        System.out.println("Checking audio system capabilities:");
        try {
            Mixer.Info[] mixers = AudioSystem.getMixerInfo();
            System.out.println("  Available audio mixers: " + mixers.length);
            for (Mixer.Info mixer : mixers) {
                System.out.println("    - " + mixer.getName());
            }
        } catch (Exception e) {
            System.err.println("  ❌ Error checking audio system: " + e.getMessage());
        }
        System.out.println();

        // Test WAV support
        System.out.println("Testing WAV file support:");
        File testWav = findFirstFile(files, ".wav");
        if (testWav != null) {
            testWavFile(testWav);
        } else {
            System.out.println("  ⚠ No WAV files found to test");
        }
        System.out.println();

        // Test MP3 support
        System.out.println("Testing MP3 file support:");
        File testMp3 = findFirstFile(files, ".mp3");
        if (testMp3 != null) {
            testMp3File(testMp3);
        } else {
            System.out.println("  ⚠ No MP3 files found to test");
        }
        System.out.println();

        System.out.println("=== Test Complete ===");
        System.out.println("\nRecommendations:");
        System.out.println("1. If no files were found, add MP3 files to the audio/ directory");
        System.out.println("2. Use the web interface (http://localhost:8080) to test audio playback");
        System.out.println("3. Check the application logs for detailed error messages");
    }

    private static File findFirstFile(File[] files, String extension) {
        for (File f : files) {
            if (f.getName().toLowerCase().endsWith(extension)) {
                return f;
            }
        }
        return null;
    }

    private static void testWavFile(File file) {
        try {
            AudioInputStream audioStream = AudioSystem.getAudioInputStream(file);
            AudioFormat format = audioStream.getFormat();

            System.out.println("  ✓ WAV file can be read: " + file.getName());
            System.out.println("    Format: " + format.getEncoding());
            System.out.println("    Sample Rate: " + format.getSampleRate() + " Hz");
            System.out.println("    Channels: " + format.getChannels());
            System.out.println("    Sample Size: " + format.getSampleSizeInBits() + " bits");

            audioStream.close();

            // Test if it can be played
            Clip clip = AudioSystem.getClip();
            System.out.println("  ✓ Audio clip can be created");
            clip.close();

        } catch (Exception e) {
            System.err.println("  ❌ Error testing WAV file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testMp3File(File file) {
        System.out.println("  ℹ MP3 file found: " + file.getName());
        System.out.println("    Size: " + (file.length() / 1024) + " KB");
        System.out.println("  Note: MP3 playback uses JLayer library (included in dependencies)");

        // Check if JLayer classes are available
        try {
            Class.forName("javazoom.jl.player.advanced.AdvancedPlayer");
            System.out.println("  ✓ JLayer MP3 library is available");
        } catch (ClassNotFoundException e) {
            System.err.println("  ❌ JLayer library not found! MP3 playback will not work.");
            System.err.println("     Make sure Maven dependencies are properly installed.");
        }
    }
}

