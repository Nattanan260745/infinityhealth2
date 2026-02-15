$ServerIP = "147.50.228.99"
$User = "root"
$RemoteRoot = "/var/www/infinityhealth"

Write-Host "========================================"
Write-Host "🚀 InfinityHealth Full Deployment"
Write-Host "========================================"
Write-Host "You will be prompted for the server password multiple times."
Write-Host "Password: Ge7bWM2FYAiD"
Write-Host "========================================"
Write-Host ""

# 1. Build Admin Panel
Write-Host "🔨 Building Admin Panel..."
Set-Location "d:\infinityhealth\infinityhealth2\admin"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}

# 2. Create Remote Directories
Write-Host ""
Write-Host "Cc📁 Creating remote directories..."
& ssh "$User@$ServerIP" "mkdir -p $RemoteRoot/admin $RemoteRoot/backend"

# 3. Upload Admin Files
Write-Host ""
Write-Host "📤 Uploading Admin Panel..."
& scp -r "dist\*" "$User@$ServerIP:$RemoteRoot/admin"

# 4. Upload Backend Files
Write-Host ""
Write-Host "📤 Uploading Backend..."
Set-Location "d:\infinityhealth\infinityhealth2\backend"
# Copy package files
& scp "package.json" "package-lock.json" "$User@$ServerIP:$RemoteRoot/backend"
# Copy source
& scp -r "src" "config" "routes" "prisma" "$User@$ServerIP:$RemoteRoot/backend"

# Create proper .env content
$EnvContent = "PORT=3000`r`nNODE_ENV=production`r`nDATABASE_URL=postgresql://postgres:postgres@localhost:5432/infinityhealth?schema=public"
Set-Content -Path ".env.production" -Value $EnvContent -Force

& scp ".env.production" "$User@$ServerIP:$RemoteRoot/backend/.env"

# 5. Upload Setup Script
Write-Host ""
Write-Host "📜 Uploading Setup Script..."
Set-Location "d:\infinityhealth\infinityhealth2"
& scp "remote_setup.sh" "$User@$ServerIP:$RemoteRoot"
& ssh "$User@$ServerIP" "chmod +x $RemoteRoot/remote_setup.sh"

# 6. Execute Remote Setup
Write-Host ""
Write-Host "⚙️ Running Remote Setup..."
& ssh "$User@$ServerIP" "$RemoteRoot/remote_setup.sh"

Write-Host ""
Write-Host "========================================"
Write-Host "✅ Deployment Finished!"
Write-Host "Check the result at http://$ServerIP"
Write-Host "========================================"
