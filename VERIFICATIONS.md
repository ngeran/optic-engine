# Optic Engine - Verification & Troubleshooting Guide

This document contains verification commands and troubleshooting steps for the Optic Engine project.

## Table of Contents
- [Container Status](#container-status)
- [Volume Mount Verification](#volume-mount-verification)
- [JSNAPy Verification](#jsnapy-verification)
- [API Endpoint Verification](#api-endpoint-verification)
- [Common Issues & Fixes](#common-issues--fixes)
- [General Troubleshooting Commands](#general-troubleshooting-commands)

---

## Container Status

### Check All Services
```bash
# Check running containers
docker-compose ps

# Expected output:
# NAME                               STATUS         PORTS
# optic-engine-automation-engine-1    Up X minutes
# optic-engine-backend-1              Up X minutes   0.0.0.0:8000->8000/tcp
```

### View Container Logs
```bash
# View all logs
docker-compose logs -f

# View backend logs
docker-compose logs -f backend

# View automation-engine logs
docker-compose logs -f automation-engine

# View last N lines
docker-compose logs backend --tail 50
```

---

## Volume Mount Verification

### Backend Container
```bash
# Check config directory
docker-compose exec backend ls -la /app/config

# Check snapshots directory
docker-compose exec backend ls -la /app/snapshots

# Check testfiles directory
docker-compose exec backend ls -la /app/testfiles

# Verify jsnapy.cfg is mounted
docker-compose exec backend cat /etc/jsnapy/jsnapy.cfg
```

### Automation-Engine Container
```bash
# Check config directory
docker-compose exec automation-engine ls -la /app/config

# Check snapshots directory
docker-compose exec automation-engine ls -la /app/snapshots

# Check testfiles directory
docker-compose exec automation-engine ls -la /app/testfiles

# Verify jsnapy.cfg is mounted
docker-compose exec automation-engine cat /etc/jsnapy/jsnapy.cfg
```

### Expected Directory Contents

**config/**:
- `devices.yml` - Device connection credentials
- `snap_config.yaml` - JSNAPy snapshot configuration

**snapshots/**:
- XML snapshot files (e.g., `127.0.0.1_pre_show_version.xml`)

**testfiles/**:
- YAML test definitions (e.g., `junos_version.yml`, `test_bgp.yml`, `test_interfaces.yml`)

---

## JSNAPy Verification

### Check JSNAPy Installation
```bash
# Verify JSNAPy is installed in automation-engine
docker-compose exec automation-engine jsnapy --version

# Expected output: JSNAPy version: 1.3.8
```

### Verify JSNAPy Configuration
```bash
# Check JSNAPy config location
docker-compose exec automation-engine cat /etc/jsnapy/jsnapy.cfg

# Expected content:
# [DEFAULT]
# config_file_path = /app/config
# snapshot_path = /app/snapshots
# test_file_path = /app/testfiles
# workdir = /app/testfiles
```

### Verify JSNAPy Logging Configuration
```bash
# Check logging.yml is in place
docker-compose exec automation-engine ls -la /root/.jsnapy/

# Should contain logging.yml
```

### Manual JSNAPy Commands
```bash
# Run a pre snapshot manually
docker-compose exec automation-engine jsnapy --snap pre -f /app/config/snap_config.yaml

# Run a post snapshot manually
docker-compose exec automation-engine jsnapy --snap post -f /app/config/snap_config.yaml

# Compare snapshots
docker-compose exec automation-engine jsnapy --check /app/config/snap_config.yaml
```

---

## API Endpoint Verification

### Health Check
```bash
# Test health endpoint
curl -s http://localhost:8000/health | python3 -m json.tool

# Expected output:
# {
#     "status": "healthy",
#     "timestamp": "2026-02-14T15:41:02.977268"
# }
```

### Root Endpoint
```bash
# Test root endpoint
curl -s http://localhost:8000/ | python3 -m json.tool

# Expected output:
# {
#     "name": "Optic Engine API",
#     "version": "1.0.0",
#     "status": "running"
# }
```

### API Documentation
```bash
# Access interactive API documentation
# Browser: http://localhost:8000/docs
# Alternative: http://localhost:8000/redoc
```

### Snapshot Endpoints (REST)
```bash
# Trigger pre snapshot
curl -X POST http://localhost:8000/run-snapshot/pre

# Trigger post snapshot
curl -X POST http://localhost:8000/run-snapshot/post

# With device overrides
curl -X POST http://localhost:8000/run-snapshot/pre \
  -H "Content-Type: application/json" \
  -d '{"device": "192.168.1.1", "username": "admin", "password": "pass"}'
```

### Check Endpoint (REST)
```bash
# Run comparison check
curl -X POST http://localhost:8000/run-check
```

---

## Common Issues & Fixes

### Issue 1: JSNAPy ModuleNotFoundError
**Symptom**: `ModuleNotFoundError: No module named 'backend.core'`

**Cause**: Incorrect PYTHONPATH or import paths

**Fix**:
1. Check PYTHONPATH in docker-compose.yaml:
   ```bash
   grep PYTHONPATH docker-compose.yaml
   # Should be: PYTHONPATH=/app
   ```

2. Use absolute imports in Python files:
   ```python
   # Correct:
   from backend.app.core.config import settings

   # Incorrect (relative):
   from ....core.config import settings
   ```

### Issue 2: JSNAPy FileNotFoundError: logging.yml
**Symptom**: `FileNotFoundError: Could not locate logging.yml`

**Cause**: JSNAPy expects logging.yml in known locations

**Fix**:
1. Copy logging.yml to container:
   ```bash
   docker-compose exec automation-engine mkdir -p /root/.jsnapy
   docker-compose exec automation-engine cp /app/testfiles/logging.yml /root/.jsnapy/
   ```

2. Or update Dockerfile to copy during build:
   ```dockerfile
   COPY testfiles/logging.yml /tmp/logging.yml
   RUN mkdir -p /root/.jsnapy && \
       cp /tmp/logging.yml /root/.jsnapy/ && \
       rm /tmp/logging.yml
   ```

### Issue 3: Python 3.9 Type Hint Errors
**Symptom**: `TypeError: unsupported operand type(s) for |: 'ModelMetaclass' and 'ModelMetaclass'`

**Cause**: Using Python 3.10+ union syntax (`X | Y`) in Python 3.9

**Fix**:
1. Use `Union` from typing module:
   ```python
   # Correct for Python 3.9:
   from typing import Union
   def func(x: Union[str, int]):

   # Incorrect (Python 3.10+ only):
   def func(x: str | int):
   ```

2. Use `Dict` instead of `dict` for type hints:
   ```python
   # Correct:
   from typing import Dict
   x: Dict[str, Any]

   # Incorrect:
   x: dict[str, Any]
   ```

### Issue 4: Backend Container Not Starting
**Symptom**: Container exits immediately or won't start

**Troubleshooting**:
```bash
# Check container logs
docker-compose logs backend --tail 100

# Check if port 8000 is already in use
sudo lsof -i :8000

# Rebuild container
docker-compose down
docker-compose build backend
docker-compose up -d
```

### Issue 5: Cannot Connect to Juniper Device
**Symptom**: Authentication failed or Connection timeout

**Troubleshooting**:
```bash
# Verify device is reachable from container
docker-compose exec automation-engine ping <device-ip>

# Verify NETCONF port (830) is accessible
docker-compose exec automation-engine nc -zv <device-ip> 830

# Check credentials in .env file
cat .env | grep JNOS_

# Test SSH connection manually
docker-compose exec automation-engine ssh -p 830 <username>@<device-ip>
```

---

## General Troubleshooting Commands

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart automation-engine

# Full rebuild and restart
docker-compose down
docker-compose up --build -d
```

### Enter Container for Debugging
```bash
# Enter backend container
docker-compose exec backend bash

# Enter automation-engine container
docker-compose exec automation-engine bash

# Run command in container
docker-compose exec backend python3 -c "import backend.app.core.config; print('OK')"
```

### Check Python Environment
```bash
# List installed Python packages
docker-compose exec backend pip list

# Check Python version
docker-compose exec backend python3 --version

# Verify imports
docker-compose exec backend python3 -c "from backend.app.main import app; print('OK')"
```

### Monitor Resource Usage
```bash
# Check container resource usage
docker stats

# Check disk usage
docker-compose exec backend df -h

# Check memory usage
docker-compose exec backend free -h
```

### Clean Up
```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes (CAUTION: may delete data)
docker volume prune -f

# Full reset (CAUTION: deletes all data)
docker-compose down -v
docker system prune -a -f
```

---

## Verification Checklist

Use this checklist after making changes to the system:

- [ ] Both containers are running (`docker-compose ps`)
- [ ] Backend API responds to health check (`curl http://localhost:8000/health`)
- [ ] Config directory is accessible in both containers
- [ ] Snapshots directory is accessible in both containers
- [ ] Testfiles directory is accessible in both containers
- [ ] JSNAPy is installed and accessible (`jsnapy --version`)
- [ ] JSNAPy config file is mounted correctly (`cat /etc/jsnapy/jsnapy.cfg`)
- [ ] Logging.yml is present (`ls /root/.jsnapy/`)
- [ ] API documentation is accessible (http://localhost:8000/docs)

---

## Quick Verification Command

Run this single command to verify all critical components:
```bash
echo "=== Container Status ===" && \
docker-compose ps && \
echo -e "\n=== Backend Health ===" && \
curl -s http://localhost:8000/health | python3 -m json.tool && \
echo -e "\n=== Backend Directories ===" && \
docker-compose exec backend ls -la /app/config && \
docker-compose exec backend ls -la /app/snapshots | head -5 && \
docker-compose exec backend ls -la /app/testfiles && \
echo -e "\n=== JSNAPy Version ===" && \
docker-compose exec automation-engine jsnapy --version
```

---

## Log Files

### Backend Logs
- Container stdout: `docker-compose logs backend`
- Application logs: `/app/logs/` (if configured)
- Uvicorn access logs: Included in container logs

### Automation-Engine Logs
- Container stdout: `docker-compose logs automation-engine`
- JSNAPy logs: `/var/log/jsnapy.log` (inside container)

### Host System Logs
- Docker daemon: `journalctl -u docker`
- Docker Compose: Check during startup

---

## Manual Test Execution

### Test 1: BGP Summary Check (2026-02-14)

**Device**: 172.27.200.200
**Test file**: test_bgp.yml
**Credentials**: admin / manolis1

#### Pre Snapshot
```bash
docker-compose exec automation-engine jsnapy --snap pre -f /app/config/snap_config.yaml -v
```
**Result**: ✅ Success

#### Post Snapshot
```bash
docker-compose exec automation-engine jsnapy --snap post -f /app/config/snap_config.yaml -v
```
**Result**: ✅ Success

#### Check Comparison
```bash
docker-compose exec automation-engine jsnapy --check pre post -f /app/config/snap_config.yaml -v
```
**Result**: ✅ All tests passed
- Total tests passed: 2
- Total tests failed: 0

**Tests Run**:
1. `no-diff: flap-count` - Verify BGP peer didn't flap ✅
2. `is-equal: down-peer-count, 0` - Verify no BGP peers are down ✅

**Snapshots Created**:
- `/app/snapshots/172.27.200.200_pre_show_bgp_summary.xml`
- `/app/snapshots/172.27.200.200_post_show_bgp_summary.xml`

---

Last updated: 2026-02-14
