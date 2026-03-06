@echo off
REM Athan Application Startup Script for Windows

echo ================================
echo Athan - Prayer Times Application
echo ================================
echo.

REM Check if Maven is installed
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo Maven is not installed!
    echo.
    echo Please install Maven from: https://maven.apache.org/download.cgi
    echo.
    pause
    exit /b 1
)

REM Check if Java is installed
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo Java is not installed!
    echo.
    echo Please install Java 21 or higher from:
    echo https://www.oracle.com/java/technologies/downloads/#java21
    echo.
    pause
    exit /b 1
)

REM Create audio directory if it doesn't exist
if not exist "audio\" (
    echo Creating audio directory...
    mkdir audio
)

REM Build the application if needed
if not exist "target\athan-app-1.0.0.jar" (
    echo Building application...
    call mvn clean install -DskipTests
    if errorlevel 1 (
        echo Build failed!
        pause
        exit /b 1
    )
    echo Build successful!
    echo.
)

REM Run the application
echo Starting Athan Application...
echo.
echo Open your browser to: http://localhost:8080
echo.
echo Press Ctrl+C to stop the application
echo.

call mvn spring-boot:run

pause

