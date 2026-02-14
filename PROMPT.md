# 🔬 OPTIC ENGINE - Master Build Prompt

Build a production-ready network automation platform called **Optic Engine** - a modern web UI wrapper for Juniper JSNAPy (Snapshot Administrator) that enables real-time network validation and change verification with WebSocket streaming.

---

## 🎯 PROJECT OVERVIEW

**Optic Engine** enables network engineers to:
- Capture pre/post-change snapshots of Juniper devices (MX/EX/QFX/PTX/SRX)
- Compare device states through an intuitive web interface
- Validate network configurations with real-time log streaming
- Automate network testing and verification workflows

**Key Differentiator**: Real-time WebSocket streaming of JSNAPy execution logs to the browser, providing live feedback during network operations.

---

## 🏗️ ARCHITECTURE REQUIREMENTS

### System Design Philosophy
- **Microservices Architecture**: NOT monolithic - each component independently deployable
- **Stateless Container Execution**: Docker container receives configs via volumes, executes JSNAPy, writes results back
- **Real-time Communication**: WebSocket primary, REST API for compatibility
- **Dynamic Configuration**: Generate JSNAPy configs on-demand from environment variables
- **Modular & Reusable**: Shared libraries/utilities across services
- **Scalability**: Support multiple concurrent test executions

### High-Level Architecture Flow

```
Browser (React UI)
    ↕ WebSocket (real-time logs) + REST API
FastAPI Backend (Stateless API Layer)
    ↕ Docker volume mounts + subprocess execution
Docker Container (Python 3.9 + JSNAPy + PyEZ)
    ↕ SSH/NETCONF (port 830)
Juniper Devices (Network Equipment)
```

---

## 💻 TECHNOLOGY STACK

### Frontend Stack
```yaml
Framework: React 19
Build Tool: Vite 7
Language: TypeScript 5.x
Styling: Tailwind CSS 4.x
UI Components: shadcn/ui (pre-configured)
State Management: Zustand (lightweight, no Redux)
Server State: React Query (TanStack Query)
HTTP Client: Fetch API with custom wrapper
WebSocket: Native WebSocket API
Theme: Dark/Light mode with system detection
Icons: Lucide React
Code Editor: Monaco Editor (for YAML editing)
```

### Backend Stack
```yaml
Framework: FastAPI (async/await)
Language: Python 3.9+
Server: Uvicorn (ASGI)
WebSocket: Native FastAPI WebSocket
Validation: Pydantic v2
Testing Tool: JSNAPy (Juniper Snapshot Administrator)
Device Library: Juniper PyEZ
Config Format: YAML (JSNAPy native)
Process Management: subprocess with real-time streaming
Environment: python-dotenv
```

### Infrastructure Stack
```yaml
Containerization: Docker + Docker Compose
Base Image: python:3.9-slim
Network Mode: host (direct device access)
Volume Strategy: Bind mounts for config/snapshots/testfiles
Orchestration: Docker Compose (dev/production)
```

### Data Persistence (Future Phase)
```yaml
Database: PostgreSQL 15+ (test history, results)
Cache/Queue: Redis 7+ (WebSocket state, task queue)
Task Queue: Celery or Dramatiq (async long-running tests)
ORM: SQLAlchemy 2.0 (async)
```

---

## 📁 PROJECT STRUCTURE

