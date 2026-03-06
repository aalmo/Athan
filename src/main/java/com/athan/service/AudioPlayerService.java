package com.athan.service;

import javazoom.jl.decoder.JavaLayerException;
import javazoom.jl.player.advanced.AdvancedPlayer;
import javazoom.jl.player.advanced.PlaybackEvent;
import javazoom.jl.player.advanced.PlaybackListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sound.sampled.*;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class AudioPlayerService {
    private static final Logger logger = LoggerFactory.getLogger(AudioPlayerService.class);
    private static final String AUDIO_DIR = "audio/";

    @Autowired
    private ConfigService configService;

    // Track currently playing audio to prevent multiple simultaneous playback
    private volatile AdvancedPlayer currentMp3Player;
    private volatile Clip currentWavClip;
    private volatile boolean isPlaying = false;
    private final Object playbackLock = new Object();

    /**
     * Stop any currently playing audio
     */
    public void stopCurrentPlayback() {
        synchronized (playbackLock) {
            try {
                // Stop MP3 player if playing
                if (currentMp3Player != null) {
                    logger.info("Stopping currently playing MP3");
                    currentMp3Player.close();
                    currentMp3Player = null;
                }

                // Stop WAV clip if playing
                if (currentWavClip != null && currentWavClip.isOpen()) {
                    logger.info("Stopping currently playing WAV");
                    currentWavClip.stop();
                    currentWavClip.close();
                    currentWavClip = null;
                }

                isPlaying = false;
            } catch (Exception e) {
                logger.warn("Error stopping current playback", e);
            }
        }
    }

    /**
     * Get all available audio output devices
     */
    public List<Map<String, String>> getAvailableAudioDevices() {
        List<Map<String, String>> devices = new ArrayList<>();

        try {
            Mixer.Info[] mixerInfos = AudioSystem.getMixerInfo();

            for (int i = 0; i < mixerInfos.length; i++) {
                Mixer.Info mixerInfo = mixerInfos[i];
                Mixer mixer = AudioSystem.getMixer(mixerInfo);

                // Check if this mixer supports audio output (SourceDataLine)
                Line.Info[] sourceLineInfo = mixer.getSourceLineInfo();
                boolean supportsOutput = false;

                for (Line.Info lineInfo : sourceLineInfo) {
                    if (lineInfo.getLineClass().equals(SourceDataLine.class)) {
                        supportsOutput = true;
                        break;
                    }
                }

                if (supportsOutput) {
                    Map<String, String> device = new HashMap<>();
                    device.put("id", String.valueOf(i));
                    device.put("name", mixerInfo.getName());
                    device.put("description", mixerInfo.getDescription());
                    device.put("vendor", mixerInfo.getVendor());
                    devices.add(device);

                    logger.debug("Found audio output device: {} - {}", mixerInfo.getName(), mixerInfo.getDescription());
                }
            }

            logger.info("Found {} audio output device(s)", devices.size());

        } catch (Exception e) {
            logger.error("Error getting audio devices", e);
        }

        return devices;
    }

    /**
     * Get the mixer for a specific device ID
     */
    private Mixer getMixerById(String deviceId) {
        if (deviceId == null || deviceId.isEmpty() || deviceId.equals("default")) {
            return null; // Use default mixer
        }

        try {
            int id = Integer.parseInt(deviceId);
            Mixer.Info[] mixerInfos = AudioSystem.getMixerInfo();

            if (id >= 0 && id < mixerInfos.length) {
                Mixer mixer = AudioSystem.getMixer(mixerInfos[id]);
                logger.info("Using audio device: {}", mixerInfos[id].getName());
                return mixer;
            }
        } catch (Exception e) {
            logger.warn("Could not get mixer for device ID: {}, using default", deviceId);
        }

        return null; // Fall back to default
    }

    /**
     * Play multiple audio files in sequence
     */
    public void playAudioSequence(List<String> filenames, int volume) {
        // Stop any currently playing audio first
        stopCurrentPlayback();

        new Thread(() -> {
            synchronized (playbackLock) {
                try {
                    isPlaying = true;
                    logger.info("Starting playback of {} file(s) in sequence", filenames.size());

                    for (int i = 0; i < filenames.size(); i++) {
                        // Check if playback was stopped
                        if (!isPlaying) {
                            logger.info("Playback sequence interrupted");
                            break;
                        }

                        String filename = filenames.get(i);
                        File audioFile = new File(AUDIO_DIR + filename);

                        if (!audioFile.exists()) {
                            logger.warn("Audio file not found: {} (looking in: {}), skipping", filename, audioFile.getAbsolutePath());
                            continue;
                        }

                        logger.info("Playing file {}/{}: {}", (i + 1), filenames.size(), filename);

                        boolean success;
                        if (filename.toLowerCase().endsWith(".mp3")) {
                            success = playMp3(audioFile, volume);
                        } else if (filename.toLowerCase().endsWith(".wav")) {
                            success = playWav(audioFile, volume);
                        } else {
                            logger.warn("Unsupported audio format: {}, skipping", filename);
                            continue;
                        }

                        if (!success) {
                            logger.warn("Playback of {} was interrupted or failed", filename);
                            // Continue to next file if current one fails
                        }

                        // Small pause between files (500ms)
                        if (i < filenames.size() - 1 && isPlaying) {
                            Thread.sleep(500);
                        }
                    }

                    logger.info("Completed playback sequence of {} file(s)", filenames.size());

                } catch (Exception e) {
                    logger.error("Error playing audio sequence", e);
                } finally {
                    isPlaying = false;
                }
            }
        }, "AudioSequencePlayer").start();
    }

    public void playAudio(String filename, int volume) {
        // Play single file (backward compatibility)
        playAudioSequence(Arrays.asList(filename), volume);
    }

    private boolean playMp3(File file, int volume) {
        FileInputStream fis = null;
        BufferedInputStream bis = null;

        try {
            fis = new FileInputStream(file);
            bis = new BufferedInputStream(fis);
            currentMp3Player = new AdvancedPlayer(bis);

            // Create a latch to wait for playback completion
            CountDownLatch playbackComplete = new CountDownLatch(1);

            // Add playback listener
            currentMp3Player.setPlayBackListener(new PlaybackListener() {
                @Override
                public void playbackFinished(PlaybackEvent evt) {
                    playbackComplete.countDown();
                }
            });

            // Start playback in the current thread
            currentMp3Player.play();

            // Wait for playback to complete (with timeout of 10 minutes)
            boolean completed = playbackComplete.await(10, TimeUnit.MINUTES);

            return completed;

        } catch (JavaLayerException e) {
            logger.error("Error playing MP3 file (JavaLayer): {}", e.getMessage(), e);
            return false;
        } catch (Exception e) {
            logger.error("Error playing MP3 file: {}", e.getMessage(), e);
            return false;
        } finally {
            // Clean up resources
            try {
                if (currentMp3Player != null) {
                    currentMp3Player.close();
                    currentMp3Player = null;
                }
                if (bis != null) {
                    bis.close();
                }
                if (fis != null) {
                    fis.close();
                }
            } catch (Exception e) {
                logger.error("Error closing audio resources", e);
            }
        }
    }

    private boolean playWav(File file, int volume) {
        AudioInputStream audioStream = null;

        try {
            audioStream = AudioSystem.getAudioInputStream(file);

            // Get selected audio device from config
            String deviceId = configService.getConfig().getAudioConfig().getOutputDevice();
            Mixer mixer = getMixerById(deviceId);

            // Get clip from selected mixer or default
            if (mixer != null) {
                DataLine.Info info = new DataLine.Info(Clip.class, audioStream.getFormat());
                currentWavClip = (Clip) mixer.getLine(info);
                logger.debug("Playing WAV on device: {}", mixer.getMixerInfo().getName());
            } else {
                currentWavClip = AudioSystem.getClip();
                logger.debug("Playing WAV on default device");
            }

            currentWavClip.open(audioStream);

            // Set volume if control is available
            try {
                if (currentWavClip.isControlSupported(FloatControl.Type.MASTER_GAIN)) {
                    FloatControl gainControl = (FloatControl) currentWavClip.getControl(FloatControl.Type.MASTER_GAIN);
                    float range = gainControl.getMaximum() - gainControl.getMinimum();
                    float gain = (range * volume / 100.0f) + gainControl.getMinimum();
                    // Clamp to valid range
                    gain = Math.max(gainControl.getMinimum(), Math.min(gainControl.getMaximum(), gain));
                    gainControl.setValue(gain);
                    logger.debug("Set WAV volume to: {} (gain: {})", volume, gain);
                } else {
                    logger.warn("Volume control not supported for this WAV file");
                }
            } catch (Exception e) {
                logger.warn("Could not set volume for WAV file: {}", e.getMessage());
            }

            // Create latch to wait for completion
            CountDownLatch playbackComplete = new CountDownLatch(1);

            // Add line listener
            currentWavClip.addLineListener(event -> {
                if (event.getType() == LineEvent.Type.STOP) {
                    playbackComplete.countDown();
                }
            });

            // Start playback
            currentWavClip.start();

            // Wait for playback to complete (with timeout)
            boolean completed = playbackComplete.await(10, TimeUnit.MINUTES);

            return completed;

        } catch (UnsupportedAudioFileException e) {
            logger.error("Unsupported WAV file format: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("Error playing WAV file: {}", e.getMessage(), e);
            return false;
        } finally {
            // Clean up resources
            try {
                if (currentWavClip != null && currentWavClip.isOpen()) {
                    currentWavClip.close();
                    currentWavClip = null;
                }
                if (audioStream != null) {
                    audioStream.close();
                }
            } catch (Exception e) {
                logger.error("Error closing audio resources", e);
            }
        }
    }
}

