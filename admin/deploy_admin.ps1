Write-Host "Deploying Admin Panel to Server..."
Write-Host "Server IP: 147.50.228.99"
Write-Host "User: root"
Write-Host "Note: You will be asked for the password twice (once for mkdir, once for scp)."
Write-Host "Password: Ge7bWM2FYAiD"

# Create directory
Write-Host "`n1. Creating directory /var/www/infinityhealth/admin ..."
ssh root@147.50.228.99 "mkdir -p /var/www/infinityhealth/admin"

# Upload files
Write-Host "`n2. Uploading files..."
scp -r "d:\infinityhealth\infinityhealth2\admin\dist\*" root@147.50.228.99:/var/www/infinityhealth/admin

Write-Host "`n✅ Deployment Complete!"
Write-Host "You can verify by visiting http://147.50.228.99/admin (Config required on server usually, but files are there)"