```
optic-engine/
├── frontend/                          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── dialog.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx         # Top nav with theme toggle
│   │   │   │   ├── Sidebar.tsx        # Navigation menu
│   │   │   │   └── Footer.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── MetricsCard.tsx    # Stats display
│   │   │   │   ├── RecentTests.tsx    # Recent executions
│   │   │   │   └── QuickActions.tsx   # Action buttons
│   │   │   ├── devices/
│   │   │   │   ├── DeviceList.tsx     # Table of devices
│   │   │   │   ├── DeviceForm.tsx     # Add/Edit form
│   │   │   │   ├── DeviceCard.tsx     # Device status card
│   │   │   │   └── ConnectionTest.tsx # Test connectivity
│   │   │   ├── snapshots/
│   │   │   │   ├── SnapshotTrigger.tsx   # Pre/Post buttons
│   │   │   │   ├── SnapshotHistory.tsx   # List snapshots
│   │   │   │   └── SnapshotViewer.tsx    # View XML snapshot
│   │   │   ├── tests/
│   │   │   │   ├── TestExecutor.tsx      # Execution interface
│   │   │   │   ├── TestBuilder.tsx       # YAML editor
│   │   │   │   ├── TestResults.tsx       # Results display
│   │   │   │   ├── LogViewer.tsx         # Real-time logs
│   │   │   │   └── ProgressBar.tsx       # Execution progress
│   │   │   └── common/
│   │   │       ├── ThemeToggle.tsx       # Dark/light switch
│   │   │       ├── StatusIndicator.tsx   # Connection status
│   │   │       └── ErrorBoundary.tsx     # Error handling
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts           # WebSocket hook
│   │   │   ├── useDevices.ts             # Device management
│   │   │   ├── useSnapshots.ts           # Snapshot operations
│   │   │   ├── useTheme.ts               # Theme management
│   │   │   └── useToast.ts               # Toast notifications
│   │   ├── stores/
│   │   │   ├── useDeviceStore.ts         # Device state
│   │   │   ├── useTestStore.ts           # Test execution state
│   │   │   └── useUIStore.ts             # UI state (sidebar, theme)
│   │   ├── services/
│   │   │   ├── api.ts                    # REST API client
│   │   │   ├── websocket.ts              # WebSocket client
│   │   │   └── storage.ts                # LocalStorage wrapper
│   │   ├── types/
│   │   │   ├── device.ts                 # Device interfaces
│   │   │   ├── snapshot.ts               # Snapshot interfaces
│   │   │   ├── test.ts                   # Test interfaces
│   │   │   └── websocket.ts              # WebSocket message types
│   │   ├── utils/
│   │   │   ├── formatters.ts             # Date/time/status formatters
│   │   │   ├── validators.ts             # Form validation
│   │   │   └── constants.ts              # App constants
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx             # Main dashboard
│   │   │   ├── Devices.tsx               # Device management
│   │   │   ├── Snapshots.tsx             # Snapshot operations
│   │   │   ├── Tests.tsx                 # Test execution
│   │   │   └── History.tsx               # Test history
│   │   ├── App.tsx                       # Root component + routing
│   │   ├── main.tsx                      # React entry point
│   │   └── index.css                     # Global styles + Tailwind
│   ├── public/                           # Static assets
│   ├── .env.example                      # Frontend env template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── backend/                              # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── health.py             # Health checks
│   │   │   │   ├── devices.py            # Device CRUD
│   │   │   │   ├── snapshots.py          # Snapshot operations
│   │   │   │   ├── tests.py              # Test execution
│   │   │   │   └── websocket.py          # WebSocket handler
│   │   │   └── dependencies.py           # Shared dependencies
│   │   ├── core/
│   │   │   ├── config.py                 # Settings (Pydantic BaseSettings)
│   │   │   ├── logging.py                # Logging configuration
│   │   │   └── exceptions.py             # Custom exceptions
│   │   ├── models/                       # SQLAlchemy models (future)
│   │   │   ├── device.py
│   │   │   ├── snapshot.py
│   │   │   └── test_execution.py
│   │   ├── schemas/                      # Pydantic schemas
│   │   │   ├── device.py                 # DeviceCreate, DeviceResponse
│   │   │   ├── snapshot.py               # SnapshotRequest, SnapshotResponse
│   │   │   ├── test.py                   # TestRequest, TestResponse
│   │   │   └── websocket.py              # WebSocket message schemas
│   │   ├── services/
│   │   │   ├── jsnapy_service.py         # JSNAPy wrapper
│   │   │   ├── config_generator.py       # Generate snap_config.yaml
│   │   │   ├── device_service.py         # Device operations
│   │   │   ├── snapshot_service.py       # Snapshot logic
│   │   │   └── websocket_manager.py      # WebSocket connection manager
│   │   ├── utils/
│   │   │   ├── subprocess_runner.py      # Execute with streaming
│   │   │   ├── file_manager.py           # File operations
│   │   │   └── validators.py             # Input validation
│   │   └── main.py                       # FastAPI app initialization
│   ├── requirements.txt                  # Python dependencies
│   └── .env.example                      # Backend env template
│
├── config/                               # JSNAPy device configs (generated)
│   └── .gitkeep                          # Ignore contents, keep folder
│
├── snapshots/                            # Generated XML snapshots
│   └── .gitkeep
│
├── testfiles/                            # JSNAPy test definitions
│   ├── test_version.yaml                 # Software version check
│   ├── test_interfaces.yaml              # Interface status check
│   ├── test_bgp.yaml                     # BGP session check
│   └── test_ospf.yaml                    # OSPF adjacency check
│
├── docker/                               # Docker configuration
│   └── Dockerfile                        # Container build instructions
│
├── jsnapy_data/                          # JSNAPy configuration files
│   ├── jsnapy.cfg                        # JSNAPy paths config
│   └── logging.yml                       # JSNAPy logging config
│
├── docker-compose.yaml                   # Service orchestration
├── .env.example                          # Root env template
├── .gitignore
├── README.md                             # Main documentation
└── ARCHITECTURE.md                       # Architecture guide
```

