# Optic Engine - Server Deployment Guide

This guide provides step-by-step instructions for deploying Optic Engine to a server.

## 🖥️ Prerequisites

### Server Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / RHEL 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **CPU**: 2+ cores
- **Disk**: 10GB+ free space
- **Network**: Access to Juniper devices (SSH port 22, NETCONF port 830)

### Software Required

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version
```

## 📥 Deployment Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone git@github.com:ngeran/optic-engine.git
cd optic-engine

# Or if using HTTPS
# git clone https://github.com/ngeran/optic-engine.git
```

### Step 2: Configure Environment

```bash
# Create environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

**Required Changes:**
```bash
# Update with your device credentials
JNOS_DEVICE_IP=your-device-ip-here
JNOS_USERNAME=your-username
JNOS_PASSWORD=your-password
```

### Step 3: Configure Device Access (Optional)

If using inventory files:

```bash
# Create devices configuration
nano config/devices.yml
```

Example:
```yaml
default:
- device: 192.168.1.1
  username: admin
  passwd: your_password
```

### Step 4: Update URLs for Production

**If accessing from remote clients**, update `docker-compose.yaml`:

```yaml
frontend:
  environment:
    - VITE_API_BASE_URL=http://YOUR_SERVER_IP:8000
    - VITE_WS_BASE_URL=ws://YOUR_SERVER_IP:8000
```

**Replace `YOUR_SERVER_IP`** with your actual server IP or domain name.

### Step 5: Build and Start

```bash
# Build and start services
docker-compose up --build -d

# Check status
docker-compose ps
```

### Step 6: Configure Firewall

```bash
# Allow HTTP/HTTPS (if using reverse proxy)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application ports (if not using reverse proxy)
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend API

# Allow NETCONF and SSH for device connections
sudo ufw allow 830/tcp   # NETCONF
sudo ufw allow 22/tcp    # SSH

# Enable firewall
sudo ufw enable
```

### Step 7: Verify Deployment

```bash
# Check containers
docker-compose ps

# Check backend health
curl http://localhost:8000/health

# View logs
docker-compose logs -f
```

### Step 8: Access Application

Open browser and navigate to:

```
http://YOUR_SERVER_IP:3000
```

## 🌐 Production Configuration (Optional)

### Using nginx Reverse Proxy

**Recommended for production deployments**

#### Install nginx

```bash
sudo apt install nginx -y
```

#### Configure nginx

Create `/etc/nginx/sites-available/optic-engine`:

```nginx
# HTTP Redirect (optional - redirect to HTTPS)
server {
    listen 80;
    server_name your-domain.com;

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS with SSL
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

#### Enable site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/optic-engine /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

#### Obtain SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Update Environment for SSL

Update `docker-compose.yaml` frontend environment:

```yaml
frontend:
  environment:
    - VITE_API_BASE_URL=https://your-domain.com
    - VITE_WS_BASE_URL=wss://your-domain.com
```

Restart services:

```bash
docker-compose down
docker-compose up -d
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Docker Security

```bash
# Create docker group (if not exists)
sudo groupadd docker

# Add user to docker group
sudo usermod -aG docker your-username

# Configure docker daemon
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true,
  "userland-proxy": false
}
```

```bash
# Restart docker
sudo systemctl restart docker
```

### 3. System Updates

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. Fail2Ban (Optional)

```bash
# Install fail2ban
sudo apt install fail2ban -y

# Configure for nginx/SSH
sudo nano /etc/fail2ban/jail.local
```

## 📊 Monitoring

### Container Monitoring

```bash
# View container stats
docker stats

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f automation-engine
```

### Disk Space Monitoring

```bash
# Check disk usage
df -h

# Check docker space usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Log Rotation

Docker logs are configured in `daemon.json` (see Security section). For additional logging:

```bash
# View log size
du -sh /var/lib/docker/containers/*/*-json.log

# Manual rotation (if needed)
docker-compose restart
```

## 🔄 Updates and Maintenance

### Update Application

```bash
# Stop services
docker-compose down

# Pull latest changes
git pull origin main

# Rebuild and start
docker-compose up --build -d

# Verify
docker-compose ps
```

### Backup Configuration

```bash
# Backup configuration files
tar -czf optic-engine-config-$(date +%Y%m%d).tar.gz \
  .env \
  config/ \
  testfiles/ \
  inventories/ \
  jsnapy.cfg

# Copy to backup location
# scp optic-engine-config-*.tar.gz backup-server:/backups/
```

### Backup Snapshots

```bash
# Backup snapshots
tar -czf snapshots-$(date +%Y%m%d).tar.gz snapshots/

# Copy to backup location
# scp snapshots-*.tar.gz backup-server:/backups/
```

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check port conflicts
sudo netstat -tlnp | grep -E ':(3000|8000)'

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Cannot Access from Remote

```bash
# Check firewall
sudo ufw status

# Check docker is listening on all interfaces
sudo netstat -tlnp | grep docker

# Verify docker-compose bindings
grep -A5 "ports:" docker-compose.yaml
```

### Performance Issues

```bash
# Check resource usage
docker stats
htop

# Increase Docker resources (if needed)
# Edit /etc/docker/daemon.json
```

## 📝 Post-Deployment Checklist

- [ ] Application accessible at `http://SERVER_IP:3000`
- [ ] Backend API responding at `http://SERVER_IP:8000/health`
- [ ] Can connect to Juniper devices
- [ ] WebSocket connections working
- [ ] Test operations (PRE/POST/CHECK) successful
- [ ] Firewall configured correctly
- [ ] SSL/TLS configured (if using reverse proxy)
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation reviewed

## 🎯 Performance Tuning

### Increase Docker Resources

Edit `/etc/docker/daemon.json`:

```json
{
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 10,
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
```

### Optimize Database (Future)

When PostgreSQL is added, tune `postgresql.conf` based on available RAM.

## 📞 Support

For deployment issues:

1. Check logs: `docker-compose logs -f`
2. Review troubleshooting section in README.md
3. Check configuration files
4. Verify network connectivity to Juniper devices

---

**Last Updated**: February 2026
**Version**: 1.0.0
