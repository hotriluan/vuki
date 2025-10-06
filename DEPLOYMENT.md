# Production Deployment Guide for VPS/Cloud Server

## Server Requirements
- Node.js 18+ 
- PM2 (Process Manager)
- Nginx (Reverse Proxy)
- Domain pointing to server IP

## Deployment Steps

### 1. Install Dependencies on Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Upload Code to Server
```bash
# Method 1: Git Clone
git clone https://github.com/hotriluan/vuki.git
cd vuki

# Method 2: Upload via FTP/SFTP
# Upload entire project folder to /var/www/vuki
```

### 3. Setup Environment
```bash
# Install dependencies
npm install

# Create production environment file
cp .env.example .env.local
# Edit .env.local with production values

# Build the application
npm run build
```

### 4. Configure PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vuki-website',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configure Nginx
```bash
# Create Nginx config
sudo cat > /etc/nginx/sites-available/vuki << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/vuki /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```