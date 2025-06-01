@echo off
echo ===================================================
echo TrollHairDontCare - Development with Local Supabase
echo ===================================================
echo.
echo This script allows you to run the app with your own
echo Supabase credentials for development purposes.
echo.

set ENV_FILE=.env.local.dev

if not exist %ENV_FILE% (
  echo Creating template %ENV_FILE% file...
  echo VITE_SUPABASE_URL=your_own_supabase_url> %ENV_FILE%
  echo VITE_SUPABASE_ANON_KEY=your_own_anon_key>> %ENV_FILE%
  echo.
  echo Created %ENV_FILE%. Please edit it with your own Supabase credentials.
  echo Then run this script again.
  pause
  exit /b
)

echo Using Supabase credentials from %ENV_FILE%
echo.

echo Backing up original .env.local...
copy .env.local .env.local.backup > nul

echo Copying %ENV_FILE% to .env.local...
copy %ENV_FILE% .env.local > nul

echo Starting development server...
call npm run dev

echo.
echo Restoring original .env.local...
copy .env.local.backup .env.local > nul
del .env.local.backup > nul

echo.
echo Development session completed. Original credentials restored.
echo.
pause 