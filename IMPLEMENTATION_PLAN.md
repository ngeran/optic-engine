# Optic Engine - Implementation Plan

## Current State Assessment

### ✅ Completed

#### Frontend (React + Vite + TypeScript)
- [x] Project setup with Vite 7.3.1, React 19.2.0, TypeScript
- [x] Tailwind CSS v3.4.19 with custom "Core UI" color scheme
- [x] Theme system (dark/light mode toggle with localStorage persistence)
- [x] Layout components (Header, Sidebar, Footer, Main content)
- [x] Modern color palette:
  - Background: Pure black (#000000) dark mode
  - Accent: Vibrant cyan (#0891b2)
  - Semantic colors: Success, Warning, Error, Info
- [x] Lucide-react icons throughout
- [x] Responsive design with collapsible sidebar
- [x] Hover animations and transitions

#### Backend (FastAPI)
- [x] FastAPI application structure (`backend/app/main.py`)
- [x] Docker infrastructure (docker-compose.yaml, Dockerfile)
- [x] JSNAPy service wrapper (`jsnapy_service.py`)
- [x] WebSocket connection manager (`websocket_manager.py`)
- [x] API Routes:
  - `/` - Root endpoint with API info
  - `/run-snapshot/pre` - Pre-change snapshot endpoint
  - `/run-snapshot/post` - Post-change snapshot endpoint
  - `/run-check` - Compare pre/post snapshots
  - `/health` - Health check endpoint
- [x] WebSocket endpoint:
  - `/ws/snapshot` - Real-time log streaming
- [x] Subprocess runner for command execution
- [x] Config generator for dynamic JSNAPy configs
- [x] Pydantic schemas for request/response validation
- [x] CORS configuration for frontend (localhost:5173)
- [x] Docker containers running (backend + automation-engine)
- [x] JSNAPy test files available (5 test files)
- [x] Backend API accessible at http://localhost:8000

#### Infrastructure
- [x] Docker Compose configuration
- [x] Backend service (port 8000) - Running ✅
- [x] Automation-engine service (JSNAPy worker) - Running ✅
- [x] Frontend service (port 3000) - Configured
- [x] Volume mounts for config, snapshots, testfiles
- [x] Network mode: host for automation-engine (NETCONF access)
- [x] Environment variables configuration

---

## 🚧 Implementation Plan

### Phase 1: Frontend → Backend Integration

#### 1.1 API Client Library
**File**: `frontend/src/lib/api.ts`

```typescript
// Features needed:
- WebSocket connection management
- REST API client (fetch wrapper)
- Type definitions for API schemas
- Error handling
- Reconnection logic for WebSocket
```

**Tasks**:
- [ ] Create API client class
- [ ] Implement WebSocket connection with auto-reconnect
- [ ] Add REST methods: `runPreSnapshot()`, `runPostSnapshot()`, `runCheck()`
- [ ] Add TypeScript interfaces matching Pydantic schemas
- [ ] Implement error handling and retry logic

#### 1.2 WebSocket Log Viewer Component
**File**: `frontend/src/components/LogViewer.tsx`

```typescript
// Features needed:
- Real-time log streaming
- Auto-scroll to latest log
- Color-coded log levels (info, warning, error)
- Copy to clipboard
- Clear logs button
- Connection status indicator
```

**Tasks**:
- [ ] Create LogViewer component
- [ ] Implement WebSocket message handling
- [ ] Add log level parsing and styling
- [ ] Add auto-scroll toggle
- [ ] Add connection status badge

#### 1.3 Snapshot Operations UI
**Files**:
- `frontend/src/pages/Snapshots.tsx`
- `frontend/src/components/SnapshotForm.tsx`

```typescript
// Features needed:
- Device selector (dropdown)
- Test file selector (dropdown)
- Pre/Post snapshot buttons
- Real-time log output during operation
- Progress indicator
- Success/error toasts
```

**Tasks**:
- [ ] Create Snapshots page component
- [ ] Build SnapshotForm with device/test selectors
- [ ] Integrate WebSocket log viewer
- [ ] Add loading states and progress indicators
- [ ] Implement toast notifications for operations

#### 1.4 Comparison Results Viewer
**File**: `frontend/src/components/ComparisonResults.tsx`

```typescript
// Features needed:
- Parse JSNAPy check output
- Display PASS/FAIL for each test
- Show expected vs actual values
- Color-coded results (green/red)
- Expandable details for each test
- Summary statistics
```

**Tasks**:
- [ ] Create ComparisonResults component
- [ ] Implement JSNAPy output parser
- [ ] Display test results with icons (CheckCircle, XCircle)
- [ ] Add expandable test details
- [ ] Show pass/fail summary

---

### Phase 2: Enhanced Features

#### 2.1 Device Management
**Backend Tasks**:
- [ ] Add `GET /api/devices` endpoint (list devices)
- [ ] Add `POST /api/devices` endpoint (create device)
- [ ] Add `PUT /api/devices/{id}` endpoint (update device)
- [ ] Add `DELETE /api/devices/{id}` endpoint (delete device)
- [ ] Create device schema and service layer

**Frontend Tasks**:
- [ ] Create Devices page component
- [ ] Build device form (IP, username, password)
- [ ] Add device list table
- [ ] Implement edit/delete actions
- [ ] Add test connection button

#### 2.2 Test File Editor
**Frontend Tasks**:
- [ ] Integrate Monaco editor (VS Code editor)
- [ ] Create TestEditor component
- [ ] Add YAML syntax highlighting
- [ ] Implement save/delete test files
- [ ] Add validation for JSNAPy test format

#### 2.3 Snapshot History
**Backend Tasks**:
- [ ] Add `GET /api/snapshots` endpoint (list snapshots)
- [ ] Add `GET /api/snapshots/{id}` endpoint (get snapshot details)
- [ ] Add `DELETE /api/snapshots/{id}` endpoint (delete snapshot)
- [ ] Store snapshot metadata (XML file parsing)

**Frontend Tasks**:
- [ ] Create History page component
- [ ] Display snapshot list with timestamps
- [ ] Add snapshot comparison workflow
- [ ] Implement snapshot deletion
- [ ] Add date filtering

---

### Phase 3: Production Readiness

#### 3.1 Error Handling & Validation
- [ ] Add form validation (device IP format, credentials)
- [ ] Implement global error boundary
- [ ] Add API error toast notifications
- [ ] Validate JSNAPy test file format
- [ ] Add loading skeletons for better UX

#### 3.2 Testing
- [ ] Unit tests for API client
- [ ] Component tests for React components
- [ ] Integration tests for WebSocket flow
- [ ] E2E tests with Playwright

#### 3.3 Documentation
- [ ] User guide for running snapshots
- [ ] API documentation (auto-generated by FastAPI ✅)
- [ ] Deployment guide
- [ ] JSNAPy test file format guide

---

## 🎯 Priority Implementation Order

### Immediate (This Session)
1. **API Client Library** - Foundation for all backend communication
2. **WebSocket Log Viewer** - Required for real-time feedback
3. **Snapshot Operations UI** - Core feature (pre/post snapshots)
4. **Integration Testing** - Connect frontend to running backend

### Short-term (Next Sessions)
5. **Comparison Results Viewer** - Complete the snapshot workflow
6. **Device Management UI** - Add/edit/delete devices
7. **Test File Editor** - Create and modify JSNAPy tests
8. **Snapshot History** - Browse and compare past snapshots

### Long-term (Future)
9. **Authentication & Authorization**
10. **Scheduled Snapshots (Celery)**
11. **Notifications (Email/Slack)**
12. **Multi-device Operations**
13. **Snapshot Comparison Diff View**

---

## 🔧 Technical Notes

### Backend Architecture
```
FastAPI (backend/app)
├── main.py                    # App entry point
├── api/
│   └── routes/
│       ├── health.py           # Health check
│       ├── snapshots.py       # Snapshot endpoints
│       ├── tests.py          # Check/test endpoints
│       └── websocket.py     # WebSocket endpoint
├── core/
│   ├── config.py            # Settings (env vars)
│   ├── exceptions.py        # Custom exceptions
│   └── logging.py         # Logging setup
├── schemas/
│   ├── snapshot.py         # Snapshot schemas
│   ├── test.py            # Test schemas
│   └── websocket.py       # WebSocket schemas
├── services/
│   ├── jsnapy_service.py  # JSNAPy wrapper
│   ├── config_generator.py # Dynamic config
│   └── websocket_manager.py # Connection manager
└── utils/
    ├── subprocess_runner.py # Command execution
    └── file_manager.py    # File operations
```

### Docker Services
- **backend**: FastAPI on port 8000 (host)
- **automation-engine**: JSNAPy worker (host network mode)
- **frontend**: React dev server on port 3000 (when built)

### WebSocket Protocol
```typescript
// Client → Server
{
  "action": "snapshot" | "check",
  "task_type": "pre" | "post",  // Only for snapshot
  "device": string,              // Optional
  "username": string,            // Optional
  "password": string,            // Optional
  "test_file": string           // Optional
}

// Server → Client
{
  "type": "connected" | "log" | "status" | "complete" | "error",
  "data": string,
  "timestamp": ISO8601
}
```

---

## 📝 Next Steps

**Recommended**: Start with **Phase 1.1 (API Client Library)** to establish the foundation for frontend-backend communication.

Would you like me to proceed with implementing the API client and WebSocket integration?
