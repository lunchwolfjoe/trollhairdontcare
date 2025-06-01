@echo off
echo ===================================================
echo Supabase Credentials Update Tool
echo ===================================================
echo.
echo This script will update your Supabase credentials
echo in the .env.local file.
echo.
echo You can find your Supabase credentials in your
echo Supabase dashboard under Project Settings > API.
echo.

REM Prompt for Supabase URL
set /p supabase_url="Enter your Supabase URL: "

REM Prompt for Supabase Anon Key
set /p supabase_anon_key="Enter your Supabase Anon Key: "

REM Create or update .env.local file
echo VITE_SUPABASE_URL=%supabase_url%> .env.local
echo VITE_SUPABASE_ANON_KEY=%supabase_anon_key%>> .env.local

echo.
echo Credentials updated successfully!
echo.
echo The following credentials have been saved to .env.local:
echo VITE_SUPABASE_URL=%supabase_url%
echo VITE_SUPABASE_ANON_KEY=%supabase_anon_key%
echo.
echo Press any key to exit...
pause > nul 