---

## 🔌 API SPECIFICATION

### REST Endpoints

#### Health & Info
```http
GET /health
Response: {"status": "healthy", "timestamp": "2026-02-14T10:00:00"}

GET /
Response: {"name": "Optic Engine API", "version": "1.0.0", "status": "running"}
```

#### Device Management (Future Phase 2)
```http
GET    /api/v1/devices
POST   /api/v1/devices
GET    /api/v1/devices/{id}
PUT    /api/v1/devices/{id}
DELETE /api/v1/devices/{id}
POST   /api/v1/devices/{id}/test-connection
```

#### Snapshot Operations
```http
POST /run-snapshot/pre
POST /run-snapshot/post

Request Body (optional):
{
  "device": "192.168.1.1",
  "username": "admin",
  "password": "password"
}

Response:
{
  "status": "success",
  "message": "PRE snapshot completed successfully",
  "data": "...",
  "timestamp": "2026-02-14T10:00:00"
}
```

#### Test Execution
```http
POST /run-check

Response:
{
  "status": "success",
  "message": "Check completed",
  "data": "PASS/FAIL details...",
  "timestamp": "2026-02-14T10:00:00"
}
```

#### Test Management (Future Phase 2)
```http
GET  /api/v1/tests/templates        # List test templates
POST /api/v1/tests/validate         # Validate YAML syntax
GET  /api/v1/tests/history          # Execution history
GET  /api/v1/tests/{id}/results     # Detailed results
```

### WebSocket Protocol

#### Connection
```
ws://localhost:8000/ws/snapshot
```

#### Client → Server Messages
```typescript
// Snapshot operation
{
  "action": "snapshot",
  "task_type": "pre" | "post",
  "device"?: "192.168.1.1",      // Optional override
  "username"?: "admin",           // Optional override
  "password"?: "password"         // Optional override
}

// Test check operation
{
  "action": "check",
  "device"?: "192.168.1.1",
  "username"?: "admin",
  "password"?: "password"
}

// Cancel operation (future)
{
  "action": "cancel",
  "execution_id": "uuid"
}
```

#### Server → Client Messages
```typescript
// Connection established
{
  "type": "connected",
  "data": "WebSocket connected",
  "timestamp": "2026-02-14T10:00:00.000Z"
}

// Log output (real-time streaming)
{
  "type": "log",
  "data": "Connecting to device 192.168.1.1...",
  "timestamp": "2026-02-14T10:00:01.234Z"
}

// Status update
{
  "type": "status",
  "data": "Running test: test_software_version",
  "timestamp": "2026-02-14T10:00:02.456Z"
}

// Operation completed
{
  "type": "complete",
  "data": "Process completed successfully",
  "timestamp": "2026-02-14T10:00:05.789Z"
}

// Error occurred
{
  "type": "error",
  "data": "Connection timeout",
  "timestamp": "2026-02-14T10:00:03.111Z"
}

// Progress update (future)
{
  "type": "progress",
  "data": {
    "percent": 45,
    "current_device": "192.168.1.1",
    "total_devices": 5,
    "current_test": "test_bgp"
  },
  "timestamp": "2026-02-14T10:00:04.222Z"
}
```

