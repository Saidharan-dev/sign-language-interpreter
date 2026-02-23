@echo off
REM Sign Language Interpreter - Quick Start (Windows)

echo.
echo ============================================================
echo   Sign Language Gesture Recognition - Quick Start Setup
echo ============================================================
echo.

echo [1/3] Installing dependencies...
echo Running: npm install
call npm install

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ERROR: npm install failed
  echo Please check your internet connection and try again
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   Installation Complete!
echo ============================================================
echo.
echo Available Commands:
echo   npm start       - Start development server
echo   npm run android - Build and run on Android
echo   npm run ios     - Build and run on iOS
echo   npm run web     - Run on web browser
echo.
echo To Start the App:
echo   1. Run: npm start
echo   2. Download Expo Go app on your mobile device
echo   3. Scan the QR code displayed in terminal
echo.
echo Supported Gestures:
echo   - HI           (All fingers extended)
echo   - LOVE YOU     (ILY sign)
echo   - HELP         (Open palm)
echo   - FOOD         (Hand near mouth)
echo   - EAT          (Eating gesture)
echo   - THANK YOU    (Open hands)
echo   - PEACE        (V sign)
echo   - THUMBS UP    (Thumb up)
echo   - FIST         (Closed fist)
echo.
echo For detailed docs, see: GESTURE_DETECTION_GUIDE.md
echo.
pause
