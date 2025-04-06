@echo off
echo ===== COMPREHENSIVE FIX FOR VITE AND REACT ISSUES =====
echo.

echo Step 1: Killing all Node.js processes...
taskkill /F /IM node.exe
timeout /t 2 /nobreak > nul

echo Step 2: Fixing React component exports for Fast Refresh...
cd frontend-new
powershell -Command "(Get-Content src\contexts\AuthContext.tsx) -replace 'export default AuthProvider;', '' | Set-Content src\contexts\AuthContext.tsx"
powershell -Command "Get-ChildItem -Path src -Recurse -Filter *.tsx | ForEach-Object { $content = Get-Content $_.FullName; if ($content -match 'export default') { $newContent = $content -replace 'export default (\w+);', 'export { $1 };'; Set-Content $_.FullName $newContent } }"

echo Step 3: Fixing import/export mismatches...
REM Fix default imports to named imports
powershell -Command "Get-ChildItem -Path src -Recurse -Filter *.tsx | ForEach-Object { $content = Get-Content $_.FullName; if ($content -match 'import \w+ from ''\.\.\/\w+''') { $newContent = $content -replace 'import (\w+) from ''(\.\.\/\w+)''', 'import { $1 } from ''$2'''; Set-Content $_.FullName $newContent } }"

echo Step 4: Updating Vite configuration...
powershell -Command "(Get-Content vite.config.ts) -replace 'plugins: \[react()\]', 'plugins: [react({ fastRefresh: true })],' | Set-Content vite.config.ts"
powershell -Command "(Get-Content vite.config.ts) -replace 'host: true,', 'host: true, strictPort: true, hmr: { protocol: \"ws\", host: \"localhost\", port: 5173, clientPort: 5173 },' | Set-Content vite.config.ts"

echo Step 5: Starting Vite dev server with proxy...
start cmd /k "npm run dev:proxy"

echo.
echo All fixes applied. Dev server started with proxy.
echo Press any key to exit this window...
pause > nul 