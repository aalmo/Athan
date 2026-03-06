# 🕌 Athan Application - Islamic Prayer Time Notifier

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Java](https://img.shields.io/badge/Java-21+-red)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)

A beautiful, modern web-based application that calculates Islamic prayer times based on your location and plays audio notifications (Athan) at prayer times, with support for Ramadan Mode, Islamic Holidays, and multiple themes.

**📖 [Read Comprehensive Documentation](README_COMPREHENSIVE.md)** - Complete guide with all features, configuration, and troubleshooting.

## ⚡ Quick Features

- 🕌 **Accurate Prayer Time Calculations**: Uses the Adhan library with 9 calculation methods
- 🔊 **Audio Notifications**: Play custom Athan recordings at each prayer
- 🌍 **Location-based**: Configure city, coordinates, timezone
- 🎨 **Multi-Theme System**: Everyday, Ramadan, and Eid themes (auto-switching)
- 🌙 **Ramadan Mode**: Separate audio configuration during Ramadan
- 🎊 **Takbeer Times**: Configure Eid al-Fitr and Eid al-Adha
- ⏱️ **Live Countdown**: Real-time counter to next prayer
- 📱 **Responsive Design**: Desktop, tablet, mobile
- 🌐 **Multi-Language**: English, Arabic, French
- 🎤 **Audio Management**: Upload, delete, reorder custom audio files
- ⚙️ **Prayer Offsets**: Adjust Fajr/Maghrib times ±120 minutes
- 💾 **Persistent Config**: Saves automatically to config.json

## 🚀 Quick Start

```bash
# 1. Prerequisites: Java 21, Maven

# 2. Build
cd /Users/ALMOAYA/IdeaProjects/Test
mvn clean package -DskipTests

# 3. Add audio files
mkdir -p audio/
cp /path/to/athan.mp3 audio/

# 4. Run
mvn spring-boot:run

# 5. Open browser
# http://localhost:8080
```

**First-time setup (5 minutes)**:
- Maven 3.6 or higher

## Installation

1. Clone or download this project
2. Navigate to the project directory
3. Create an `audio` folder in the project root
4. Add your Athan audio files (.mp3 or .wav) to the `audio` folder with names like:
   - `fajr.mp3` - For Fajr prayer
   - `dhuhr.mp3` - For Dhuhr prayer
   - `asr.mp3` - For Asr prayer
   - `maghrib.mp3` - For Maghrib prayer
   - `isha.mp3` - For Isha prayer

## Running the Application

### Using Maven:

```bash
mvn clean install
mvn spring-boot:run
```

### Using Java:

```bash
mvn clean package
java -jar target/athan-app-1.0.0.jar
```

## Accessing the Application

Once the application is running, open your web browser and navigate to:

```
http://localhost:8080
```

## Configuration

### Location Settings
- **City**: Enter your city name
- **Latitude/Longitude**: Set your exact coordinates
- **Timezone**: Select your timezone from the dropdown
- **Calculation Method**: Choose the appropriate calculation method for your region

### Quick City Presets
Click on any of the preset city buttons to quickly configure:
- Mecca
- Dubai
- Cairo
- Istanbul
- London
- New York

### Audio Settings
- **Enable Athan**: Toggle to enable/disable audio notifications
- **Volume**: Adjust the playback volume (0-100%)
- **Prayer Audio Files**: Select different audio files for each prayer
- **Test Button**: Test the audio for each prayer

## How It Works

1. The application calculates prayer times based on your configured location
2. Every minute, it checks if it's time for any prayer
3. When a prayer time arrives, it automatically plays the configured audio file
4. Prayer times are recalculated automatically each day
5. All settings are saved to `config.json` and persist between restarts

## Audio File Requirements

- Supported formats: MP3, WAV
- Place audio files in the `audio/` folder
- Default names: `fajr.mp3`, `dhuhr.mp3`, `asr.mp3`, `maghrib.mp3`, `isha.mp3`
- You can use any filename and configure it in the web interface

## Finding Your Coordinates

If you don't know your coordinates:
1. Visit https://www.latlong.net/
2. Search for your city
3. Copy the latitude and longitude values

## Calculation Methods

- **MUSLIM_WORLD_LEAGUE**: Used in Europe, Far East, parts of America
- **EGYPTIAN**: Egyptian General Authority of Survey
- **KARACHI**: University of Islamic Sciences, Karachi
- **UMM_AL_QURA**: Umm al-Qura University, Makkah
- **DUBAI**: Used in Dubai
- **MOON_SIGHTING_COMMITTEE**: Moonsighting Committee
- **NORTH_AMERICA**: Islamic Society of North America
- **KUWAIT**: Used in Kuwait
- **QATAR**: Used in Qatar

## Troubleshooting

### Audio not playing?
- Ensure audio files exist in the `audio/` folder
- Check that the file format is MP3 or WAV
- Verify the volume is not set to 0
- Make sure "Enable Athan" is turned on

### Prayer times incorrect?
- Verify your latitude and longitude are correct
- Check that the timezone is properly set
- Try a different calculation method for your region

### Can't access the web interface?
- Make sure the application is running
- Check that port 8080 is not being used by another application
- Try accessing http://127.0.0.1:8080 instead

## Technology Stack

- **Java 21**: Modern Java features
- **Spring Boot**: Web framework and dependency injection
- **Adhan Library**: Prayer time calculations
- **Thymeleaf**: HTML templating
- **JLayer**: MP3 audio playback
- **Quartz**: Scheduling framework

## License

This project is open source and available for personal and commercial use.

## Credits

- Prayer time calculations powered by [Adhan](https://github.com/batoulapps/adhan-java)
- UI design inspired by modern material design principles

---

**Made with ❤️ for the Muslim community**

