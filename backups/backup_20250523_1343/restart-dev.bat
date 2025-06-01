@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>NUL

echo Clearing any cached ports...
timeout /t 2 /nobreak >NUL

echo Installing dependencies...
cd frontend-new
call npm install @mui/icons-material --force
call npm install

echo Starting development server on port 5173...
call npx vite --port 5173 --host 