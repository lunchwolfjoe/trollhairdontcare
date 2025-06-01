@echo off
echo Fixing React component exports for Fast Refresh compatibility...

REM Kill any running Node.js processes
taskkill /F /IM node.exe
timeout /t 2 /nobreak > nul

REM Fix AuthContext.tsx
echo Fixing AuthContext.tsx...
powershell -Command "(Get-Content src\contexts\AuthContext.tsx) -replace 'export default AuthProvider;', '' | Set-Content src\contexts\AuthContext.tsx"

REM Fix other component files with default exports
echo Fixing other component files...
powershell -Command "Get-ChildItem -Path src -Recurse -Filter *.tsx | ForEach-Object { $content = Get-Content $_.FullName; if ($content -match 'export default') { $newContent = $content -replace 'export default (\w+);', 'export { $1 };'; Set-Content $_.FullName $newContent } }"

echo.
echo React component exports fixed for Fast Refresh compatibility.
echo.
echo Starting Vite dev server...
start cmd /k "npm run dev:proxy"
echo.
echo Dev server started with proxy. Press any key to exit this window...
pause > nul 