---

## 🎨 UI/UX REQUIREMENTS

### Design System

#### Color Palette
```css
/* Light Mode */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--primary: 240 5.9% 10%;
--secondary: 240 4.8% 95.9%;
--accent: 240 4.8% 95.9%;
--destructive: 0 84.2% 60.2%;
--success: 142 76% 36%;
--warning: 38 92% 50%;

/* Dark Mode */
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--primary: 0 0% 98%;
--secondary: 240 3.7% 15.9%;
--accent: 240 3.7% 15.9%;
```

#### Typography
```css
Font Family: Inter (system-ui fallback)
Font Sizes: 
  - xs: 0.75rem
  - sm: 0.875rem
  - base: 1rem
  - lg: 1.125rem
  - xl: 1.25rem
  - 2xl: 1.5rem
```

### Key Screens

#### 1. Dashboard (Main Landing)
**Layout**: 
- Top: Header with logo, theme toggle, user menu
- Left: Sidebar navigation (collapsible)
- Center: Metrics cards (4 cards in grid)
  - Total Devices
  - Recent Tests (24h)
  - Success Rate
  - Active Snapshots
- Bottom Center: Recent Test Executions (table, last 10)
- Bottom Right: Quick Action Panel (Snapshot PRE/POST, Run Check buttons)

**Features**:
- Real-time status indicators
- Click metrics cards to drill down
- Quick snapshot/check actions
- Toast notifications for background operations

#### 2. Devices Page (Future Phase 2)
**Layout**:
- Top: Search bar + "Add Device" button
- Center: Device table with columns:
  - Status (green/red/yellow indicator)
  - Hostname
  - IP Address
  - Device Type (MX/EX/QFX/etc)
  - Last Contacted
  - Actions (Edit, Test, Delete)
- Right: Filters (Device Type, Status, Tags)

**Features**:
- Inline connection testing
- Bulk operations
- Export device list
- Connection status live updates

#### 3. Snapshots Page
**Layout**:
- Top: Large action buttons (Snapshot PRE, Snapshot POST)
- Center: Split view
  - Left: Snapshot history list (filterable by type/date)
  - Right: XML snapshot viewer (read-only)
- Bottom: Comparison tool (select 2 snapshots to diff)

**Features**:
- Real-time log streaming during snapshot
- Download snapshot as XML
- Visual diff viewer (side-by-side)
- Snapshot metadata (timestamp, device, test file used)

#### 4. Tests Page
**Layout**:
- Top: Tabs (Execute | Builder | History)
- **Execute Tab**:
  - Device selector (dropdown)
  - Test file selector (dropdown)
  - "Run Check" button (large, prominent)
  - Live log viewer (auto-scroll, searchable)
  - Progress indicator
  - Results summary (PASS/FAIL counts)
- **Builder Tab** (Future Phase 2):
  - Monaco YAML editor (left 60%)
  - Live validation panel (right 40%)
  - Template library (dropdown)
  - Save/Load buttons
- **History Tab**:
  - Execution history table
  - Filter by date range, device, result
  - Click row to view detailed results

**Features**:
- Real-time log streaming via WebSocket
- Copy logs to clipboard
- Download results as JSON
- Share execution URL

#### 5. History Page (Future Phase 2)
**Layout**:
- Top: Date range picker + filters (device, result, test type)
- Center: Paginated table of all test executions
- Click row → Modal with full details:
  - Execution metadata
  - Full logs
  - Test results breakdown
  - Snapshots used
  - Device info

**Features**:
- Export history to CSV
- Trends visualization (chart.js line graph)
- Searchable logs

### Theme System
- **Toggle**: Top-right corner of header (sun/moon icon)
- **Persistence**: localStorage key `optic-engine-theme`
- **Default**: System preference detection
- **Transition**: Smooth 200ms transition on toggle
- **Scope**: Entire app including modals, dropdowns, tooltips

### Responsive Design
- **Desktop**: Full layout (≥1024px)
- **Tablet**: Collapsed sidebar, stacked metrics (768px-1023px)
- **Mobile**: Bottom navigation, single column (≤767px)

---

