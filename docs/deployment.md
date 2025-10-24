# Deployment Guide

This guide covers deploying FormBotz to production, including maintenance mode setup for zero-downtime deployments.

## Prerequisites

- Node.js 18+ or Bun 1.0+
- MongoDB database (local or cloud)
- Domain name (for production)
- SSL certificate (recommended)

---

## Environment Variables

### Development
```env
MONGODB_URI=mongodb://localhost:27017/formbotz
NEXTAUTH_SECRET=development-secret-key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### Production
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/formbotz?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-production-secret-key-generate-with-openssl
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

### Generate Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Deployment Options

### Option 1: Vercel (Easiest for Next.js)

**Pros:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions
- Free tier available

**Steps:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

**Database:**
- Use MongoDB Atlas (cloud)
- Add Vercel IP to MongoDB whitelist

**Custom Domain:**
- Add domain in Vercel dashboard
- Update DNS records as instructed
- HTTPS configured automatically

---

### Option 2: Railway

**Pros:**
- Easy deployment
- Managed MongoDB option
- Free tier available
- Simple environment management

**Steps:**
1. Create Railway account
2. Connect GitHub repository
3. Add MongoDB plugin or external connection
4. Configure environment variables
5. Deploy

**Build Command:**
```bash
npm run build
# or
bun run build
```

**Start Command:**
```bash
npm run start
# or
bun run start
```

---

### Option 3: DigitalOcean App Platform

**Pros:**
- Managed platform
- Predictable pricing
- Managed MongoDB available
- Easy scaling

**Steps:**
1. Create DigitalOcean account
2. Create new app from GitHub
3. Configure build settings
4. Add managed MongoDB or external connection
5. Set environment variables
6. Deploy

**Resource Sizing:**
- Basic: $5/month (1GB RAM, 1 vCPU)
- Professional: $12/month (2GB RAM, 2 vCPU)

---

### Option 4: Self-Hosted VPS (Full Control)

**Pros:**
- Complete control
- Custom configurations
- Cost-effective at scale
- Can add maintenance mode

**Recommended Providers:**
- DigitalOcean Droplets
- Linode
- Vultr
- Hetzner

**Minimum Requirements:**
- 2GB RAM
- 1 vCPU
- 25GB SSD
- Ubuntu 22.04 LTS

---

## Self-Hosted Deployment (Detailed)

### 1. Server Setup

#### Install Node.js
```bash
# Using NVM (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify
node --version
npm --version
```

#### Install Bun (Alternative to Node.js)
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
```

#### Install MongoDB (Local)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt update
sudo apt install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod
```

Or use **MongoDB Atlas** (cloud) instead.

---

### 2. Deploy Application

#### Clone Repository
```bash
cd /var/www
git clone https://github.com/yourusername/formbotz-nextjs.git
cd formbotz-nextjs
```

#### Install Dependencies
```bash
npm install
# or
bun install
```

#### Configure Environment
```bash
nano .env
```

Add production environment variables.

#### Build Application
```bash
npm run build
# or
bun run build
```

#### Test Build
```bash
npm run start
# or
bun run start
```

Visit `http://your-server-ip:3000` to verify.

---

### 3. Process Management with PM2

PM2 keeps your app running and restarts it on crashes or server reboots.

#### Install PM2
```bash
npm install -g pm2
```

#### Create Ecosystem File
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'formbotz',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/formbotz-nextjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

#### Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### PM2 Commands
```bash
# Status
pm2 status

# Logs
pm2 logs formbotz

# Restart
pm2 restart formbotz

# Stop
pm2 stop formbotz

# Delete
pm2 delete formbotz
```

---

### 4. Nginx Reverse Proxy

Nginx handles SSL, caching, and routes traffic to your Next.js app.

#### Install Nginx
```bash
sudo apt update
sudo apt install -y nginx
```

#### Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/formbotz
```

```nginx
# Maintenance mode flag
geo $maintenance_mode {
    default 0;
}

# Check if maintenance file exists
map $uri $maintenance {
    default $maintenance_mode;
}

