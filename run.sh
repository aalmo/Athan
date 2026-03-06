#!/bin/bash

# Athan Application Startup Script

echo "🕌 Athan - Prayer Times Application"
echo "===================================="
echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null
then
    echo "❌ Maven is not installed!"
    echo ""
    echo "Please install Maven first:"
    echo "  macOS:   brew install maven"
    echo "  Linux:   sudo apt-get install maven"
    echo "  Windows: Download from https://maven.apache.org/download.cgi"
    echo ""
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null
then
    echo "❌ Java is not installed!"
    echo ""
    echo "Please install Java 21 or higher:"
    echo "  https://www.oracle.com/java/technologies/downloads/#java21"
    echo ""
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | awk -F '.' '{print $1}')
if [ "$JAVA_VERSION" -lt 21 ]; then
    echo "⚠️  Warning: Java 21 or higher is required. You have Java $JAVA_VERSION"
    echo ""
fi

# Check if audio directory exists
if [ ! -d "audio" ]; then
    echo "📁 Creating audio directory..."
    mkdir -p audio
fi

# Check if audio files exist
AUDIO_COUNT=$(find audio -type f \( -name "*.mp3" -o -name "*.wav" \) | wc -l)
if [ "$AUDIO_COUNT" -eq 0 ]; then
    echo "⚠️  No audio files found in audio/ directory"
    echo "   Please add your Athan audio files (MP3 or WAV format)"
    echo "   See audio/README.md for more information"
    echo ""
fi

# Build the application if needed
if [ ! -f "target/athan-app-1.0.0.jar" ]; then
    echo "🔨 Building application..."
    mvn clean install -DskipTests
    if [ $? -ne 0 ]; then
        echo "❌ Build failed!"
        exit 1
    fi
    echo "✅ Build successful!"
    echo ""
fi

# Run the application
echo "🚀 Starting Athan Application..."
echo ""
echo "Open your browser to: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

mvn spring-boot:run

