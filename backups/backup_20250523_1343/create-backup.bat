@echo off
setlocal enabledelayedexpansion

REM Get current date and time in format YYYYMMDD_HHMM
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,4%

REM Create backups directory if it doesn't exist
if not exist backups mkdir backups

REM Backup name with timestamp
set BACKUP_DIR=backups\backup_%TIMESTAMP%

REM Create backup directory
mkdir %BACKUP_DIR%

REM Copy important files and directories
echo Creating backup in %BACKUP_DIR%...
xcopy frontend-new %BACKUP_DIR%\frontend-new\ /E /I /H /Y
xcopy supabase %BACKUP_DIR%\supabase\ /E /I /H /Y
copy *.md %BACKUP_DIR%\ /Y
copy *.sql %BACKUP_DIR%\ /Y
copy *.bat %BACKUP_DIR%\ /Y
copy *.ps1 %BACKUP_DIR%\ /Y
copy package.json %BACKUP_DIR%\ /Y
copy .env.local %BACKUP_DIR%\ /Y

echo.
echo Backup completed successfully in %BACKUP_DIR%
echo.

endlocal 