## 🔧 IMPLEMENTATION PRIORITIES

### Phase 1: MVP (Current Focus)
**Goal**: Basic snapshot & check operations with real-time UI

✅ **Completed**:
- Docker container with JSNAPy + PyEZ
- FastAPI backend with WebSocket support
- React frontend with basic UI
- Real-time log streaming
- PRE/POST snapshot execution
- Check operation (compare snapshots)
- Dark/light mode toggle
- Environment-based configuration

🔨 **Remaining MVP Tasks**:
1. Improve error handling and user feedback
2. Add loading states and spinners
3. Implement proper toast notifications
4. Add snapshot history viewer (list snapshots folder)
5. Create results visualization (PASS/FAIL summary)
6. Polish UI components (consistent spacing, colors)
7. Add connection status indicator
8. Implement log search/filter
9. Create user documentation in UI
10. Add health check monitoring

### Phase 2: Enhanced Features
**Goal**: Device management, test builder, history database

1. **Device Management**:
   - PostgreSQL database setup
   - Device CRUD API endpoints
   - Device list UI with table
   - Device form (add/edit)
   - Connection testing
   - Credential encryption (Fernet or similar)

2. **Test Builder**:
   - Monaco editor integration
   - YAML syntax validation
   - Test template library (BGP, OSPF, Interfaces, etc.)
   - Save custom tests to database
   - Load tests from database

3. **History & Reporting**:
   - Store test executions in database
   - History page with filtering
   - Detailed results viewer
   - Export results (JSON, CSV)
   - Execution trends chart

4. **Multi-Device Support**:
   - Execute tests on multiple devices in parallel
   - Aggregated results view
   - Device group management
   - Bulk operations

### Phase 3: Advanced Features
**Goal**: Automation, scheduling, integrations

1. **Scheduling**:
   - Celery task queue setup
   - Schedule recurring tests (cron-like)
   - Pre-defined maintenance windows
   - Automated pre/post snapshots

2. **Notifications**:
   - Email alerts on failures
   - Slack/Teams webhooks
   - SMS notifications (Twilio)
   - Custom webhook destinations

3. **Advanced Testing**:
   - Test result assertions (expected values)
   - Custom Python test scripts
   - Integration with CI/CD pipelines
   - API-first testing (no UI required)

4. **Security & Access Control**:
   - User authentication (OAuth2/JWT)
   - Role-based access control (RBAC)
   - Audit logging
   - API rate limiting

5. **Advanced UI**:
   - Network topology visualization
   - Real-time device monitoring
   - Custom dashboards
   - Saved views and filters

---

## 🛠️ TECHNICAL IMPLEMENTATION DETAILS

### JSNAPy Integration

#### Config File Generation (Backend)
```python
# backend/app/services/config_generator.py

def generate_jsnapy_config(
    device_ip: str,
    username: str,
    password: str,
    test_file: str
) -> Path:
    """
    Generate snap_config.yaml dynamically from parameters.
    Returns path to generated config file.
    """
    config = {
        "hosts": [
            {
                "device": device_ip,
                "username": username,
                "passwd": password
            }
        ],
        "tests": [test_file]
    }
    
    config_path = Path("/app/config/snap_config.yaml")
    with open(config_path, "w") as f:
        yaml.dump(config, f)
    
    return config_path
```

#### Subprocess Execution with Streaming
```python
# backend/app/services/jsnapy_service.py

async def execute_jsnapy_command(
    command: List[str],
    websocket: WebSocket = None
) -> Tuple[str, int]:
    """
    Execute JSNAPy command and stream output to WebSocket.
    Returns (output, return_code).
    """
    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )
    
    output_lines = []
    async for line in process.stdout:
        decoded_line = line.decode().strip()
        output_lines.append(decoded_line)
        
        if websocket:
            await websocket.send_json({
                "type": "log",
                "data": decoded_line,
                "timestamp": datetime.utcnow().isoformat()
            })
    
    await process.wait()
    return "\n".join(output_lines), process.returncode
```

### WebSocket Connection Management

#### Backend WebSocket Manager
```python
# backend/app/services/websocket_manager.py

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
    
    async def send_message(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)

manager = ConnectionManager()
```

