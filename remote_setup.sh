#!/bin/bash

# Define paths
APP_DIR="/var/www/infinityhealth"
BACKEND_DIR="$APP_DIR/backend"
ADMIN_DIR="$APP_DIR/admin"

echo "========================================"
echo "🚀 Starting Server Setup for InfinityHealth"
echo "========================================"

# 1. Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# 2. Configure Nginx
echo "🔧 Configuring Nginx..."
cat > /etc/nginx/sites-available/infinityhealth <<EOF
server {
    listen 80;
    server_name _; # Respond to IP address

    # Frontend (Admin Panel)
    location / {
        root $ADMIN_DIR;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

        location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Site
ln -sf /etc/nginx/sites-available/infinityhealth /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
echo "✅ Nginx configured!"

# 3. Setup Backend & Database
echo "⚙️ Setting up Backend & Database..."
cd $BACKEND_DIR

# Setup Database (Idempotent-ish)
echo "🐘 Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE infinityhealth;" 2>/dev/null || echo "Database already exists."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" 

# Check if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing backend dependencies..."
    npm install --production
    
    # Run Prisma Migrations
    echo "🔄 Running Database Migrations..."
    npx prisma generate
    npx prisma migrate deploy

    # 4. Start/Restart PM2
    echo "🚀 Starting Backend with PM2..."
    if pm2 describe infinity-backend > /dev/null; then
        pm2 reload infinity-backend
    else
        # Assuming index.js is the entry point
        pm2 start src/index.js --name infinity-backend
    fi
    pm2 save
    pm2 startup | bash # Ensure startup on boot
else
    echo "⚠️ No package.json found in $BACKEND_DIR. Skipping npm install."
fi

echo "========================================"
echo "✅ Setup Complete! Access Admin at http://\$(curl -s ifconfig.me)"
echo "========================================"
