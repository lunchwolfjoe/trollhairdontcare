# PowerShell script to fix the messages table in the database
Write-Host "Fixing messages table to properly handle announcements..." -ForegroundColor Cyan

# Check for required environment variables
if (-not $env:DATABASE_URL) {
    if (Test-Path .env) {
        # Try to load from .env file
        Get-Content .env | ForEach-Object {
            if ($_ -match "^\\s*([^#][^=]+)=(.*)$") {
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
Write-Host "Running SQL to fix message table structure and policies..." -ForegroundColor Cyan

try {
    # Attempt to use psql to run the script
    & psql -f sql/fix_messages_recipient_id.sql "$env:DATABASE_URL"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Messages table has been fixed successfully!" -ForegroundColor Green
        Write-Host "Announcements should now work properly with the correct RLS policies." -ForegroundColor Green
    } else {
        Write-Host "❌ Error fixing messages table." -ForegroundColor Red
        Write-Host "Please check the error output and try again." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: Failed to execute psql command. Make sure PostgreSQL is installed and in your PATH." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} 