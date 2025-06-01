@echo off
setlocal enabledelayedexpansion

REM Check if backups directory exists
if not exist backups (
    echo No backups directory found.
    goto :EOF
)

REM List available backups
echo Available backups:
echo.

set /a count=0
for /d %%i in (backups\backup_*) do (
    set /a count+=1
    set "backup[!count!]=%%i"
    echo !count!. %%i
)

if %count% equ 0 (
    echo No backups found.
    goto :EOF
)

echo.
set /p choice=Enter backup number to restore (or 0 to cancel): 

if "%choice%"=="0" goto :EOF

REM Validate choice
if %choice% leq 0 goto :invalid
if %choice% gtr %count% goto :invalid

REM Get selected backup
set selected=!backup[%choice%]!

echo.
echo You selected: %selected%
echo.
echo WARNING: This will overwrite your current frontend-new directory.
set /p confirm=Are you sure you want to proceed? (y/n): 

if /i not "%confirm%"=="y" goto :EOF

REM Kill any running Node processes
echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul

REM Create a temporary backup of current frontend-new
echo Creating temporary backup of current files...
if exist temp_backup rmdir /S /Q temp_backup
mkdir temp_backup
xcopy frontend-new temp_backup\frontend-new\ /E /I /H /Y

REM Restore selected backup
echo.
echo Restoring from %selected%...
rmdir /S /Q frontend-new
xcopy %selected%\frontend-new frontend-new\ /E /I /H /Y

echo.
echo Backup restored successfully!
echo.
echo Your previous files have been saved to temp_backup directory.
echo If anything went wrong, you can recover them from there.
echo.

goto :EOF

:invalid
echo Invalid selection. Please try again.
goto :EOF

endlocal 