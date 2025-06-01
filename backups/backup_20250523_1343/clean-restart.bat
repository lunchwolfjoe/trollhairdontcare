@echo off
echo ===== CLEAN RESTART =====

echo 1. Cleaning up node_modules and package-lock.json...
cd frontend-new
if exist node_modules (
  rmdir /s /q node_modules
)
if exist package-lock.json (
  del package-lock.json
)

echo 2. Installing compatible React versions...
call npm install react@18.2.0 react-dom@18.2.0 --save --legacy-peer-deps

echo 3. Installing other dependencies...
call npm install @mui/material@5.15.10 @mui/icons-material@5.15.10 @emotion/react @emotion/styled --save --legacy-peer-deps
call npm install react-router-dom@6.22.0 --save --legacy-peer-deps
call npm install vite@6.2.4 @vitejs/plugin-react --save-dev --legacy-peer-deps

echo Cleaning up Node.js processes...
taskkill /F /IM node.exe
echo.
echo Waiting for processes to terminate...
timeout /t 2 /nobreak > nul
echo.
echo Starting Vite dev server...
start cmd /k "npm run dev:proxy"
echo.
echo Dev server started with proxy. Press any key to exit this window...
pause > nul 