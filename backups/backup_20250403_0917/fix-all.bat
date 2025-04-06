@echo off
echo ===== FIXING DEVELOPMENT ENVIRONMENT =====
echo.

echo Step 1: Killing all Node.js processes...
taskkill /F /IM node.exe 2>NUL
timeout /t 2 /nobreak >NUL

echo Step 2: Installing dependencies in frontend-new...
cd frontend-new
call npm install vite --save-dev
call npm install @mui/icons-material --save
call npm install @vitejs/plugin-react --save-dev
call npm install @mui/material --save
call npm install react-router-dom --save

echo Step 3: Starting the development server...
call npm run dev -- --port=5173 --host 