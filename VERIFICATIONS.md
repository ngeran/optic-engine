# Optic Engine - Verification & Troubleshooting Guide

This document contains verification commands and troubleshooting steps for Optic Engine project.

---

## Quick Verification

**Run this single command to verify all critical components:**

```bash
echo "=== System Status ===" && \
docker-compose ps && \
echo -e "\n=== Backend Health ===" && \
curl -s http://localhost:8000/health | python3 -m json.tool && \
echo -e "\n=== JSNAPy Container ===" && \
docker-compose exec automation-engine jsnapy --version 2>&1 | head -5
```

---

## Table of Contents

- [Container Status](#container-status)
- [Volume Mount Verification](#volume-mount-verification)
- [JSNAPy Verification](#jsnapy-verification)
- [API Endpoint Verification](#api-endpoint-verification)
- [Backend API Testing](#backend-api-testing)
- [Common Issues & Fixes](#common-issues-fixes)
- [General Troubleshooting Commands](#general-troubleshooting-commands)
- [Quick Verification Commands](#quick-verification-commands)

---

## Container Status

### Check All Services
```bash
# Check running containers
docker-compose ps

# Expected output:
# NAME                       STATUS         PORTS
# optic-engine-backend-1      Up X minutes   0.0.0.0:8000->8000/tcp
# optic-engine-automation-engine-1   Up X minutes
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

---

## JSNAPy Verification

### Check JSNAPy Installation
```bash
# Verify JSNAPy is installed in automation-engine container
docker-compose exec automation-engine jsnapy --version

# Expected output:
# JSNAPy version 1.3.0
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
# Check if logging.yml exists in config directory
docker-compose exec automation-engine ls -la /app/config/logging.yml

# Check if logging.yml exists in jsnapy config directory
docker-compose exec automation-engine ls -la /etc/jsnapy/logging.yml

# If missing, copy from host:
docker cp config/logging.yml optic-engine-automation-engine-1:/etc/jsnapy/logging.yml
```

### Test JSNAPy Manually

**Test Configuration (snap_config.yaml):**
```yaml
hosts:
- device: 172.27.200.200
  passwd: manolis1
  username: admin
tests:
- test_bgp.yml
```

#### Pre Snapshot
```bash
# Run pre snapshot manually
docker-compose exec automation-engine jsnapy --snap pre -f /app/config/snap_config.yaml

# Expected: SUCCESS - Snapshot created
```

#### Post Snapshot
```bash
# Run post snapshot manually
docker-compose exec automation-engine jsnapy --snap post -f /app/config/snap_config.yaml

# Expected: SUCCESS - Snapshot created
```

#### Check Operation
```bash
# Compare pre and post snapshots
docker-compose exec automation-engine jsnapy --check pre post -f /app/config/snap_config.yaml -v

# Expected output:
# INFO: *** Device: 172.27.200.200 ***
# INFO: Tests Included: test_bgp.yml
# DEBUG: No tests are registered for operator: is_equal
# INFO: Total tests passed: 2
# INFO: Overall Tests passed!!!
```

---

## API Endpoint Verification

### Health Check
```bash
# Test backend health endpoint
curl -s http://localhost:8000/health | python3 -m json.tool

# Expected output:
# {"status":"healthy","timestamp":"2026-02-14T..."}
```

### Root Endpoint
```bash
# Test root endpoint
curl -s http://localhost:8000/ | python3 -m json.tool

# Expected output:
# {"name":"Optic Engine API","version":"1.0.0","status":"running"}
```

### Snapshot Endpoints
```bash
# List snapshots
curl -s http://localhost:8000/snapshots

# Run pre snapshot via API
curl -X POST http://localhost:8000/snapshots/pre \
  -H "Content-Type: application/json" \
  -d '{"device": "172.27.200.200", "username": "admin", "password": "manolis1"}'

# Run post snapshot via API
curl -X POST http://localhost:8000/snapshots/post \
  -H "Content-Type: application/json" \
  -d '{"device": "172.27.200.200", "username": "admin", "password": "manolis1"}'
```

---

## Backend API Testing

### Enter Backend Container
```bash
# For debugging or running Python commands
docker-compose exec backend bash
```

---

## Common Issues & Fixes

### Issue 1: JSNAPy FileNotFoundError: logging.yml

**Symptom:**
```
FileNotFoundError: Could not locate logging.yml
```

**Cause:**
JSNAPy's `setup_logging.setup_logging()` expects `logging.yml` in the same directory as `jsnapy.cfg` but the file is in `/app/config/`.

**Fix:**
```bash
# Copy logging.yml to jsnapy config directory
docker cp config/logging.yml optic-engine-automation-engine-1:/etc/jsnapy/logging.yml

# If permissions issues, use proper format:
# Must be valid YAML with version: 1
```

**Status:** ✅ Fixed and verified (2026-02-14)

---

### Issue 2: Python 3.10+ union syntax error

**Symptom:**
```
TypeError: unsupported operand type(s) for |: 'str' | 'int'
```

**Cause:**
Python 3.9+ changed `|` operator to require cast operands to same type.

**Fix:**
Use `or` in boolean expressions or explicitly cast types in Python 3.9+.

---

## General Troubleshooting Commands

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart automation-engine
```

### Rebuild Services
```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
```

### View Logs
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

### Clean Up
```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune -f
```

---

## Quick Verification Commands

**Run this single command to verify all critical components:**

```bash
echo "=== Quick Verify ===" && \
docker-compose ps && \
echo -e "\n=== Backend Health ===" && \
curl -s http://localhost:8000/health | python3 -m json.tool && \
echo -e "\n=== JSNAPy Version ===" && \
docker-compose exec automation-engine jsnapy --version 2>&1 | head -5
```