#### Frontend WebSocket Hook
```typescript
// frontend/src/hooks/useWebSocket.ts

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    wsRef.current = new WebSocket(url);
    
    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };
    
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };
    
    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, messages, sendMessage, disconnect };
}
```

### State Management (Zustand)

#### Test Execution Store
```typescript
// frontend/src/stores/useTestStore.ts

interface TestState {
  isExecuting: boolean;
  logs: LogEntry[];
  results: TestResults | null;
  error: string | null;
  
  startExecution: () => void;
  addLog: (log: LogEntry) => void;
  setResults: (results: TestResults) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  isExecuting: false,
  logs: [],
  results: null,
  error: null,
  
  startExecution: () => set({ isExecuting: true, logs: [], results: null, error: null }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setResults: (results) => set({ results, isExecuting: false }),
  setError: (error) => set({ error, isExecuting: false }),
  reset: () => set({ isExecuting: false, logs: [], results: null, error: null }),
}));
```

### Error Handling

#### Backend Error Response Format
```python
# backend/app/core/exceptions.py

class OpticEngineException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

@app.exception_handler(OpticEngineException)
async def optic_engine_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.message,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

#### Frontend Error Boundary
```typescript
// frontend/src/components/common/ErrorBoundary.tsx

export class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🔐 SECURITY CONSIDERATIONS

### Credential Management
1. **Environment Variables**: Never commit credentials to git
2. **Encryption**: Use Fernet or similar for database-stored credentials
3. **SSH Keys**: Prefer key-based auth over passwords (future feature)
4. **Secret Rotation**: Implement credential rotation policies
5. **Audit Logging**: Log all device access attempts

### API Security
1. **Authentication**: JWT tokens for API access (Phase 3)
2. **Authorization**: Role-based access control (Phase 3)
3. **Rate Limiting**: Prevent abuse with rate limits
4. **Input Validation**: Pydantic schemas for all inputs
5. **CORS**: Configure allowed origins properly

### Network Security
1. **HTTPS**: Use TLS certificates in production
2. **Firewall Rules**: Restrict backend to necessary ports only
3. **Network Isolation**: Separate management network if possible
4. **VPN**: Require VPN for device access

---

## 📦 DOCKER CONFIGURATION

### Dockerfile
```dockerfile
# docker/Dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy JSNAPy configuration
COPY jsnapy_data/jsnapy.cfg /etc/jsnapy/jsnapy.cfg
COPY jsnapy_data/logging.yml /etc/jsnapy/logging.yml

# Copy backend code
COPY backend/ /app/backend/

# Create required directories
RUN mkdir -p /app/config /app/snapshots /app/testfiles

# Expose port
EXPOSE 8000

# Run FastAPI server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### Docker Compose
```yaml
# docker-compose.yaml
version: '3.8'

services:
  optic-engine:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: optic-engine
    network_mode: host
    volumes:
      - ./config:/app/config
      - ./snapshots:/app/snapshots
      - ./testfiles:/app/testfiles
      - ./backend:/app/backend
    environment:
      - JNOS_DEVICE_IP=${JNOS_DEVICE_IP:-192.168.1.1}
      - JNOS_USERNAME=${JNOS_USERNAME:-admin}
      - JNOS_PASSWORD=${JNOS_PASSWORD:-admin123}
      - JNOS_TEST_FILE=${JNOS_TEST_FILE:-test_version.yaml}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Future: PostgreSQL database
  # postgres:
  #   image: postgres:15-alpine
  #   environment:
  #     POSTGRES_DB: optic_engine
  #     POSTGRES_USER: optic
  #     POSTGRES_PASSWORD: ${DB_PASSWORD}
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

  # Future: Redis cache
  # redis:
  #   image: redis:7-alpine
  #   ports:
  #     - "6379:6379"

# volumes:
#   postgres_data:
```

---

## 🧪 TESTING STRATEGY

### Backend Tests
```python
# backend/tests/test_jsnapy_service.py
import pytest
from app.services.jsnapy_service import JSNAPyService

@pytest.mark.asyncio
async def test_snapshot_execution():
    service = JSNAPyService()
    result = await service.run_snapshot("pre", "192.168.1.1", "admin", "password")
    assert result.status == "success"
    assert "snapshot" in result.data

