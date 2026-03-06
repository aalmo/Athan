#!/bin/bash

# Audio Setup Helper Script

echo "🎵 Audio File Setup Helper"
echo "=========================="
echo ""

AUDIO_DIR="/Users/ALMOAYA/IdeaProjects/Test/audio"

# Check current audio files
echo "Current audio files:"
cd "$AUDIO_DIR"
ls -lh *.mp3 *.wav 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""

# Count existing files
MP3_COUNT=$(ls -1 *.mp3 2>/dev/null | wc -l | tr -d ' ')
WAV_COUNT=$(ls -1 *.wav 2>/dev/null | wc -l | tr -d ' ')

echo "Found: $MP3_COUNT MP3 file(s), $WAV_COUNT WAV file(s)"
echo ""

# Check which prayer files are missing
PRAYERS=("fajr" "dhuhr" "asr" "maghrib" "isha")
MISSING=()

for prayer in "${PRAYERS[@]}"; do
    if [ ! -f "${prayer}.mp3" ] && [ ! -f "${prayer}.wav" ]; then
        MISSING+=("$prayer")
    fi
done

if [ ${#MISSING[@]} -eq 0 ]; then
    echo "✅ All required prayer audio files are present!"
    echo ""
    echo "You can now run the application and test audio playback."
    exit 0
fi

echo "⚠️  Missing audio files for: ${MISSING[*]}"
echo ""
echo "Options to fix this:"
echo ""
echo "1. QUICK FIX - Copy existing fajr.mp3 to all prayers (temporary)"
echo "   This allows testing immediately, but all prayers will sound the same."
echo ""
echo "2. DOWNLOAD - Get proper Athan audio files for each prayer"
echo "   Download from IslamicFinder, YouTube, or other sources."
echo ""
echo "3. CONFIGURE - Use the web interface to set different filenames"
echo "   If you have files with different names, configure them at http://localhost:8080"
echo ""

read -p "Choose option (1=Quick Fix, 2=Show Download Info, 3=Skip): " choice

case $choice in
    1)
        echo ""
        echo "Copying fajr.mp3 to missing prayer files..."
        if [ -f "fajr.mp3" ]; then
            for prayer in "${MISSING[@]}"; do
                cp fajr.mp3 "${prayer}.mp3"
                echo "  ✓ Created ${prayer}.mp3"
            done
            echo ""
            echo "✅ Quick fix applied! All prayers now have audio files."
            echo "⚠️  Note: All prayers will use the same Athan sound."
            echo ""
            echo "Later, you can replace these with proper files for each prayer."
        else
            echo "❌ fajr.mp3 not found. Cannot copy."
            echo "Please add at least one audio file first."
        fi
        ;;
    2)
        echo ""
        echo "📥 Where to Download Athan Audio Files:"
        echo ""
        echo "Option A: IslamicFinder"
        echo "  1. Visit: https://www.islamicfinder.org/"
        echo "  2. Search for 'Adhan audio' or 'Athan mp3'"
        echo "  3. Download and save to: $AUDIO_DIR"
        echo ""
        echo "Option B: YouTube"
        echo "  1. Search YouTube for: 'Adhan Fajr mp3' (or Dhuhr, Asr, Maghrib, Isha)"
        echo "  2. Use a YouTube to MP3 converter:"
        echo "     - https://ytmp3.cc/"
        echo "     - https://y2mate.com/"
        echo "  3. Save files to: $AUDIO_DIR"
        echo ""
        echo "Option C: Popular Reciters"
        echo "  Search for these reciters:"
        echo "  - Sheikh Mishary Alafasy Adhan"
        echo "  - Makkah Adhan"
        echo "  - Madinah Adhan"
        echo "  - Sheikh Abdul Basit Adhan"
        echo ""
        echo "Recommended file names:"
        for prayer in "${PRAYERS[@]}"; do
            echo "  - ${prayer}.mp3"
        done
        echo ""
        ;;
    3)
        echo ""
        echo "Skipped. You can add audio files manually later."
        echo ""
        ;;
    *)
        echo ""
        echo "Invalid choice. Exiting."
        ;;
esac

echo "💡 Tips:"
echo "  - Place all audio files in: $AUDIO_DIR"
echo "  - Use the Test button in the web interface to verify"
echo "  - Check application logs for any playback errors"
echo ""
echo "Run the application with: ./run.sh"
echo "Then open: http://localhost:8080"

