# Stop any process using port 5177
try {
    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort 5177 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        $process | Stop-Process -Force
        Write-Host "Stopped process using port 5177"
    }
} catch {
    Write-Host "No process found using port 5177"
}

# Change to the frontend-new directory
Set-Location -Path "frontend-new"

# Run the development server
npm run dev 