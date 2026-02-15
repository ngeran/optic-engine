import { BookOpen, Play, Camera, GitCompare, Settings, History, AlertCircle, CheckCircle, Server, Database, FolderOpen, Zap, Cpu, Eye } from 'lucide-react'

export function Documentation() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="text-center space-y-4 pb-8 border-b border-accent">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <BookOpen className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Documentation</h1>
        </div>
        <p className="text-lg text-foreground opacity-70">
          Complete guide to using Optic Engine for JSNAPy automation
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-muted border border-accent rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Table of Contents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <a href="#overview" className="flex items-center space-x-2 text-primary hover:underline">
            <BookOpen className="w-4 h-4" />
            <span>Overview</span>
          </a>
          <a href="#getting-started" className="flex items-center space-x-2 text-primary hover:underline">
            <Zap className="w-4 h-4" />
            <span>Getting Started</span>
          </a>
          <a href="#operations" className="flex items-center space-x-2 text-primary hover:underline">
            <Play className="w-4 h-4" />
            <span>Running Operations</span>
          </a>
          <a href="#api-testing" className="flex items-center space-x-2 text-primary hover:underline">
            <Server className="w-4 h-4" />
            <span>API Testing</span>
          </a>
          <a href="#features" className="flex items-center space-x-2 text-primary hover:underline">
            <Cpu className="w-4 h-4" />
            <span>Features</span>
          </a>
          <a href="#history" className="flex items-center space-x-2 text-primary hover:underline">
            <History className="w-4 h-4" />
            <span>History</span>
          </a>
          <a href="#troubleshooting" className="flex items-center space-x-2 text-primary hover:underline">
            <AlertCircle className="w-4 h-4" />
            <span>Troubleshooting</span>
          </a>
        </div>
      </div>

      {/* Overview */}
      <section id="overview" className="bg-muted border border-accent rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">What is Optic Engine?</h2>
        <div className="space-y-4 text-foreground">
          <p>
            <strong className="text-primary">Optic Engine</strong> is a modern web-based automation platform for
            <a href="https://github.com/Juniper/jsnapy" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
              Juniper JSNAPy (Snapshot Administrator)
            </a>.
            It provides an intuitive interface for capturing pre and post-change snapshots of network devices and
            validating configurations with real-time WebSocket log streaming.
          </p>

          <div className="bg-background border border-accent rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">Key Features</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Real-time Updates:</strong> Watch JSNAPy execution logs stream live via WebSocket</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>PRE/POST Snapshots:</strong> Capture device states before and after network changes</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Automated Comparisons:</strong> Run tests to verify configuration changes</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Test History:</strong> Track all operations with detailed results</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Device Management:</strong> Connect to devices via manual entry or inventory files</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="bg-muted border border-accent rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Getting Started</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">1. Access the Application</h3>
            <p className="text-foreground opacity-70 mb-2">
              Open your browser and navigate to the Optic Engine application URL. The default is:
            </p>
            <div className="bg-background border border-accent rounded-lg p-3 font-mono text-sm">
              http://localhost:3000
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">2. Navigate to Operations</h3>
            <p className="text-foreground opacity-70">
              Click on <strong className="text-primary">Operations</strong> in the sidebar to access the main operations page.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">3. Choose Connection Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background border border-accent rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Manual Entry</h4>
                </div>
                <p className="text-sm text-foreground opacity-70">
                  Enter device credentials directly (IP, Username, Password)
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  <li>• Good for: Quick tests, one-off operations</li>
                  <li>• Requires: IP address, username, password</li>
                </ul>
              </div>

              <div className="bg-background border border-accent rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">From Inventory</h4>
                </div>
                <p className="text-sm text-foreground opacity-70">
                  Select from pre-configured device inventory files
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  <li>• Good for: Repeated tests, multiple devices</li>
                  <li>• Requires: Inventory file in /inventories directory</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">4. Select Tests</h3>
            <p className="text-foreground opacity-70 mb-2">
              Choose one or more test files to run. Tests are displayed as clickable chips.
            </p>
            <div className="bg-background border border-accent rounded-lg p-3">
              <p className="text-sm text-foreground opacity-70">
                <strong className="text-primary">Tip:</strong> Click on test chips to select/deselect.
                Selected tests turn yellow with a checkmark.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">5. Run Operation</h3>
            <p className="text-foreground opacity-70">
              Click on one of the operation cards:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                <Camera className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">PRE Snapshot</p>
                <p className="text-xs text-foreground opacity-70">Before changes</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                <Camera className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">POST Snapshot</p>
                <p className="text-xs text-foreground opacity-70">After changes</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                <GitCompare className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">COMPARE</p>
                <p className="text-xs text-foreground opacity-70">Validate changes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operations */}
      <section id="operations" className="bg-muted border border-accent rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Operations Explained</h2>

        <div className="space-y-6">
          {/* PRE Snapshot */}
          <div className="bg-background border border-accent rounded-lg p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">PRE Snapshot</h3>
                <p className="text-sm text-foreground opacity-70">Capture baseline device state</p>
              </div>
            </div>
            <div className="space-y-3 text-foreground">
              <p>
                A <strong className="text-primary">PRE snapshot</strong> captures the current state of a device
                before making any changes. This serves as your baseline for comparison.
              </p>
              <h4 className="font-semibold text-foreground mt-4">When to use:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>Before applying configuration changes</li>
                <li>Before network maintenance or upgrades</li>
                <li>When establishing a known-good state</li>
              </ul>
              <h4 className="font-semibold text-foreground mt-4">What happens:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                <li>JSNAPy connects to the device via SSH/NETCONF (port 830)</li>
                <li>Collects data from the selected test files</li>
                <li>Saves snapshot XML file in /snapshots directory</li>
                <li>Returns real-time logs via WebSocket</li>
              </ol>
            </div>
          </div>

          {/* POST Snapshot */}
          <div className="bg-background border border-accent rounded-lg p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Camera className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">POST Snapshot</h3>
                <p className="text-sm text-foreground opacity-70">Capture device state after changes</p>
              </div>
            </div>
            <div className="space-y-3 text-foreground">
              <p>
                A <strong className="text-primary">POST snapshot</strong> captures the device state
                after you've made changes. This is compared against the PRE snapshot to validate configurations.
              </p>
              <h4 className="font-semibold text-foreground mt-4">When to use:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>After applying configuration changes</li>
                <li>Post-maintenance or upgrade verification</li>
                <li>When validating that changes took effect</li>
              </ul>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mt-3">
                <p className="text-sm text-foreground">
                  <strong className="text-orange-500">Important:</strong> You must have a PRE snapshot before running a POST snapshot
                  for the same device and test combination.
                </p>
              </div>
            </div>
          </div>

          {/* CHECK Operation */}
          <div className="bg-background border border-accent rounded-lg p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <GitCompare className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">CHECK (Compare)</h3>
                <p className="text-sm text-foreground opacity-70">Validate pre/post snapshot differences</p>
              </div>
            </div>
            <div className="space-y-3 text-foreground">
              <p>
                The <strong className="text-primary">CHECK</strong> operation (also called <strong>Snapcheck</strong>)
                compares PRE and POST snapshots and runs validation tests to verify configuration correctness.
              </p>
              <h4 className="font-semibold text-foreground mt-4">When to use:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>After completing both PRE and POST snapshots</li>
                <li>To validate that changes didn't break anything</li>
                <li>When verifying network configuration integrity</li>
              </ul>
              <h4 className="font-semibold text-foreground mt-4">Test Results:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-sm text-green-600 font-medium flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Pass</span>
                  </p>
                  <p className="text-xs text-foreground opacity-70 mt-1">Snapshot matches expected state</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-600 font-medium flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Fail</span>
                  </p>
                  <p className="text-xs text-foreground opacity-70 mt-1">Snapshot differs from expected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Testing */}
      <section id="api-testing" className="bg-muted border border-accent rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">API Testing Guide</h2>

        <div className="space-y-6">
          <div className="text-foreground">
            <p>
              This section provides detailed information on testing operations both manually via the command line
              and programmatically through the REST API and WebSocket interface.
            </p>
          </div>

          {/* REST API */}
          <div className="bg-background border border-accent rounded-lg p-5">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Server className="w-5 h-5 text-primary" />
              <span>REST API Endpoints</span>
            </h3>
            <p className="text-foreground opacity-70 mb-4">
              Use these endpoints to trigger operations programmatically. All endpoints return JSON responses.
            </p>

            <div className="space-y-4">
              {/* PRE Snapshot API */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">PRE Snapshot</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-foreground opacity-70 mb-1">Endpoint:</p>
                    <div className="bg-accent rounded px-3 py-2 font-mono text-sm text-foreground">
                      POST /api/snapshots/pre
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground opacity-70 mb-1">Request Body:</p>
                    <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
                      {`{"device_ip": "192.168.1.1", "username": "admin", "password": "pass", "test_files": ["test_version.yaml"]}`}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground opacity-70 mb-1">Example (curl):</p>
                    <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
                      {`curl -X POST http://localhost:8000/api/snapshots/pre \\`}
                      <br />
                      {`  -H "Content-Type: application/json" \\`}
                      <br />
                      {`  -d '{"device_ip": "192.168.1.1", "username": "admin", "password": "pass", "test_files": ["test_version.yaml"]}'`}
                    </div>
                  </div>
                </div>
              </div>

              {/* POST Snapshot API */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">POST Snapshot</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-foreground opacity-70 mb-1">Endpoint:</p>
                    <div className="bg-accent rounded px-3 py-2 font-mono text-sm text-foreground">
                      POST /api/snapshots/post
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground opacity-70 mb-1">Request Body:</p>
                    <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
                      {`{"device_ip": "192.168.1.1", "username": "admin", "password": "pass", "test_files": ["test_version.yaml"]}`}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground opacity-70 mb-1">Example (curl):</p>
                    <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
                      {`curl -X POST http://localhost:8000/api/snapshots/post \\`}
                      <br />
                      {`  -H "Content-Type: application/json" \\`}
                      <br />
                      {`  -d '{"device_ip": "192.168.1.1", "username": "admin", "password": "pass", "test_files": ["test_version.yaml"]}'`}
                    </div>
                  </div>
                </div>
              </div>

              {/* CHECK Operation API */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">CHECK Operation</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-foreground opacity-70 mb-1">Endpoint:</p>
                    <div className="bg-accent rounded px-3 py-2 font-mono text-sm text-foreground">
                      POST /api/snapshots/check
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground opacity-70 mb-1">Request Body:</p>
                    <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
                      {`{"device_ip": "192.168.1.1", "username": "admin", "password": "pass", "test_files": ["test_version.yaml"]}`}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground opacity-70 mb-1">Example (curl):</p>
                    <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
                      {`curl -X POST http://localhost:8000/api/snapshots/check \\`}
                      <br />
                      {`  -H "Content-Type: application/json" \\`}
                      <br />
                      {`  -d '{"device_ip": "192.168.1.1", "username": "admin", "password": "pass", "test_files": ["test_version.yaml"]}'`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WebSocket API */}
          <div className="bg-background border border-accent rounded-lg p-5">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>WebSocket API (Real-time Logs)</span>
            </h3>
            <p className="text-foreground opacity-70 mb-4">
              Connect to the WebSocket endpoint to receive real-time log streams during operations.
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground opacity-70 mb-1">WebSocket Endpoint:</p>
                <div className="bg-accent rounded px-3 py-2 font-mono text-sm text-foreground">
                  ws://localhost:8000/ws
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground opacity-70 mb-2">Message Format:</p>
                <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground space-y-2">
                  <div>
                    <span className="text-primary">// Incoming log messages</span>
                    <br />
                    {`{`}
                    <br />
                    {`  "type": "log" | "complete" | "error",`}
                    <br />
                    {`  "timestamp": "2026-02-15T10:30:45.123Z",`}
                    <br />
                    {`  "message": "Connecting to device...",`}
                    <br />
                    {`  "level": "info" | "error" | "success"`}
                    <br />
                    {`}`}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground opacity-70 mb-2">Example (JavaScript):</p>
                <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
                  {`const ws = new WebSocket('ws://localhost:8000/ws');`}
                  <br />
                  <br />
                  {`ws.onmessage = (event) => {`}
                  <br />
                  {`  const data = JSON.parse(event.data);`}
                  <br />
                  {`  console.log(` + '`[${data.level}] ${data.message}`' + `);`}
                  <br />
                  {`};`}
                  <br />
                  <br />
                  {`ws.onerror = (error) => {`}
                  <br />
                  {`  console.error('WebSocket error:', error);`}
                  <br />
                  {`};`}
                </div>
              </div>
            </div>
          </div>

          {/* Manual CLI Testing */}
          <div className="bg-background border border-accent rounded-lg p-5">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <span>Manual CLI Testing</span>
            </h3>
            <p className="text-foreground opacity-70 mb-4">
              You can also run JSNAPy operations manually via Docker exec for testing and debugging.
            </p>

            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">PRE Snapshot (Manual)</h4>
                <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground">
                  docker-compose exec automation-engine jsnapy --snap pre -f /app/config/snap_config.yaml
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">POST Snapshot (Manual)</h4>
                <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground">
                  docker-compose exec automation-engine jsnapy --snap post -f /app/config/snap_config.yaml
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">CHECK Operation (Manual)</h4>
                <div className="bg-accent rounded px-3 py-2 font-mono text-xs text-foreground">
                  docker-compose exec automation-engine jsnapy --check /app/config/snap_config.yaml
                </div>
              </div>

              <div className="bg-accent rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">List Snapshots</h4>
                <div className="bg-background rounded px-3 py-2 font-mono text-xs text-foreground mb-2">
                  docker-compose exec automation-engine ls -la /app/snapshots/
                </div>
                <p className="text-sm text-foreground opacity-70">
                  View all generated snapshot XML files
                </p>
              </div>

              <div className="bg-accent rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">View Container Logs</h4>
                <div className="bg-background rounded px-3 py-2 font-mono text-xs text-foreground mb-2">
                  docker-compose logs -f automation-engine
                </div>
                <p className="text-sm text-foreground opacity-70">
                  Follow real-time logs from the automation engine container
                </p>
              </div>
            </div>
          </div>

          {/* Complete Workflow */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-5">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Play className="w-5 h-5 text-primary" />
              <span>Complete Testing Workflow</span>
            </h3>
            <p className="text-foreground opacity-70 mb-4">
              Follow this complete workflow for testing network changes:
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Capture PRE Snapshot</h4>
                  <p className="text-sm text-foreground opacity-70 mt-1">
                    Before making changes, capture the baseline state:
                  </p>
                  <div className="bg-background rounded px-3 py-2 font-mono text-xs text-foreground mt-2">
                    POST /api/snapshots/pre
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Apply Network Changes</h4>
                  <p className="text-sm text-foreground opacity-70 mt-1">
                    Apply your configuration changes to the network device
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Capture POST Snapshot</h4>
                  <p className="text-sm text-foreground opacity-70 mt-1">
                    After changes, capture the new state:
                  </p>
                  <div className="bg-background rounded px-3 py-2 font-mono text-xs text-foreground mt-2">
                    POST /api/snapshots/post
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-foreground flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Run CHECK Operation</h4>
                  <p className="text-sm text-foreground opacity-70 mt-1">
                    Compare snapshots and validate changes:
                  </p>
                  <div className="bg-background rounded px-3 py-2 font-mono text-xs text-foreground mt-2">
                    POST /api/snapshots/check
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-foreground flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Review Results</h4>
                  <p className="text-sm text-foreground opacity-70 mt-1">
                    Check the History page for detailed results and logs
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong className="text-primary">Pro Tip:</strong> Use the WebSocket connection (ws://localhost:8000/ws)
              to monitor operations in real-time, whether triggered via the web UI or REST API.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted border border-accent rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Key Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Device Management</h3>
              </div>
              <p className="text-foreground opacity-70 text-sm">
                Manage device inventories, configure connections, and store credentials securely.
                Choose between manual entry for quick tests or inventory files for repeated operations.
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Server className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Test Library</h3>
              </div>
              <p className="text-foreground opacity-70 text-sm">
                Browse and select from available JSNAPy test files. Tests are stored as YAML files
                in the /testfiles directory and define what to check and how to validate it.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Real-time Logs</h3>
              </div>
              <p className="text-foreground opacity-70 text-sm">
                Watch JSNAPy execution live with WebSocket streaming. See connection progress,
                command execution, and results as they happen with color-coded log levels.
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Operation History</h3>
              </div>
              <p className="text-foreground opacity-70 text-sm">
                All operations are automatically saved to browser storage. View complete history
                with filters, view detailed logs, and track test results over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section id="history" className="bg-muted border border-accent rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Operation History</h2>

        <div className="space-y-4 text-foreground">
          <p>
            Every operation you run is automatically saved to the History page, providing a complete
            audit trail of all JSNAPy activities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Viewing History</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Click <strong className="text-primary">History</strong> in the sidebar</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Filter by operation type (PRE/POST/CHECK)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Filter by status (Success/Failed/Running)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Click <Eye className="w-4 h-4 inline" /> icon for details</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">History Information</h3>
              <p className="text-sm text-foreground opacity-70 mb-2">Each entry shows:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Operation type:</strong> PRE, POST, or CHECK</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Device:</strong> Target device IP address</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Test file:</strong> Which test was run</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Status:</strong> Success or Failed</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Duration:</strong> How long the operation took</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Message:</strong> Result summary or error details</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section id="troubleshooting" className="bg-muted border border-accent rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Troubleshooting</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Common Issues</h3>

            <div className="space-y-4">
              <div className="bg-background border border-accent rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span>Connection Failed / Authentication Error</span>
                </h4>
                <div className="text-sm text-foreground space-y-2">
                  <p><strong className="text-foreground">Symptoms:</strong> "Authentication failed" or "Permission denied" in logs</p>
                  <p><strong className="text-foreground">Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Verify username and password are correct</li>
                    <li>Check device is reachable via SSH (port 22) and NETCONF (port 830)</li>
                    <li>Ensure user has appropriate permissions on the device</li>
                    <li>Check firewall rules aren't blocking connection</li>
                  </ul>
                </div>
              </div>

              <div className="bg-background border border-accent rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span>No Test Files Available</span>
                </h4>
                <div className="text-sm text-foreground space-y-2">
                  <p><strong className="text-foreground">Symptoms:</strong> Test selection shows "No test files available"</p>
                  <p><strong className="text-foreground">Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Ensure YAML test files exist in /testfiles directory</li>
                    <li>Check file permissions on test files</li>
                    <li>Verify backend container has access to /testfiles volume</li>
                    <li>Test file format must match JSNAPy YAML schema</li>
                  </ul>
                </div>
              </div>

              <div className="bg-background border border-accent rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  <span>WebSocket Not Connecting</span>
                </h4>
                <div className="text-sm text-foreground space-y-2">
                  <p><strong className="text-foreground">Symptoms:</strong> "Connecting to device..." status persists</p>
                  <p><strong className="text-foreground">Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Check backend is running: <code className="bg-accent px-2 py-1 rounded">docker ps</code></li>
                    <li>Verify WebSocket URL in environment variables</li>
                    <li>Check browser console for WebSocket errors</li>
                    <li>Ensure device allows connections from backend container</li>
                  </ul>
                </div>
              </div>

              <div className="bg-background border border-accent rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span>Check Shows All Failures</span>
                </h4>
                <div className="text-sm text-foreground space-y-2">
                  <p><strong className="text-foreground">Symptoms:</strong> CHECK operation shows all tests failed</p>
                  <p><strong className="text-foreground">Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Verify POST snapshot was captured successfully</li>
                    <li>Check that both snapshots use the same test file</li>
                    <li>Review test file assertions for correctness</li>
                    <li>Device configuration may have changed unexpectedly</li>
                    <li>Check JSNAPy test output in logs for specific failures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span>Need More Help?</span>
            </h4>
            <div className="text-sm text-foreground space-y-2">
              <p>Check the JSNAPy logs for detailed error information:</p>
              <div className="bg-background border border-accent rounded-lg p-3 font-mono text-xs">
                <code>docker logs optic-engine-backend-1 -f</code>
              </div>
              <p className="mt-2">View test files and configuration in the Tests and Devices pages.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="bg-muted border border-accent rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Quick Reference</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground">Toggle theme</span>
                <span className="text-foreground opacity-70">Click moon/sun icon in header</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Navigate</span>
                <span className="text-foreground opacity-70">Use sidebar menu</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Default Ports</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground">Frontend</span>
                <span className="text-foreground opacity-70">3000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Backend API</span>
                <span className="text-foreground opacity-70">8000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Device SSH</span>
                <span className="text-foreground opacity-70">22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">NETCONF</span>
                <span className="text-foreground opacity-70">830</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-sm text-foreground opacity-70 pt-8 border-t border-accent">
        <p>For more information about JSNAPy, visit the
          <a href="https://github.com/Juniper/jsnapy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            official documentation
          </a>
        </p>
      </div>
    </div>
  )
}
