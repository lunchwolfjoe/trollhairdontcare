# Stop any process using port 5177
Get-Process -Id (Get-NetTCPConnection -LocalPort 5177 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force

# Change to the frontend-new directory
cd frontend-new

# Run the development server
npm run dev 