Write-Host "===== COMPREHENSIVE FIX FOR VITE AND REACT ISSUES =====" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Killing all Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Step 2: Fixing React component exports for Fast Refresh..." -ForegroundColor Yellow
Set-Location -Path "frontend-new"
(Get-Content src\contexts\AuthContext.tsx) -replace 'export default AuthProvider;', '' | Set-Content src\contexts\AuthContext.tsx
Get-ChildItem -Path src -Recurse -Filter *.tsx | ForEach-Object { 
    $content = Get-Content $_.FullName
    if ($content -match 'export default') {
        $newContent = $content -replace 'export default (\w+);', 'export { $1 };'
        Set-Content $_.FullName $newContent
    }
}

Write-Host "Step 3: Updating Vite configuration..." -ForegroundColor Yellow
(Get-Content vite.config.ts) -replace 'plugins: \[react()\]', 'plugins: [react({ fastRefresh: true })],' | Set-Content vite.config.ts
(Get-Content vite.config.ts) -replace 'host: true,', 'host: true, strictPort: true, hmr: { protocol: \"ws\", host: \"localhost\", port: 5173, clientPort: 5173 },' | Set-Content vite.config.ts

Write-Host "Step 4: Starting Vite dev server with proxy..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k npm run dev:proxy"

Write-Host ""
Write-Host "All fixes applied. Dev server started with proxy." -ForegroundColor Green
Write-Host "Press any key to exit this window..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 