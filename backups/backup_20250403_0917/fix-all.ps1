Write-Host "===== FIXING DEVELOPMENT ENVIRONMENT =====" -ForegroundColor Cyan

# Step 1: Kill all Node.js processes
Write-Host "Step 1: Killing all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Install dependencies in the correct directory
Write-Host "Step 2: Installing dependencies in frontend-new..." -ForegroundColor Yellow
Set-Location -Path frontend-new
npm install vite --save-dev
npm install @mui/icons-material --save
npm install @vitejs/plugin-react --save-dev
npm install @mui/material --save
npm install react-router-dom --save

# Step 3: Start the server
Write-Host "Step 3: Starting the development server..." -ForegroundColor Yellow
npm run dev -- --port=5173 --host 