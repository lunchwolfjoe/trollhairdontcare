@echo off
echo Starting development server...

REM Try to kill any node processes
echo Attempting to stop any existing Node.js processes...
taskkill /F /IM node.exe /T 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo Node processes terminated.
) else (
    echo No Node processes found or could not terminate them.
)

REM Change to the frontend-new directory
cd /d "%~dp0\..\frontend-new"

REM Start the development server on an alternate port
echo Starting development server on port 5174...
npm run dev -- --port 5174

pause 