@pytest.mark.asyncio
async def test_invalid_credentials():
    service = JSNAPyService()
    with pytest.raises(Exception):
        await service.run_snapshot("pre", "192.168.1.1", "wrong", "wrong")
```

### Frontend Tests
```typescript
// frontend/src/components/tests/TestExecutor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TestExecutor } from './TestExecutor';

describe('TestExecutor', () => {
  it('renders snapshot buttons', () => {
    render(<TestExecutor />);
    expect(screen.getByText('Snapshot PRE')).toBeInTheDocument();
    expect(screen.getByText('Snapshot POST')).toBeInTheDocument();
  });

  it('disables buttons during execution', async () => {
    render(<TestExecutor />);
    const preButton = screen.getByText('Snapshot PRE');
    fireEvent.click(preButton);
    expect(preButton).toBeDisabled();
  });
});
```

---

## 📚 DELIVERABLES CHECKLIST

### Phase 1 MVP Deliverables

#### Documentation
- [ ] README.md with quickstart guide
- [ ] ARCHITECTURE.md with system overview
- [ ] API.md with endpoint documentation
- [ ] CONTRIBUTING.md for developers
- [ ] .env.example files for all services

#### Backend
- [x] FastAPI application structure
- [x] WebSocket endpoint for real-time logs
- [x] REST endpoints for snapshot/check operations
- [x] JSNAPy service wrapper
- [x] Config file generator
- [x] Subprocess executor with streaming
- [ ] Comprehensive error handling
- [ ] Health check endpoints
- [ ] Logging configuration
- [ ] Input validation (Pydantic schemas)

#### Frontend
- [x] React app with Vite
- [x] Basic UI components (buttons, cards)
- [x] WebSocket client hook
- [x] Dark/light theme toggle
- [ ] Dashboard page (metrics, quick actions)
- [ ] Snapshots page (execute, view logs)
- [ ] Tests page (run check, view results)
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error boundary
- [ ] Responsive design

#### Infrastructure
- [x] Dockerfile for backend
- [x] Docker Compose configuration
- [x] Volume mounts for config/snapshots/testfiles
- [x] Environment variable setup
- [ ] Health checks
- [ ] Docker ignore files
- [ ] Multi-stage build optimization

#### Testing
- [ ] Backend unit tests (pytest)
- [ ] Frontend component tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright - optional)

---

## 🚀 DEPLOYMENT INSTRUCTIONS

### Local Development Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd optic-engine

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your device credentials

# 3. Create required directories
mkdir -p config snapshots testfiles

# 4. Copy test files
cp jsnapy_data/testfiles/* testfiles/

# 5. Start backend (Docker)
docker-compose up --build -d

# 6. Start frontend (Node.js)
cd frontend
npm install
npm run dev

# 7. Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Production Deployment

```bash
# 1. Build frontend for production
cd frontend
npm run build

# 2. Serve frontend with nginx/caddy
# Copy dist/ folder to web server

# 3. Run backend with production ASGI server
docker-compose -f docker-compose.prod.yaml up -d

