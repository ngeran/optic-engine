import { useState, useEffect } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

export default function Tests() {
  const { isConnected, isConnecting, logs, sendMessage, error } = useWebSocket(
    'ws://localhost:8000/ws/snapshot'
  )

  const [selectedDevice, setSelectedDevice] = useState('')
  const [selectedTestFile, setSelectedTestFile] = useState('')
  const [selectedUsername, setSelectedUsername] = useState('')
  const [selectedPassword, setSelectedPassword] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  // Fetch available test files on mount
  useEffect(() => {
    async function fetchTestFiles() {
      try {
        const response = await fetch('http://localhost:8000/api/v1/tests/templates')
        if (!response.ok) {
          console.error('Failed to fetch test files')
          return
        }
        const files = await response.json()
        console.log('Available test files:', files)
      } catch (e) {
        console.error('Error fetching test files:', e)
      }
    }

    fetchTestFiles()
  }, [])

  const handleSnapshotPre = () => {
    if (!isConnected) {
      alert('Not connected to WebSocket')
      return
    }

    setIsExecuting(true)
    sendMessage({
      action: 'snapshot',
      task_type: 'pre',
      device: selectedDevice || undefined,
      username: selectedUsername || undefined,
      password: selectedPassword || undefined,
    })
  }

  const handleSnapshotPost = () => {
    if (!isConnected) {
      alert('Not connected to WebSocket')
      return
    }

    setIsExecuting(true)
    sendMessage({
      action: 'snapshot',
      task_type: 'post',
      device: selectedDevice || undefined,
      username: selectedUsername || undefined,
      password: selectedPassword || undefined,
    })
  }

  const handleRunCheck = () => {
    if (!isConnected) {
      alert('Not connected to WebSocket')
      return
    }

    setIsExecuting(true)
    sendMessage({
      action: 'check',
      device: selectedDevice || undefined,
      username: selectedUsername || undefined,
      password: selectedPassword || undefined,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Test Execution</h1>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive-foreground rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Connection Status */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Connection Status</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-success' : isConnecting ? 'bg-warning' : 'bg-destructive'
              }`}></div>
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card p-6 rounded-lg border border-border space-y-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Controls</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="device" className="block text-sm font-medium text-foreground mb-2">
                Device IP (optional)
              </label>
              <input
                id="device"
                type="text"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                placeholder="192.168.1.1"
                className="w-full px-3 py-2 border border-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isExecuting}
              />
            </div>

            <div>
              <label htmlFor="test" className="block text-sm font-medium text-foreground mb-2">
                Test File
              </label>
              <select
                id="test"
                value={selectedTestFile}
                onChange={(e) => setSelectedTestFile(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isExecuting}
              >
                <option value="">Select a test file...</option>
                <option value="test_bgp.yml">BGP Summary</option>
                <option value="test_interfaces.yml">Interface Status</option>
                <option value="junos_version.yml">Junos Version</option>
              </select>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username (optional)
              </label>
              <input
                id="username"
                type="text"
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3 py-2 border border-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isExecuting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password (optional)
              </label>
              <input
                id="password"
                type="password"
                value={selectedPassword}
                onChange={(e) => setSelectedPassword(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-2 border border-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isExecuting}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={handleSnapshotPre}
              disabled={isExecuting}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            >
              Snapshot PRE
            </button>

            <button
              onClick={handleSnapshotPost}
              disabled={isExecuting}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            >
              Snapshot POST
            </button>

            <button
              onClick={handleRunCheck}
              disabled={isExecuting}
              className="bg-warning text-warning-foreground px-4 py-2 rounded-md font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            >
              Run Check
            </button>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Real-time Logs</h2>
          <span className="text-sm text-muted-foreground">{logs.length} messages</span>
        </div>

        <div className="bg-input border-border rounded-md p-4 h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground">Waiting for logs...</p>
          ) : (
            <ul className="space-y-1 font-mono text-sm">
              {logs.map((log, index) => (
                <li key={index} className={log.includes('ERROR') ? 'text-destructive' : log.includes('PASS') ? 'text-success' : ''}>
                  {log}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
