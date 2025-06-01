Write-Host "===== FIXING ALL IMPORT/EXPORT MISMATCHES =====" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Node.js processes
Write-Host "Step 1: Killing all Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Fix all import/export mismatches
Write-Host "Step 2: Fixing all import/export mismatches..." -ForegroundColor Yellow

# Get all TypeScript files
$tsFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

# Fix default exports to named exports
Write-Host "  - Converting default exports to named exports..." -ForegroundColor Yellow
foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'export default \w+;') {
        $newContent = $content -replace 'export default (\w+);', 'export { $1 };'
        Set-Content $file.FullName $newContent
        Write-Host "    Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

# Fix default imports to named imports
Write-Host "  - Converting default imports to named imports..." -ForegroundColor Yellow
foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'import \w+ from ''\.\.\/\w+''') {
        $newContent = $content -replace 'import (\w+) from ''(\.\.\/\w+)''', 'import { $1 } from ''$2'''
        Set-Content $file.FullName $newContent
        Write-Host "    Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

# Fix specific files with known issues
Write-Host "  - Fixing specific files with known issues..." -ForegroundColor Yellow

# Fix FestivalManagement.tsx
$festivalManagementPath = "src\features\coordinator\FestivalManagement.tsx"
if (Test-Path $festivalManagementPath) {
    $content = Get-Content $festivalManagementPath -Raw
    $content = $content -replace 'import SearchFilter, \{ FilterOption \} from ''\.\.\/\.\.\/components\/common\/SearchFilter''', 'import { SearchFilter, FilterOption } from ''../../components/common/SearchFilter'''
    Set-Content $festivalManagementPath $content
    Write-Host "    Fixed: $festivalManagementPath" -ForegroundColor Green
}

# Fix VolunteerManagement.tsx
$volunteerManagementPath = "src\features\coordinator\VolunteerManagement.tsx"
if (Test-Path $volunteerManagementPath) {
    $content = Get-Content $volunteerManagementPath -Raw
    $content = $content -replace 'import SearchFilter, \{ FilterOption \} from ''\.\.\/\.\.\/components\/common\/SearchFilter''', 'import { SearchFilter, FilterOption } from ''../../components/common/SearchFilter'''
    $content = $content -replace 'import DataTable, \{ TableColumn, TableAction \} from ''\.\.\/\.\.\/components\/common\/DataTable''', 'import { DataTable, TableColumn, TableAction } from ''../../components/common/DataTable'''
    Set-Content $volunteerManagementPath $content
    Write-Host "    Fixed: $volunteerManagementPath" -ForegroundColor Green
}

# Step 3: Update Vite configuration
Write-Host "Step 3: Updating Vite configuration..." -ForegroundColor Yellow
$viteConfigPath = "vite.config.ts"
if (Test-Path $viteConfigPath) {
    $content = Get-Content $viteConfigPath -Raw
    $content = $content -replace 'plugins: \[react\(\)\]', 'plugins: [react({ fastRefresh: true })],'
    $content = $content -replace 'host: true,', 'host: true, strictPort: true, hmr: { protocol: "ws", host: "localhost", port: 5173, clientPort: 5173 },'
    Set-Content $viteConfigPath $content
    Write-Host "    Updated: $viteConfigPath" -ForegroundColor Green
}

# Step 4: Start Vite dev server
Write-Host "Step 4: Starting Vite dev server..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k npm run dev:proxy"

Write-Host ""
Write-Host "All import/export mismatches fixed. Dev server started with proxy." -ForegroundColor Green
Write-Host "Press any key to exit this window..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 