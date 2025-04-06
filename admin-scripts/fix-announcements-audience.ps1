# PowerShell script to fix audience targeting for announcements in the database
Write-Host "Fixing audience targeting for announcements..." -ForegroundColor Cyan

# Check for required environment variables
if (-not $env:DATABASE_URL) {
    if (Test-Path .env) {
        # Try to load from .env file
        Get-Content .env | ForEach-Object {
            if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($key, $value)
            }
        }
    } else {
        Write-Host "Error: DATABASE_URL environment variable not set" -ForegroundColor Red
        Write-Host "Please set the DATABASE_URL or create a .env file with DATABASE_URL" -ForegroundColor Red
        exit 1
    }
}

# Execute the SQL file
Write-Host "Running SQL to add audience column and fix RLS policies..." -ForegroundColor Cyan
$result = psql -f sql/announcements_audience_fix.sql "$env:DATABASE_URL"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Announcements audience targeting has been fixed successfully!" -ForegroundColor Green
    Write-Host "You can now target specific audiences with your announcements." -ForegroundColor Green
} else {
    Write-Host "❌ Error: Failed to fix announcements audience targeting." -ForegroundColor Red
    Write-Host "Please check your database connection and permissions." -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}

Write-Host "Done!" -ForegroundColor Cyan 