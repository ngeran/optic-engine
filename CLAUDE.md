# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Optic Engine** is a network automation platform serving as a modern web UI wrapper for Juniper JSNAPy (Snapshot Administrator). It enables network engineers to capture pre/post-change snapshots of Juniper devices, compare device states through an intuitive web interface, and validate network configurations with real-time WebSocket log streaming.

**Key Differentiator**: Real-time WebSocket streaming of JSNAPy execution logs to the browser, providing live feedback during network operations.

## Development Commands

### Docker Orchestration
```bash
# Build and start all services
docker-compose up --build -d

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f automation-engine

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose build backend
```

### Backend Development
```bash
# Backend runs in Docker container via uvicorn
# Access at: http://localhost:8000
# API docs: http://localhost:8000/docs

# Enter backend container for debugging
docker-compose exec backend bash

# Run Python tests (when implemented)
docker-compose exec backend pytest

# Format Python code
docker-compose exec backend black .
docker-compose exec backend isort .
```

### JSNAPy Operations
```bash
# Manually run JSNAPy snapshot (pre)
docker-compose exec automation-engine jsnapy --snap pre -f /app/config/snap_config.yaml

# Manually run JSNAPy snapshot (post)
docker-compose exec automation-engine jsnapy --snap post -f /app/config/snap_config.yaml

# Run JSNAPy check (compare pre/post)
docker-compose exec automation-engine jsnapy --check /app/config/snap_config.yaml

# List snapshots
docker-compose exec automation-engine ls -la /app/snapshots/
```

## Architecture

### System Flow
```
Browser (React UI - Future)
    ↕ WebSocket (real-time logs) + REST API
FastAPI Backend (Stateless API Layer - Future)
    ↕ Docker volume mounts + subprocess execution
Docker Container (Python 3.9 + JSNAPy + PyEZ)
    ↕ SSH/NETCONF (port 830)
Juniper Devices (Network Equipment)
```

### Docker Services

**backend** (FastAPI - Future):
- Port 8000 exposed to host
- Mounts: ./backend, ./config, ./snapshots, ./testfiles
- Runs: uvicorn main:app with --reload
- Currently: Planned, not yet implemented

**automation-engine** (JSNAPy Worker):
- Network mode: host (direct device access via NETCONF port 830)
- Mounts: Same volumes as backend
- Command: tail -f /dev/null (keeps container running)
- JSNAPy executed via docker exec from backend

### Key Directories

- **config/**: JSNAPy device and snapshot configuration files
  - `devices.yml`: Device definitions (ip, username, password)
  - `snap_config.yaml`: JSNAPy snapshot configuration (hosts + tests)
- **testfiles/**: JSNAPy test definitions (YAML format)
  - Example: `test_interfaces.yml`, `test_bgp.yml`, `junos_version.yml`
  - Define commands to run and assertions to validate
- **snapshots/**: Generated XML snapshots from JSNAPy
- **jsnapy.cfg**: JSNAPy configuration (paths, logging, working directory)

### Environment Variables

Set in `.env` file or docker-compose.yaml:
- `JNOS_DEVICE_IP`: Target Juniper device IP (default: 127.0.0.1)
- `JNOS_USERNAME`: SSH username (default: admin)
- `JNOS_PASSWORD`: SSH password (default: manolis1)
- `JNOS_TEST_FILE`: Test file to run (default: test_version.yaml)

### JSNAPy Configuration

**jsnapy.cfg** (mounted to /etc/jsnapy/jsnapy.cfg):
- `config_file_path`: /app/config
- `snapshot_path`: /app/snapshots
- `test_file_path`: /app/testfiles
- `workdir`: /app/testfiles
- Logging: DEBUG level to stdout

## Technology Stack

**Current Implementation**:
- Python 3.9-slim base image
- JSNAPy (Juniper Snapshot Administrator)
- PyEZ (Juniper PyEZ for device interaction)
- Docker + Docker Compose for orchestration

**Planned (Phase 1 MVP)**:
- Backend: FastAPI with WebSocket support
- Frontend: React 19 + Vite 7 + TypeScript
- Styling: Tailwind CSS 4.x + shadcn/ui
- State Management: Zustand
- Real-time: Native WebSocket API

## Current Implementation Status

**Completed**:
- Docker infrastructure (docker-compose.yaml, Dockerfile)
- JSNAPy configuration and test files
- Volume mounting setup for config/snapshots/testfiles
- Environment variable configuration

**Not Yet Implemented**:
- Backend FastAPI code (backend/ directory doesn't exist)
- Frontend React application
- WebSocket implementation
- API endpoints
- UI components
- Error handling and user feedback

## Common Development Tasks

### Running JSNAPy Manually
```bash
# 1. Ensure automation-engine container is running
docker-compose up -d automation-engine

# 2. Edit config/snap_config.yaml with target device and test

# 3. Execute snapshot
docker-compose exec automation-engine jsnapy --snap pre -f /app/config/snap_config.yaml

# 4. Make changes, then run post snapshot
docker-compose exec automation-engine jsnapy --snap post -f /app/config/snap_config.yaml

# 5. Compare snapshots
docker-compose exec automation-engine jsnapy --check /app/config/snap_config.yaml
```

### Creating New Test Files
1. Create YAML file in testfiles/ directory
2. Follow JSNAPy test format:
   ```yaml
   tests_include:
     - test_name

   test_name:
     - command: show <command>
       iterate:
         xpath: //xpath-expression
         id: 'unique-id'
         tests:
           - no-diff: field-name
             info: "Success message"
             err: "Failure message"
   ```
3. Reference in config/snap_config.yaml under `tests:` list

### Updating Device Configuration
Edit config/devices.yml:
```yaml
default:
- device: <device-ip>
  passwd: <password>
  username: <username>
```

Or edit config/snap_config.yaml for snapshot-specific configuration.

## Important Notes

- **Network Mode**: automation-engine uses `network_mode: host` for direct device access via NETCONF (port 830)
- **Docker Socket**: Both services mount /var/run/docker.sock for container control
- **JSNAPy Logging**: Uses inline logging from jsnapy.cfg, not logging.yml file
- **No Backend/Frontend Yet**: This is infrastructure-only phase - application code not yet written
- **Test File Format**: Must match JSNAPy YAML schema (see testfiles/ for examples)
- **Snapshot Storage**: XML files stored in snapshots/ directory

## Implementation Priorities

Per PROMPT.md (master build prompt):

**Phase 1 MVP** (Current Focus):
1. Implement FastAPI backend with WebSocket support
2. Create React frontend with basic UI
3. Implement real-time log streaming via WebSocket
4. Add PRE/POST snapshot execution endpoints
5. Create check operation endpoint (compare snapshots)
6. Add dark/light theme toggle

**Future Phases**:
- Phase 2: Device management (PostgreSQL), Test builder (Monaco editor), History tracking
- Phase 3: Scheduling (Celery), Notifications (email/Slack), Authentication (OAuth2/JWT)

See PROMPT.md for complete specifications including API endpoints, WebSocket protocol, UI requirements, and technical implementation details.