# Upstream to Next.js
upstream formbotz_upstream {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS (add after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Maintenance mode check
    if (-f /var/www/maintenance/formbotz/.maintenance) {
        set $maintenance_mode 1;
    }

    if ($maintenance_mode = 1) {
        return 503;
    }

    # Proxy to Next.js
    location / {
        proxy_pass http://formbotz_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Error pages (maintenance mode)
    error_page 502 503 504 /maintenance.html;
    location = /maintenance.html {
        root /var/www/maintenance/formbotz;
        internal;
    }

    # Static files for maintenance page
    location /maintenance-assets/ {
        root /var/www/maintenance/formbotz;
        internal;
    }
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/formbotz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 5. SSL with Let's Encrypt

#### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### Get Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow prompts. Certbot automatically updates Nginx config for HTTPS.

#### Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot auto-renewal is set up via systemd timer
sudo systemctl status certbot.timer
```

---

### 6. Maintenance Mode Setup

Maintenance mode allows zero-downtime deployments by showing a maintenance page while rebuilding.

#### Create Maintenance Directory
```bash
sudo mkdir -p /var/www/maintenance/formbotz
```

#### Create Maintenance Page
```bash
sudo nano /var/www/maintenance/formbotz/index.html
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="30">
    <title>Maintenance Mode - FormBotz</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            text-align: center;
            max-width: 600px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 60px 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            font-weight: 700;
        }
        p {
            font-size: 1.2em;
            line-height: 1.6;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .spinner {
            width: 50px;
            height: 50px;
            margin: 30px auto;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .info {
            font-size: 0.9em;
            opacity: 0.7;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛠️ Maintenance Mode</h1>
        <p>
            We're currently performing scheduled maintenance to improve FormBotz.
            We'll be back online shortly.
        </p>
        <div class="spinner"></div>
        <p class="info">
            This page will automatically refresh every 30 seconds.<br>
            Thank you for your patience!
        </p>
    </div>
</body>
</html>
```

#### Create Maintenance Helper Scripts

**Enable Maintenance Mode:**
```bash
sudo nano /usr/local/bin/formbotz-maintenance-on
```

```bash
#!/bin/bash
sudo touch /var/www/maintenance/formbotz/.maintenance
echo "✅ Maintenance mode ENABLED"
```

**Disable Maintenance Mode:**
```bash
sudo nano /usr/local/bin/formbotz-maintenance-off
```

```bash
#!/bin/bash
sudo rm -f /var/www/maintenance/formbotz/.maintenance
echo "✅ Maintenance mode DISABLED"
```

**Check Maintenance Status:**
```bash
sudo nano /usr/local/bin/formbotz-maintenance-status
```

```bash
#!/bin/bash
if [ -f /var/www/maintenance/formbotz/.maintenance ]; then
    echo "🔧 Maintenance mode is ENABLED"
else
    echo "✅ Maintenance mode is DISABLED"
fi
```

**Make Executable:**
```bash
sudo chmod +x /usr/local/bin/formbotz-maintenance-*
```

#### Update package.json Start Script

For automatic maintenance mode during builds:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "formbotz-maintenance-on && next build && pm2 restart formbotz && formbotz-maintenance-off || formbotz-maintenance-off",
    "lint": "next lint"
  }
}
```

This ensures:
1. Maintenance mode turns on before build
2. Build runs
3. PM2 restarts app
4. Maintenance mode turns off
5. If any step fails, maintenance mode still turns off

---

### 7. Deployment Workflow

#### Manual Deployment
```bash
# SSH into server
ssh user@your-server

# Navigate to app directory
cd /var/www/formbotz-nextjs

# Enable maintenance mode
formbotz-maintenance-on

# Pull latest changes
git pull origin main

# Install dependencies (if package.json changed)
npm install

# Build application
npm run build

# Restart PM2
pm2 restart formbotz

# Wait for app to start (check logs)
pm2 logs formbotz --lines 50

# Disable maintenance mode
formbotz-maintenance-off
```

#### Automated Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/formbotz-nextjs
            formbotz-maintenance-on
            git pull origin main
            npm install
            npm run build
            pm2 restart formbotz
            sleep 5
            formbotz-maintenance-off
```

Add secrets in GitHub repository settings:
- `SERVER_HOST`: Your server IP
- `SERVER_USER`: SSH username
- `SSH_PRIVATE_KEY`: Private SSH key

---

## Monitoring & Logs

### PM2 Monitoring
```bash
# View logs
pm2 logs formbotz

# Monitor resources
pm2 monit

# View specific app info
pm2 info formbotz
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Application Logs
Next.js logs are captured by PM2:
```bash
pm2 logs formbotz --lines 100
```

---

## Performance Optimization

### 1. Enable Gzip Compression (Nginx)
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss text/javascript;
```

### 2. Add Browser Caching (Nginx)
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Optimize Next.js Build
```javascript
// next.config.ts
const config = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
};
```

---

## Security Checklist

- ✅ HTTPS enabled with valid SSL certificate
- ✅ Environment variables secured (not in git)
- ✅ MongoDB authentication enabled
- ✅ Firewall configured (UFW or iptables)
- ✅ SSH key-based authentication (disable password login)
- ✅ Regular security updates (`sudo apt update && sudo apt upgrade`)
- ✅ Rate limiting (consider adding)
- ✅ CSRF protection (enabled via NextAuth)
- ✅ Secure password hashing (bcryptjs with 10 rounds)

---

## Troubleshooting

### App Won't Start
```bash
# Check PM2 logs
pm2 logs formbotz --err

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart formbotz
```

### Nginx 502 Bad Gateway
```bash
# Check if Next.js is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Database Connection Errors
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

---

## Backup Strategy

### Database Backups
```bash
# Manual backup
mongodump --uri="mongodb://localhost:27017/formbotz" --out=/backups/$(date +%Y%m%d)

# Automated daily backups (cron)
0 2 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/formbotz" --out=/backups/$(date +\%Y\%m\%d) > /var/log/mongo-backup.log 2>&1
```

### Application Backups
```bash
# Backup .env and uploads
tar -czf /backups/formbotz-$(date +%Y%m%d).tar.gz /var/www/formbotz-nextjs/.env /var/www/formbotz-nextjs/public/uploads
```

---

## Scaling

### Horizontal Scaling (Multiple Instances)

Update `ecosystem.config.js`:
```javascript
instances: 'max', // or specific number like 4
exec_mode: 'cluster'
```

### Vertical Scaling (More Resources)

Upgrade server resources:
- 4GB RAM
- 2 vCPUs
- Faster SSD

### Load Balancing

Add multiple servers behind a load balancer:
- Nginx load balancing
- Cloudflare Load Balancing
- AWS ALB / DigitalOcean Load Balancer

---

## Related Guides

- [README](../README.md) - Getting started and overview
- [Database Schema](./database-schema.md) - Database structure
- [API Reference](./api-reference.md) - API endpoints