# 4. Configure reverse proxy (nginx)
# Proxy /api/ and /ws/ to backend
# Serve frontend static files
```

---

## 🎯 SUCCESS CRITERIA

### MVP Success Criteria
1. ✅ User can trigger PRE snapshot via UI
2. ✅ User sees real-time logs during snapshot execution
3. ✅ User can trigger POST snapshot via UI
4. ✅ User can run comparison check (pre vs post)
5. ✅ User can see PASS/FAIL results
6. ✅ User can toggle dark/light theme
7. ⏳ UI is responsive and works on tablet/desktop
8. ⏳ Error messages are clear and actionable
9. ⏳ Logs are searchable and filterable
10. ⏳ Snapshots can be viewed and downloaded

### Quality Metrics
- **Performance**: Page load < 2 seconds
- **Reliability**: Snapshot success rate > 95%
- **UX**: Task completion time < 30 seconds
- **Accessibility**: WCAG 2.1 AA compliant
- **Security**: No credentials in logs or code

---

## 🆘 TROUBLESHOOTING GUIDE

### Issue: WebSocket Connection Fails
**Symptoms**: No real-time logs, connection status shows "Disconnected"
**Solutions**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check browser console for WebSocket errors
3. Ensure no firewall blocking WebSocket connections
4. Try REST API endpoints as fallback

### Issue: Snapshot Fails with Timeout
**Symptoms**: Error message "Connection timeout" or "Authentication failed"
**Solutions**:
1. Verify device IP is reachable: `ping <device_ip>`
2. Test SSH access manually: `ssh admin@<device_ip>`
3. Check credentials in .env file
4. Ensure device has NETCONF enabled: `set system services netconf ssh`
5. Check Docker network mode is `host` in docker-compose.yaml

### Issue: Frontend Build Fails
**Symptoms**: TypeScript errors during `npm run build`
**Solutions**:
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check Node.js version (requires v18+): `node --version`
3. Update dependencies: `npm update`
4. Check for TypeScript errors: `npx tsc --noEmit`

### Issue: Snapshot Files Not Appearing
**Symptoms**: No XML files in snapshots/ folder
**Solutions**:
1. Check Docker volume mounts: `docker-compose config`
2. Verify permissions: `chmod -R 755 snapshots/`
3. Check JSNAPy logs: `docker-compose logs optic-engine | grep jsnapy`
4. Manually run JSNAPy: `docker-compose exec optic-engine jsnapy --snap pre -f /app/config/snap_config.yaml`

---

## 🔮 FUTURE ENHANCEMENTS (Post-MVP)

### Scalability
- Kubernetes deployment manifests
- Horizontal scaling with load balancer
- Redis-backed WebSocket message queue
- Celery distributed task queue

### Observability
- Prometheus metrics export
- Grafana dashboards
- Distributed tracing (OpenTelemetry)
- Centralized logging (ELK stack)

### Advanced Features
- Network topology auto-discovery
- Device configuration backup/restore
- Compliance checking (PCI, HIPAA, etc.)
- Integration with ServiceNow/JIRA
- Mobile app (React Native)
- GraphQL API option

---

## 📝 FINAL NOTES FOR CLAUDE

### Key Implementation Priorities
1. **Start with backend stability**: Ensure WebSocket streaming works reliably
2. **Polish the UI**: Focus on UX - clear feedback, good error messages
3. **Add proper error handling**: Catch all exceptions, display user-friendly messages
4. **Implement loading states**: Show spinners/progress during operations
5. **Create toast notifications**: Non-intrusive feedback for background operations

### Code Quality Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Python**: Type hints on all functions, docstrings required
- **Linting**: ESLint + Prettier (frontend), Black + isort (backend)
- **Testing**: Minimum 70% code coverage
- **Documentation**: JSDoc/docstrings for all public APIs

### Important Considerations
- **Real-time is critical**: WebSocket streaming is the core feature
- **Device security**: Handle credentials carefully, never log them
- **User feedback**: Every action needs visual feedback
- **Error recovery**: Graceful degradation when things fail
- **Performance**: Keep UI responsive during long operations

### Don't Overcomplicate MVP
- Skip database initially (use file system)
- Skip authentication initially (add in Phase 3)
- Skip multi-device initially (single device mode)
- Skip scheduling initially (manual execution only)
- Focus on core workflow: Snapshot → Compare → Validate

---

## ✅ IMPLEMENTATION APPROACH

1. **Read the frontend-design skill** first for UI best practices
2. **Create file structure** exactly as specified above
3. **Implement backend first**: FastAPI + WebSocket + JSNAPy integration
4. **Test backend independently**: Use curl/websocat to verify
5. **Implement frontend**: React components + WebSocket client
6. **Integrate frontend & backend**: Ensure real-time updates work
7. **Polish UI**: Add loading states, errors, notifications
8. **Write documentation**: README, architecture guide, API docs
9. **Create deployment config**: Docker Compose, env examples

---

**START HERE**: Begin by setting up the FastAPI backend with WebSocket support and JSNAPy integration. Once the backend reliably streams logs and executes snapshots, move to the React frontend with real-time log display. Focus on the core workflow (PRE → POST → CHECK) before adding nice-to-have features.

Good luck! 🚀
