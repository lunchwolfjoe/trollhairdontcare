# PowerShell script to help start the development server
# Kills existing Node processes that might be blocking port 5173
# and starts the app on a different port if needed

# Stop any existing processes on port 5173
try {
    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Found process using port 5173: $($process.Name) (PID: $($process.Id))"
        Write-Host "Stopping process..."
        $process | Stop-Process -Force
        Write-Host "Process stopped."
    } else {
        Write-Host "No process found using port 5173."
    }
} catch {
    Write-Host "Could not check or stop processes on port 5173: $_"
}

# Define available ports to try
$ports = @(5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180)

# Find a free port
$freePort = $null
foreach ($port in $ports) {
    $tcpConnection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if (-not $tcpConnection) {
        $freePort = $port
        break
    }
}

if ($freePort) {
    Write-Host "Starting development server on port $freePort..."
    Set-Location -Path "$PSScriptRoot\..\frontend-new"
    
    # Start the dev server with the free port
    npm run dev -- --port $freePort
} else {
    Write-Host "No free ports available in the range $($ports[0])-$($ports[-1])."
    Write-Host "Please free up one of these ports and try again."
} 