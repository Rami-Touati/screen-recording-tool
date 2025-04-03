@echo off
echo Starting Screen Recorder v1.0.0...
echo This version is confirmed working - May 2024 Update

:: Kill any existing process on port 3001 if it exists
npx kill-port 3001 >nul 2>&1

:: Set production mode
set NODE_ENV=production

:: Start the application
npm run start-prod

:: If npm run fails, pause to show error
if errorlevel 1 pause 