@echo off
echo ===== FIXING IMPORT/EXPORT MISMATCHES =====
echo.

echo Step 1: Killing all Node.js processes...
taskkill /F /IM node.exe
timeout /t 2 /nobreak > nul

echo Step 2: Fixing import/export mismatches...
cd frontend-new

REM Fix default imports to named imports
powershell -Command "Get-ChildItem -Path src -Recurse -Filter *.tsx | ForEach-Object { $content = Get-Content $_.FullName; if ($content -match 'import \w+ from ''\.\.\/\w+''') { $newContent = $content -replace 'import (\w+) from ''(\.\.\/\w+)''', 'import { $1 } from ''$2'''; Set-Content $_.FullName $newContent } }"

REM Fix default exports to named exports
powershell -Command "Get-ChildItem -Path src -Recurse -Filter *.tsx | ForEach-Object { $content = Get-Content $_.FullName; if ($content -match 'export default \w+;') { $newContent = $content -replace 'export default (\w+);', 'export { $1 };'; Set-Content $_.FullName $newContent } }"

echo.
echo Import/export mismatches fixed.
echo.
echo Starting Vite dev server...
start cmd /k "npm run dev:proxy"
echo.
echo Dev server started with proxy. Press any key to exit this window...
pause > nul 