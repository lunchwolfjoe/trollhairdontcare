Write-Host "Stopping all Node.js processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Clearing any cached ports..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

Write-Host "Installing dependencies..." -ForegroundColor Cyan
Set-Location -Path ./frontend-new
npm install @mui/icons-material --force
npm install

Write-Host "Starting development server on port 5173..." -ForegroundColor Cyan
npx vite --port 5173 --host 