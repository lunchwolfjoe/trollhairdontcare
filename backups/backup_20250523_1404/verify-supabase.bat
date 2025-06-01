@echo off
echo ===================================================
echo Supabase Connection Verification Tool
echo ===================================================
echo.
echo This script will test your Supabase connection and 
echo authentication flow.
echo.
echo Please make sure you've updated your .env.local file
echo with the correct Supabase credentials.
echo.
echo Press any key to continue or CTRL+C to cancel...
pause > nul

echo.
echo Installing required dependencies...
call npm install --save @supabase/supabase-js dotenv

echo.
echo Running verification script...
node verify-supabase.js

echo.
if %ERRORLEVEL% EQU 0 (
  echo All checks completed successfully!
) else (
  echo Some checks failed. Please review the errors above.
)

echo.
echo Press any key to exit...
pause > nul 