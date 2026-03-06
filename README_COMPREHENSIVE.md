# 🕌 Athan Application - Complete Documentation

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Java](https://img.shields.io/badge/Java-21+-red)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)

A beautiful, modern web application that plays Islamic Athan (call to prayer) at exact prayer times with customizable audio files, intelligent scheduling, and a stunning multi-theme interface that adapts to Islamic calendar events.

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [User Guide](#-user-guide)
- [API Reference](#-api-reference)
- [Architecture](#-architecture)
- [Themes & Customization](#-themes--customization)
- [Version History](#-version-history)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

![Athan.png](doc/Athan.png)

### 🕌 Core Prayer Features

#### Prayer Time Calculation
- **Accurate Calculations** using the Batoulapps Adhan library (trusted by millions)
- **Location-Based** calculation with exact coordinates
- **9 Calculation Methods** supported:
  - Muslim World League
  - Egyptian General Authority of Survey
  - University of Islamic Sciences, Karachi
  - Umm al-Qura University, Makkah (Saudi Arabia official)
  - Dubai
  - Moonsighting Committee
  - Islamic Society of North America (ISNA)
  - Kuwait
  - Qatar

![Prayer Times.png](doc/Prayer%20Times.png)
  - 
#### Live Prayer Times Display
- All 5 daily prayers: Fajr, Dhuhr, Asr, Maghrib, Isha
- Sunrise time for reference
- Real-time countdown to next prayer
- Beautiful gradient-based cards
- Prayer animations and highlighting

![Prayer Audio Settings.png](doc/Prayer%20Audio%20Settings.png)

### 🔊 Audio Notification System

#### Features
- **Automatic Athan Playback** at exact prayer times
- **Custom Audio Files** - Use your own Athan recordings
- **Individual Configuration** - Different audio for each prayer
- **Multi-Format Support** - MP3 and WAV files
- **Volume Control** - Adjustable 0-100%
- **Test Function** - Preview audio before saving
- **Enable/Disable Toggle** - Quick on/off switch
- **Sequence Playback** - Play 1-N files in sequence for each prayer
- **Audio Device Selection** - Choose output device (speaker, headphones, etc.)

#### Audio File Management
- Upload custom audio files through web interface
- Delete unwanted files
- Drag-to-reorder sequences
- Real-time file list updates
- File type validation (MP3/WAV only)

### 🌙 Special Islamic Events

![Special Settings.png](doc/Special%20Settings.png)

#### Ramadan Mode
- **Automatic Activation** - Detects Ramadan dates automatically
- **Special Audio Files** - Configure different Athan recordings for Ramadan
- **Visual Theme Change** - Beautiful Ramadan-themed UI
- **Separate Configuration** - Independent settings from regular prayers
- **Modern Styling** - Gold accents, night-friendly colors, geometric patterns

#### Takbeer Configuration
- **Eid al-Fitr** takbeer times and audio files
- **Eid al-Adha** takbeer times and audio files
- **Custom Schedules** - Set multiple takbeer times per day
- **Audio Sequences** - Play multiple takbeer files in order

#### Tasbee7 Times
- **Three Tasbee7 Times** calculated daily:
  - Tasbee7 1: 1/3 of time between Fajr and midnight
  - Tasbee7 2: 2/3 of time between Fajr and midnight
  - Tasbee7 3: 1/2 of time between Fajr and Tasbee7 2
- **Configurable Audio Files** - Different audio for each Tasbee7
- **Optional Feature** - Enable/disable as needed

### 🎨 Beautiful Interface

#### Multi-Theme System
- **Everyday Theme** - Clean, minimal, peaceful (default)
- **Ramadan Theme** - Warm golds, night-friendly colors, spiritual
- **Eid Theme** - Festive colors, celebration mood
- **Auto-Switching** - Themes change automatically based on Islamic calendar
- **Manual Override** - Choose your preferred theme anytime
- **Dark/Light Modes** - For each theme

#### Responsive Design
- Desktop, tablet, and mobile optimized
- Modern CSS Grid layouts
- Smooth animations and transitions
- Fast loading times
- Accessibility-friendly

#### Languages
- **English** - Full interface translation
- **العربية (Arabic)** - Complete Arabic translation
- **Français (French)** - French translation
- **Other Languages** - Extensible system for additional languages
- **RTL Support** - Proper right-to-left layout for Arabic

### ⚙️ Configuration Management

#### Settings Stored
- Location (city name, latitude, longitude)
- Timezone
- Prayer calculation method
- Audio files for each prayer
- Audio volume
- Output device selection
- Prayer time offsets (Fajr/Maghrib adjustments)
- Ramadan settings
- Islamic holidays configuration
- Tasbee7 preferences

#### Persistence
- Automatic saving to `config.json`
- Survives application restart
- Easy backup and restore
- Export/import capability
- Sensible defaults provided

### 🌍 Quick City Presets
One-click setup for:
- 🕋 Mecca, Saudi Arabia
- 🕌 Medina, Saudi Arabia
- Dubai, UAE
- Cairo, Egypt
- Istanbul, Turkey
- London, UK
- New York, USA

Plus manual entry for any location worldwide.

### ⏰ Smart Scheduling

- **Continuous Monitoring** - Checks every minute for prayer times
- **Auto-Refresh** - Recalculates daily for accuracy
- **Background Service** - Runs independently from browser
- **Persistent** - Continues even with browser closed
- **1-Minute Window** - Ensures Athan plays at exact time
- **Configurable Offsets** - Adjust Fajr and Maghrib times by ±120 minutes

### 🔌 Technical Features

#### Backend
- Spring Boot 3.2.0 framework
- RESTful API endpoints
- JSON configuration storage
- Comprehensive error handling
- Logging with SLF4J/Logback
- Multi-threaded audio processing

#### Frontend
- Server-side Thymeleaf templating
- Vanilla JavaScript (no heavy frameworks)
- Modern CSS Grid and Flexbox
- Fetch API for async communication
- Real-time UI updates
- In-app notifications system

#### Audio System
- JLayer library for MP3 playback
- Java Sound API for WAV files
- Non-blocking background playback
- Software volume control
- Graceful error handling
- Device selection support

---

## 🚀 Quick Start

### Prerequisites
- Java 21 or higher
- Maven 3.8+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Start Application

```bash
cd /Users/ALMOAYA/IdeaProjects/Test
mvn spring-boot:run
```

Wait for: `Started AthanApplication in X.XXX seconds`

### Open in Browser

```
http://localhost:8080
```

### First Configuration (30 seconds)

1. **Set Location**
   - Click "🕋 Mecca" under "Quick Select City" (or enter your location)
   - Select your timezone from dropdown
   - Choose calculation method (default: Umm al-Qura)

2. **Add Audio Files**
   - Click "Upload Audio Files" button
   - Select MP3/WAV files from your computer
   - View them in "Available Files" section

3. **Configure Prayer Audio**
   - Expand each prayer card (Fajr, Dhuhr, Asr, Maghrib, Isha)
   - Click "➕ Add File" button
   - Select audio files from dropdown
   - Click "▶️ Test" to preview
   - Reorder files by dragging

4. **Save Configuration**
   - Click "💾 Save Configuration" at bottom
   - Wait for green success message

5. **Verify**
   - Check the countdown shows time to next prayer
   - Prayer times display correctly
   - Audio test plays

---

## 📦 Installation

### Step 1: Prerequisites

#### Install Java 21
- **macOS**: `brew install java@21` or download from oracle.com
- **Windows**: Download from oracle.com and run installer
- **Linux**: `sudo apt-get install openjdk-21-jdk`

Verify:
```bash
java -version
```

#### Install Maven
- **macOS**: `brew install maven`
- **Windows**: Download from maven.apache.org and add to PATH
- **Linux**: `sudo apt-get install maven`

Verify:
```bash
mvn -version
```

### Step 2: Build Application

```bash
cd /Users/ALMOAYA/IdeaProjects/Test
mvn clean package -DskipTests
```

Output:
```
[INFO] BUILD SUCCESS
[INFO] Total time: X.XXX s
```

### Step 3: Add Audio Files

Create `audio/` directory in project root and add your MP3/WAV files:

```bash
mkdir -p audio/
cp /path/to/your/athan.mp3 audio/
cp /path/to/your/takbeer.wav audio/
```

### Step 4: Run Application

**Option A - Development (recommended for changes)**
```bash
mvn spring-boot:run
```

**Option B - JAR file**
```bash
java -jar target/athan-app-1.0.0.jar
```

### Step 5: Access Application

Open browser and navigate to:
```
http://localhost:8080
```

---

## ⚙️ Configuration

### Web Interface Configuration

All settings can be configured through the web interface:

#### Location Settings
- **City Name** - For reference (e.g., "London")
- **Latitude/Longitude** - GPS coordinates (4 decimal places)
- **Timezone** - From dropdown list
- **Calculation Method** - Prayer time calculation algorithm
- **Prayer Offsets** - Adjust Fajr/Maghrib times by ±120 minutes

#### Audio Settings
- **Enable Athan** - Toggle notifications on/off
- **Volume** - 0-100% slider
- **Audio Output Device** - Select speaker/headphones

#### Prayer Audio Configuration
For each prayer, configure:
1. Audio files (click "➕ Add File")
2. File sequence (drag to reorder)
3. Test playback (click "▶️ Test")

#### Ramadan Mode
- Toggle "🌙 Ramadan Mode" ON
- Configure separate audio files for Ramadan prayers
- Automatically activates during Ramadan

#### Islamic Holidays
- Toggle "Enable Islamic Holidays"
- Configure Eid al-Fitr takbeer:
  - Add takbeer times (e.g., 06:00, 07:00)
  - Add audio files for each time
  - Test playback
- Configure Eid al-Adha takbeer (same process)

### File Configuration

#### config.json Structure
```json
{
  "city": "London",
  "latitude": 51.5074,
  "longitude": -0.1278,
  "timezone": "Europe/London",
  "calculationMethod": "UMMAL_QURA",
  "fajrOffsetMinutes": 0,
  "maghribOffsetMinutes": 0,
  "audioConfig": {
    "enabled": true,
    "volume": 80,
    "outputDevice": "default",
    "ramadanMode": false,
    "islamicHolidaysEnabled": false,
    "prayerAudioFiles": {
      "FAJR": ["fajr.mp3"],
      "DHUHR": ["dhuhr.mp3"],
      "ASR": ["asr.mp3"],
      "MAGHRIB": ["maghrib.mp3"],
      "ISHA": ["isha.mp3"],
      "TASBEE7_1": ["tasbee7_1.mp3"],
      "TASBEE7_2": ["tasbee7_2.mp3"],
      "TASBEE7_3": ["tasbee7_3.mp3"]
    }
  }
}
```

#### audio/ Directory
Place your audio files here:
```
audio/
├── fajr.mp3              # Fajr Athan
├── dhuhr.mp3             # Dhuhr Athan
├── asr.mp3               # Asr Athan
├── maghrib.mp3           # Maghrib Athan
├── isha.mp3              # Isha Athan
├── takbeer_eid.mp3       # Eid Takbeer
├── tasbee7_1.mp3         # First Tasbee7
└── custom_athan.mp3      # Custom recording
```

---

## 👤 User Guide

### Daily Usage

#### Morning (Fajr)
1. Application automatically plays Athan at Fajr time
2. Volume set to 80% (adjustable)
3. Prayer time displayed in countdown
4. Audio plays from selected speaker/device

#### Throughout the Day
- Application silently monitors prayer times
- Live countdown updates every second
- Shows "Next Prayer: [Prayer Name]" with time
- Automatic playback at each prayer time

#### Settings Management
1. Change location: Scroll to "Location Settings" → enter new coordinates
2. Adjust volume: "Audio Settings" → Volume slider
3. Change audio: Expand prayer card → select different file
4. Enable Ramadan Mode: Scroll down → Toggle "Ramadan Mode"

### Audio File Management

#### Upload New Audio
1. Scroll to "Available Files" section
2. Click upload button
3. Select MP3 or WAV file
4. File appears in list

#### Configure for Prayer
1. Expand prayer card (e.g., Fajr)
2. Click "➕ Add File"
3. Select file from dropdown
4. Click "▶️ Test" to hear it
5. Repeat to add multiple files (plays in sequence)

#### Delete Audio File
1. Find file in "Available Files"
2. Click 🗑️ icon
3. Confirm deletion
4. File removed from system

#### Reorder Audio Sequence
1. Expand prayer card
2. Drag files to new position
3. Numbering updates automatically
4. Files play in numeric order

### Prayer Time Adjustment

For accurate times in your location, adjust offsets:

1. **Fajr Offset** (±120 minutes)
   - Most common adjustment
   - Enter +/- minutes (e.g., -5 for 5 min earlier)

2. **Maghrib Offset** (±120 minutes)
   - For sunset-based calculations
   - Similar process to Fajr

3. **Test**
   - Verify times look correct
   - Compare with local Islamic center
   - Adjust if needed

### Multiple Devices

To run on multiple devices:

1. Build on primary machine:
   ```bash
   mvn clean package
   ```

2. Share `target/athan-app-1.0.0.jar`

3. Copy to each device with Java 21 installed

4. Run on each device:
   ```bash
   java -jar athan-app-1.0.0.jar
   ```

5. Access via `http://[device-ip]:8080`

---

## 🔌 API Reference

### Prayer Times Endpoint
**GET** `/api/prayer-times`

Response:
```json
{
  "FAJR": "05:12",
  "SUNRISE": "06:56",
  "DHUHR": "12:36",
  "ASR": "15:39",
  "MAGHRIB": "18:55",
  "ISHA": "19:54",
  "TASBEE7_1": "01:44",
  "TASBEE7_2": "03:28",
  "TASBEE7_3": "04:20"
}
```

### Configuration Endpoint
**POST** `/api/config`

Request:
```json
{
  "city": "London",
  "latitude": 51.5074,
  "longitude": -0.1278,
  "timezone": "Europe/London",
  "calculationMethod": "UMMAL_QURA",
  "fajrOffsetMinutes": 0,
  "maghribOffsetMinutes": 0,
  "audioConfig": { ... }
}
```

Response:
```json
{
  "success": true,
  "message": "Configuration saved successfully"
}
```

### Audio Files Endpoint
**GET** `/api/audio-files`

Response:
```json
[
  "fajr.mp3",
  "dhuhr.mp3",
  "asr.mp3",
  "maghrib.mp3",
  "isha.mp3"
]
```

### Test Audio Endpoint
**POST** `/api/test-audio`

Request:
```json
{
  "files": ["fajr.mp3"]
}
```

### Upload Audio Endpoint
**POST** `/api/upload-audio`

- Multipart form data
- File field: `file`
- Supported formats: MP3, WAV
- Max size: 50MB

### Delete Audio Endpoint
**DELETE** `/api/delete-audio/{filename}`

---

## 🏗️ Architecture

### Project Structure
```
athan-app/
├── src/
│   ├── main/
│   │   ├── java/com/athan/
│   │   │   ├── AthanApplication.java       # Main entry point
│   │   │   ├── controller/
│   │   │   │   ├── AthanController.java    # Web endpoints
│   │   │   │   └── FileController.java     # Audio file management
│   │   │   ├── service/
│   │   │   │   ├── PrayerTimeService.java  # Prayer calculations
│   │   │   │   ├── AudioPlayerService.java # Audio playback
│   │   │   │   ├── ConfigService.java      # Configuration mgmt
│   │   │   │   └── SchedulerService.java   # Background scheduling
│   │   │   ├── model/
│   │   │   │   ├── PrayerConfig.java       # Configuration data
│   │   │   │   ├── AudioConfig.java        # Audio settings
│   │   │   │   └── Prayer.java             # Prayer enum
│   │   │   └── util/
│   │   │       └── DateUtil.java           # Date utilities
│   │   └── resources/
│   │       ├── application.properties      # Spring config
│   │       ├── templates/
│   │       │   └── index.html              # Web interface
│   │       └── static/
│   │           ├── css/                    # Stylesheets
│   │           ├── js/
│   │           │   ├── app.js              # Main logic
│   │           │   └── theme-manager.js    # Theme handling
│   │           ├── lang/                   # Translations
│   │           │   ├── en.json
│   │           │   ├── ar.json
│   │           │   └── fr.json
│   │           └── fonts/                  # Custom fonts
│   └── test/
│       └── java/                           # Unit tests
├── audio/                                  # Audio files directory
├── config.json                             # Runtime configuration
├── pom.xml                                 # Maven build file
└── README.md                               # This file
```

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Java | 21+ |
| Framework | Spring Boot | 3.2.0 |
| Templates | Thymeleaf | 3.1.x |
| Prayer Calc | Adhan | 1.2.0 |
| Audio | JLayer + Java Sound | 1.0.1.4 |
| Frontend | Vanilla JS + CSS3 | Latest |
| Build | Maven | 3.8+ |
| UI Components | HTML5 + CSS Grid | Modern |

### Data Flow

```
User Request
    ↓
Spring Controller
    ↓
Service Layer (Prayer Time / Audio / Config)
    ↓
Thymeleaf Template / JSON API
    ↓
Browser / Frontend
    ↓
JavaScript (UI Update)
    ↓
Audio Playback (JLayer/Java Sound)
```

---

## 🎨 Themes & Customization

### Everyday Theme (Default)
- **Primary Color**: Deep Blue (#2C5F8D)
- **Secondary**: Warm Gold (#D4AF37)
- **Background**: Almost White (#FAFBFC)
- **Mood**: Calm, peaceful, trustworthy
- **Use**: Regular days

### Ramadan Theme (Automatic)
- **Primary Color**: Night Sky Indigo (#2F3A78)
- **Accents**: Lantern Gold (#C9A66B)
- **Background**: Ivory White (#F7F5EF)
- **Mood**: Spiritual, warm, nighttime-friendly
- **Use**: Automatically during Ramadan
- **Visual**: Subtle star patterns, geometric designs

### Eid Theme (Automatic)
- **Primary Color**: Festive Emerald (#27AE60)
- **Accents**: Celebration Gold (#FFD700)
- **Background**: Bright White (#FFFFFF)
- **Mood**: Celebratory, joyful, colorful
- **Use**: Automatically during Eids

### Dark Mode Toggle
Available for all themes:
- Automatically applied based on system preference
- Manual toggle in settings
- Preserves theme colors with dark adjustments

### Font System
- **Display**: Al Jazeera Arabic (Arabic/RTL)
- **Body**: Inter (English/LTR)
- **Fallbacks**: System fonts for compatibility

### Customization Options

#### Change Theme Manually
1. Scroll to bottom
2. Find "⚙️ Theme Settings"
3. Choose "Everyday", "Ramadan", or "Eid"
4. Or enable "Auto" for automatic switching

#### Add Custom Audio
1. Place MP3/WAV in `audio/` directory
2. Upload through web interface
3. Select for any prayer

#### Modify Colors (Advanced)
Edit CSS variables in `static/css/themes.css`:
```css
:root {
  --primary: #2C5F8D;
  --secondary: #D4AF37;
  --background: #FAFBFC;
}
```

#### Add Language (Advanced)
1. Create `static/lang/[code].json` (e.g., `de.json`)
2. Translate all keys from `en.json`
3. Reload page - new language appears in selector

---

## 📊 Version History

### Version 1.0.0 (Current) - March 6, 2026

#### ✨ New Features
- **Prayer Time Calculation**: Uses Adhan library with 9 calculation methods
- **Beautiful Web Interface**: Modern gradient-based UI with responsive design
- **Audio Notifications**: Custom Athan files with volume control
- **Location Management**: Quick city presets + manual coordinates entry
- **Smart Scheduling**: Continuous monitoring with 1-minute accuracy
- **Configuration Management**: Persistent settings in JSON
- **Multi-Language Support**: English, Arabic, French
- **Dark Mode**: Light and dark theme variants
- **Audio Device Selection**: Choose output device (speaker, headphones, etc.)
- **Drag-to-Reorder**: Rearrange audio file sequences
- **Audio Upload**: Upload custom MP3/WAV files
- **Test Function**: Preview audio before saving

#### 🎨 Themes & UI
- **Everyday Theme**: Clean, minimal, peaceful (default)
- **Ramadan Theme**: Warm, spiritual, night-friendly
- **Eid Theme**: Festive, celebratory (Eids only)
- **Automatic Theme Switching**: Based on Islamic calendar
- **Responsive Design**: Desktop, tablet, mobile support

#### 🔧 Special Features
- **Ramadan Mode**: Separate audio configuration for Ramadan
- **Takbeer Times**: Configure Eid al-Fitr and Eid al-Adha takbeer
- **Tasbee7 Times**: Three daily Tasbee7 times with audio
- **Prayer Offset Adjustment**: Adjust Fajr/Maghrib by ±120 minutes
- **Live Countdown**: Real-time display to next prayer
- **Live Prayer Times**: All 5 daily prayers + sunrise

#### 🐛 Fixes & Improvements
- Fixed Thymeleaf `||` operator stripping issue
- Extracted JavaScript to external `app.js` file
- Implemented proper error handling
- Added comprehensive logging
- Optimized performance
- Improved mobile responsiveness

#### 📦 Technical
- Spring Boot 3.2.0
- Java 21+
- Maven build system
- RESTful API
- JSON configuration
- Vanilla JavaScript frontend

#### 📚 Documentation
- Comprehensive README
- Quick Start Guide
- Getting Started Guide
- API Reference
- Design System Documentation
- Feature Documentation

### Future Roadmap

#### Version 1.1.0 (Planned)
- [ ] Audio device volume control (not just software)
- [ ] Multiple device sync via cloud
- [ ] Islamic calendar app integration
- [ ] Prayer statistics and history
- [ ] Calendar view of prayer times

#### Version 1.2.0 (Planned)
- [ ] Voice commands / voice control
- [ ] Mobile native app (iOS/Android)
- [ ] Smart watch integration
- [ ] Notification badges
- [ ] Calendar export (iCal format)

#### Version 2.0.0 (Long-term)
- [ ] Machine learning for optimal volume
- [ ] Multi-user support
- [ ] Community audio library
- [ ] Advanced scheduling with custom rules
- [ ] Integration with prayer apps ecosystem

---

## ❓ Troubleshooting

### Application Won't Start

**Error**: "Port 8080 already in use"
```bash
# Find and kill process on port 8080
lsof -ti :8080 | xargs kill -9
# Then restart: mvn spring-boot:run
```

**Error**: "No main manifest attribute, in JAR"
```bash
# Ensure pom.xml has spring-boot-maven-plugin with repackage goal
# Then rebuild: mvn clean package
```

### Audio Not Playing

**Issue**: Audio file not playing during test

**Solutions**:
1. Check file format (must be MP3 or WAV)
2. Verify file is in `audio/` directory
3. Check volume is not muted (0%)
4. Test with built-in speaker first
5. Try different audio device in settings

**Issue**: Audio plays but can't hear it

**Solutions**:
1. Check system volume (not just app volume)
2. Verify audio device selection in settings
3. Try "System Default" audio device
4. Check if headphones are plugged in
5. Test system audio separately

### Prayer Times Incorrect

**Issue**: Times don't match local Islamic center

**Solutions**:
1. Verify location coordinates (latitude/longitude)
2. Check timezone is correct
3. Try different calculation method
4. Adjust Fajr offset (±5 minutes common)
5. Compare with multiple Islamic centers

### Configuration Not Saving

**Issue**: Changes don't persist after restart

**Solutions**:
1. Verify "💾 Save Configuration" button shows success
2. Check `config.json` file permissions
3. Ensure `config.json` exists in project root
4. Look for error messages in browser console
5. Check application logs

### Web Interface Not Loading

**Issue**: http://localhost:8080 shows error

**Solutions**:
1. Verify app is running: `ps aux | grep java`
2. Check port 8080 is not blocked by firewall
3. Try `http://127.0.0.1:8080`
4. Check browser console for errors (F12)
5. Restart application

### Language Not Appearing

**Issue**: Expected language not showing in selector

**Solutions**:
1. Check language file exists: `static/lang/[code].json`
2. Verify JSON syntax is valid
3. Clear browser cache (Ctrl+Shift+Delete)
4. Reload page (F5)
5. Check browser console for errors

### Countdown Not Working

**Issue**: Live countdown shows 00:00:00

**Solutions**:
1. Refresh page (F5)
2. Check prayer times are calculated
3. Open browser console (F12) for errors
4. Verify JavaScript is enabled
5. Clear browser cache and reload

### Audio File Upload Fails

**Issue**: Upload button doesn't work

**Solutions**:
1. Check file size (max 50MB)
2. Verify file format (MP3 or WAV only)
3. Check `audio/` directory has write permissions
4. Try different browser
5. Check browser console for error details

---

## 📞 Support & Contact

For issues, questions, or suggestions:

1. **Check Troubleshooting Section** - Most common issues covered above
2. **Review Logs** - Check application logs for error details
3. **Browser Console** - Press F12 to see JavaScript errors
4. **File Permissions** - Ensure `audio/` directory is writable
5. **System Requirements** - Verify Java 21+ is installed

---

## 📄 License

MIT License - Free to use, modify, and distribute

---

## 🙏 Acknowledgments

- **Adhan Library** - Prayer time calculations
- **Spring Boot** - Web framework
- **JLayer & Java Sound** - Audio playback
- **Islamic Centers Worldwide** - Prayer time verification
- **Community Contributors** - Feedback and suggestions

---

## 📝 Additional Resources

### Official Documentation
- [Adhan Library Documentation](https://github.com/batoulapps/Adhan)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Thymeleaf Documentation](https://www.thymeleaf.org/)

### Islamic Prayer Times
- [Islamic Society of North America (ISNA)](https://www.isna.net)
- [Muslim World League](https://themwl.org)
- [Umm al-Qura University](https://www.uqu.edu.sa)

### Web Standards
- [MDN Web Docs](https://developer.mozilla.org)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Last Updated**: March 6, 2026  
**Maintained By**: Athan Development Team  
**Status**: Active Development


