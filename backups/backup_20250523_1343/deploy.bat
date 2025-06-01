@echo off
echo 🚀 Preparing to deploy to Vercel...

REM Check if Vercel CLI is installed
vercel --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ⚠️ Vercel CLI is not installed. Installing now...
  call npm install -g vercel
  if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install Vercel CLI
    exit /b 1
  )
  echo ✅ Vercel CLI installed successfully
) else (
  echo ✅ Vercel CLI is installed
)

REM Build the project
echo 🔨 Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Build failed
  exit /b 1
)
echo ✅ Build completed successfully

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
call vercel --prod --yes
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Deployment failed
  exit /b 1
)
echo ✅ Deployment successful!

pause 