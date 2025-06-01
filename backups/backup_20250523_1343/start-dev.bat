@echo off
echo Killing any Node.js processes on ports 5173-5177...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    taskkill /F /PID %%a 2>NUL
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174"') do (
    taskkill /F /PID %%a 2>NUL
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5175"') do (
    taskkill /F /PID %%a 2>NUL
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5176"') do (
    taskkill /F /PID %%a 2>NUL
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5177"') do (
    taskkill /F /PID %%a 2>NUL
)

echo Starting development server on port 5173...
cd frontend-new && npm run dev 