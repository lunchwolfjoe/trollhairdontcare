@echo off
echo ===== FIXING REACT VERSION MISMATCH =====
echo.

echo Step 1: Killing all Node.js processes...
taskkill /F /IM node.exe 2>NUL
timeout /t 2 /nobreak >NUL

echo Step 2: Clearing node_modules folder...
if exist node_modules (
  rmdir /s /q node_modules
)
if exist package-lock.json (
  del package-lock.json
)

echo Step 3: Installing compatible React versions...
call npm install react@18.2.0 react-dom@18.2.0 --save --legacy-peer-deps

echo Step 4: Installing other dependencies with legacy peer deps...
call npm install @mui/material @mui/icons-material @emotion/react @emotion/styled --save --legacy-peer-deps
call npm install react-router-dom --save --legacy-peer-deps
call npm install vite @vitejs/plugin-react --save-dev --legacy-peer-deps

echo Step 5: Starting the application...
call npm run dev -- --port=5173 --host 