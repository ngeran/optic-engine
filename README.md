# Optic Engine

**Optic Engine** is a modern web-based automation platform for Juniper JSNAPy (Snapshot Administrator). It provides an intuitive interface for capturing pre/post-change snapshots of network devices and validating configurations with real-time WebSocket log streaming.

![Optic Engine](https://img.shields.io/badge/JSNAPy-Automation-yellow?style=for-the-badge&logo=juniper-networks)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)
![React](https://img.shields.io/badge/React-19-cyan?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green?style=for-the-badge&logo=fastapi)

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Step-by-step server deployment instructions
- **[Validation Summary](VALIDATION_SUMMARY.md)** - Project validation and deployment checklist
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs (after starting)

## 🌟 Features

- **Real-time Updates**: Watch JSNAPy execution logs stream live via WebSocket
- **PRE/POST Snapshots**: Capture device states before and after network changes
- **Automated Comparisons**: Run tests to verify configuration changes
- **Test History**: Track all operations with detailed results and filtering
- **Device Management**: Connect to devices via manual entry or inventory files
- **Modern UI**: Clean, responsive interface with dark/light theme support
- **REST API**: Full API coverage for automation and scripting
- **WebSocket Streaming**: Live log updates during operations

## 📋 Prerequisites

Before installing Optic Engine, ensure you have the following:

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **Ports Available**:
  - `3000` - Frontend (React)
  - `8000` - Backend API (FastAPI)
  - `830` - NETCONF (for Juniper device connections)
  - `22` - SSH (for Juniper device connections)

### System Requirements

- **OS**: Linux, macOS, or Windows with WSL2
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Disk**: Minimum 5GB free space
- **Network**: Access to Juniper network devices

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url> optic-engine
cd optic-engine
```

### Step 2: Create Environment File

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```bash
# Device Configuration (replace with your actual device credentials)
JNOS_DEVICE_IP=192.168.1.1
JNOS_USERNAME=admin
JNOS_PASSWORD=your_password_here

# Test Configuration
JNOS_TEST_FILE=junos_version.yml
```

**⚠️ Security Note**: Never commit the `.env` file to version control. It contains sensitive credentials.

### Step 3: Configure Device Connections (Optional)

If using inventory files instead of manual device entry:

```bash
# Edit device configuration
nano config/devices.yml
```

Example `config/devices.yml`:

```yaml
default:
- device: 192.168.1.1
  username: admin
  passwd: your_password
```

### Step 4: Build and Start Services

```bash
# Build and start all services
docker-compose up --build -d

# Verify containers are running
docker-compose ps
```

Expected output:

```
NAME                               STATUS          PORTS
optic-engine-backend-1             Up              0.0.0.0:8000->8000/tcp
optic-engine-automation-engine-1   Up
optic-engine-frontend-1            Up              0.0.0.0:3000->3000/tcp
```

## ✅ Verification

### 1. Check Container Status

```bash
docker-compose ps
```

All three services should show "Up" status.

### 2. Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status": "healthy"}
```

### 3. Access the Web Interface

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the Optic Engine dashboard.

### 4. Verify API Documentation

Access the interactive API documentation:

```
http://localhost:8000/docs
```

### 5. Check Logs for Errors

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f automation-engine
```

### 6. Test WebSocket Connection

Open browser developer tools (F12) while on the dashboard and check the Network tab. Look for WebSocket connections to `ws://localhost:8000/ws`.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JNOS_DEVICE_IP` | Default Juniper device IP | `127.0.0.1` | No |
| `JNOS_USERNAME` | SSH username for device | `admin` | No |
| `JNOS_PASSWORD` | SSH password for device | `manolis1` | No |
| `JNOS_TEST_FILE` | Default test file | `test_version.yaml` | No |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_WS_BASE_URL` | WebSocket URL | `ws://localhost:8000` |

### Directory Structure

```
optic-engine/
├── backend/              # FastAPI backend application
├── frontend/             # React frontend application
├── config/              # JSNAPy configuration files
│   ├── devices.yml      # Device credentials
│   └── snap_config.yaml # Snapshot configuration
├── testfiles/           # JSNAPy test definitions
├── inventories/         # Device inventory files
├── snapshots/           # Generated snapshot files (gitignored)
├── jsnapy.cfg           # JSNAPy configuration
├── docker-compose.yaml  # Docker orchestration
├── Dockerfile           # Container image definition
└── .env.example         # Environment variables template
```

## 📖 Usage

### Quick Start

1. **Navigate to Operations**: Click "Operations" in the sidebar
2. **Select Connection Mode**: Choose "Manual Entry" or "From Inventory"
3. **Enter Device Credentials**: IP, username, password
4. **Select Tests**: Choose test files to run
5. **Run Operation**:
   - **PRE Snapshot**: Capture baseline state
   - **POST Snapshot**: Capture after changes
   - **CHECK**: Compare and validate

### Using the REST API

```bash
# PRE Snapshot
curl -X POST http://localhost:8000/api/snapshots/pre \
  -H "Content-Type: application/json" \
  -d '{
    "device_ip": "192.168.1.1",
    "username": "admin",
    "password": "password",
    "test_files": ["junos_version.yml"]
  }'

# POST Snapshot
curl -X POST http://localhost:8000/api/snapshots/post \
  -H "Content-Type: application/json" \
  -d '{
    "device_ip": "192.168.1.1",
    "username": "admin",
    "password": "password",
    "test_files": ["junos_version.yml"]
  }'

# CHECK Operation
curl -X POST http://localhost:8000/api/snapshots/check \
  -H "Content-Type: application/json" \
  -d '{
    "device_ip": "192.168.1.1",
    "username": "admin",
    "password": "password",
    "test_files": ["junos_version.yml"]
  }'
```

### Manual JSNAPy Testing

```bash
# Enter automation-engine container
docker-compose exec automation-engine bash

# Run PRE snapshot
jsnapy --snap pre -f /app/config/snap_config.yaml

# Run POST snapshot
jsnapy --snap post -f /app/config/snap_config.yaml

# Run CHECK
jsnapy --check /app/config/snap_config.yaml

# List snapshots
ls -la /app/snapshots/
```

## 🛠️ Management Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Rebuild Services

```bash
# Rebuild specific service
docker-compose up --build -d backend

# Rebuild all services
docker-compose up --build -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Update Code

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d
```

## 🔍 Troubleshooting

### Containers Not Starting

**Problem**: Services fail to start or restart loop

**Solution**:
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Port already in use - Change ports in docker-compose.yaml
# 2. Missing .env file - Create from .env.example
# 3. Permission issues - Check file permissions
```

### Cannot Connect to Device

**Problem**: "Connection failed" or "Authentication error"

**Solution**:
1. Verify device is reachable:
   ```bash
   ping <device-ip>
   telnet <device-ip> 830
   ```

2. Check credentials in `.env` or `config/devices.yml`

3. Verify NETCONF is enabled on the device:
   ```bash
   set system services netconf ssh
   commit
   ```

### Frontend Shows "Connection Refused"

**Problem**: API requests failing in browser

**Solution**:
1. Check backend is running:
   ```bash
   docker-compose ps backend
   curl http://localhost:8000/health
   ```

2. Verify CORS configuration in `backend/app/core/config.py`

3. Check browser console for specific errors

### WebSocket Not Connecting

**Problem**: No real-time logs appearing

**Solution**:
1. Check WebSocket URL in frontend environment variables

2. Verify backend WebSocket endpoint:
   ```bash
   curl -i -N \
     -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     http://localhost:8000/ws
   ```

3. Check firewall/proxy settings

### Storage Issues

**Problem**: Snapshots not saving or history not persisting

**Solution**:
1. Check volume mounts in docker-compose.yaml

2. Verify permissions:
   ```bash
   ls -la snapshots/
   chmod 755 snapshots/
   ```

3. Check localStorage in browser (History data)

## 🔒 Security Considerations

### Production Deployment

1. **Change Default Passwords**: Update all default credentials
2. **Use HTTPS**: Configure reverse proxy (nginx/traefik)
3. **Environment Variables**: Never commit `.env` file
4. **Network Isolation**: Use Docker networks
5. **Firewall Rules**: Restrict access to ports 3000 and 8000
6. **Authentication**: Add authentication middleware (future feature)

### Sensitive Files

Ensure these files are **NOT** in version control:
- `.env`
- `config/devices.yml`
- `config/snap_config.yaml` (if contains credentials)

Check `.gitignore` includes:
```
.env
config/devices.yml
config/snap_config.yaml
```

## 📚 Additional Resources

- **Documentation**: `http://localhost:3000/docs`
- **API Docs**: `http://localhost:8000/docs`
- **JSNAPy GitHub**: https://github.com/Juniper/jsnapy
- **Juniper PyEZ**: https://github.com/Juniper/py-junos-eznc

## 🤝 Support

For issues, questions, or contributions:

1. Check the inline documentation in the app
2. Review logs: `docker-compose logs -f`
3. Check troubleshooting section above
4. Review JSNAPy documentation for test file syntax

## 📝 License

This project is licensed under the MIT License.

## 🎯 Roadmap

- [ ] User Authentication (OAuth2/JWT)
- [ ] PostgreSQL Database for persistent storage
- [ ] Test Builder with Monaco Editor
- [ ] Scheduled Operations (Celery)
- [ ] Notifications (Email/Slack)
- [ ] Advanced Analytics Dashboard
- [ ] Multi-device Batch Operations
- [ ] Export Results (PDF/CSV)

---

**Version**: 1.0.0
**Last Updated**: February 2026
**Maintainer**: Your Team Name
