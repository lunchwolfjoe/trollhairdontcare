@echo off
echo ===== INSTALLING DATE-FNS DEPENDENCY =====

echo Stopping any running Node.js processes...
taskkill /F /IM node.exe 2>NUL
timeout /t 2 /nobreak >NUL

echo Installing date-fns dependency...
cd frontend-new
call npm install date-fns@4.1.0 --save

echo Starting the development server...
call npm run dev -- --port=5173 --host 