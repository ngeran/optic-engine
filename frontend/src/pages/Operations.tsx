import { useState, useEffect, useRef } from 'react'
import { Play, CheckCircle } from 'lucide-react'
import { api, WebSocketClient } from '@/lib/api'
import type { InventoryFile, TestFile } from '@/lib/api'

type InputMode = 'manual' | 'inventory'
type OperationType = 'PRE' | 'POST' | 'CHECK'

export function Operations() {
  const [inputMode, setInputMode] = useState<InputMode>('manual')
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('PRE')

  // Manual entry fields
  const [deviceIP, setDeviceIP] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Inventory selection
  const [selectedInventory, setSelectedInventory] = useState<string>('')
  const [inventories, setInventories] = useState<InventoryFile[]>([])

  // Test selection (multiple)
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [availableTests, setAvailableTests] = useState<TestFile[]>([])

  // Operation status
  const [isRunning, setIsRunning] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const [logs, setLogs] = useState<Array<{timestamp: string; message: string; type: 'info' | 'error' | 'success'}>>([])

  // WebSocket client reference
  const wsClientRef = useRef<WebSocketClient | null>(null)

  // Load inventories and tests on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [invData, testData] = await Promise.all([
          api.getInventories(),
          api.getTestFiles()
        ])
        if (invData) setInventories(invData)
        if (testData) setAvailableTests(testData)
      } catch (err) {
        console.error('Failed to load data:', err)
      }
    }
    loadData()

    // Cleanup WebSocket on unmount
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
      }
    }
  }, [])

  const handleTestToggle = (testName: string) => {
    setSelectedTests(prev =>
      prev.includes(testName)
        ? prev.filter(t => t !== testName)
        : [...prev, testName]
    )
  }

  const canRunOperation = () => {
    // Must have at least one test selected
    if (selectedTests.length === 0) return false

    // Must have valid input based on mode
    if (inputMode === 'manual') {
      return deviceIP && username && password
    } else {
      return selectedInventory
    }
  }

  const runOperation = async (operationType: OperationType) => {
    if (!canRunOperation()) {
      addLog('error', 'Please fill in all required fields and select at least one test')
      return
    }

    setIsRunning(true)
    setSelectedOperation(operationType)
    setLogs([]) // Clear previous logs
    setWsConnected(false)

    // Connect to WebSocket for real-time updates
    if (!wsClientRef.current) {
      wsClientRef.current = api.connectWebSocket({
        onConnected: () => {
          setWsConnected(true)
          addLog('info', 'WebSocket connected - Sending operation request...')
        },
        onLog: (message) => {
          // Real-time log from JSNAPy execution
          addLog('info', message.data)
        },
        onStatus: (message) => {
          addLog('info', message.data)
        },
        onComplete: (message) => {
          addLog('success', message.data || 'Operation completed')
          setIsRunning(false)
        },
        onError: (message) => {
          addLog('error', message.data || 'Operation error')
          setIsRunning(false)
        }
      })
    }

    addLog('info', `Starting ${operationType} operation...`)

    // Wait a moment for WebSocket to connect
    await new Promise(resolve => setTimeout(resolve, 500))

    // Send operation request via WebSocket
    const taskType = operationType.toLowerCase() // 'pre' or 'post'
    const action = operationType === 'CHECK' ? 'check' : 'snapshot'

    const request = {
      action,
      task_type: taskType,
      device: inputMode === 'manual' ? deviceIP : undefined,
      username: inputMode === 'manual' ? username : undefined,
      password: inputMode === 'manual' ? password : undefined,
      inventory_file: inputMode === 'inventory' ? selectedInventory : undefined,
      test_file: selectedTests[0] // TODO: Support multiple tests
    }

    // Send via WebSocket
    if (wsClientRef.current) {
      const sent = wsClientRef.current.send(request)
      if (!sent) {
        addLog('error', 'Failed to send operation request')
        setIsRunning(false)
      }
    }
  }

  const addLog = (type: 'info' | 'error' | 'success', message: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      type,
      message
    }])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Operations</h1>
        <p className="text-foreground opacity-70 mt-2">
          Run JSNAPy operations on your devices
        </p>
      </div>

      {/* Input Mode Selection */}
      <div className="bg-muted border border-accent rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Connection Mode</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setInputMode('manual')}
            className={`px-6 py-3 rounded-lg transition-colors font-medium ${
              inputMode === 'manual'
                ? 'bg-green-600 text-white'
                : 'bg-accent text-foreground hover:bg-accent-hover'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setInputMode('inventory')}
            className={`px-6 py-3 rounded-lg transition-colors font-medium ${
              inputMode === 'inventory'
                ? 'bg-green-600 text-white'
                : 'bg-accent text-foreground hover:bg-accent-hover'
            }`}
          >
            From Inventory
          </button>
        </div>
      </div>

      {/* Connection Details */}
      <div className="bg-muted border border-accent rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Connection Details</h3>

        {inputMode === 'manual' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Device IP Address</label>
              <input
                type="text"
                value={deviceIP}
                onChange={(e) => setDeviceIP(e.target.value)}
                placeholder="172.27.200.200"
                disabled={isRunning}
                className="w-full px-4 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                disabled={isRunning}
                className="w-full px-4 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••"
                disabled={isRunning}
                className="w-full px-4 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Inventory File</label>
            <select
              value={selectedInventory}
              onChange={(e) => setSelectedInventory(e.target.value)}
              disabled={isRunning}
              className="w-full px-4 py-2 bg-background border border-accent rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select Inventory --</option>
              {inventories.map((inv) => (
                <option key={inv.name} value={inv.name}>
                  {inv.name}
                </option>
              ))}
            </select>
            {inventories.length === 0 && (
              <p className="text-sm text-foreground opacity-70 mt-2">No inventory files available</p>
            )}
          </div>
        )}
      </div>

      {/* Test Selection */}
      <div className="bg-muted border border-accent rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Select Tests</h3>
        <p className="text-sm text-foreground opacity-70 mb-4">Choose one or more tests to run</p>

        {availableTests.length === 0 ? (
          <p className="text-foreground opacity-70">No test files available</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableTests.map((test) => (
              <label key={test.name} className="flex items-center space-x-3 p-2 hover:bg-accent rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test.name)}
                  onChange={() => handleTestToggle(test.name)}
                  disabled={isRunning}
                  className="w-4 h-4 rounded border-accent text-green-600 focus:ring-green-500"
                />
                <span className="text-foreground">{test.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Operation Buttons */}
      <div className="bg-muted border border-accent rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Run Operation</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => runOperation('PRE')}
            disabled={isRunning}
            className={`flex-1 min-w-[150px] px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              selectedOperation === 'PRE' && isRunning
                ? 'bg-green-700 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Play className="w-5 h-5" />
            <span>Start PRE</span>
          </button>

          <button
            onClick={() => runOperation('POST')}
            disabled={isRunning}
            className={`flex-1 min-w-[150px] px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              selectedOperation === 'POST' && isRunning
                ? 'bg-green-700 text-white animate-pulse'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Play className="w-5 h-5" />
            <span>Start POST</span>
          </button>

          <button
            onClick={() => runOperation('CHECK')}
            disabled={isRunning}
            className={`flex-1 min-w-[150px] px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              selectedOperation === 'CHECK' && isRunning
                ? 'bg-green-700 text-white animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>CHECK</span>
          </button>
        </div>

        {selectedTests.length > 0 && (
          <p className="text-sm text-foreground opacity-70 mt-4">
            {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Connection Status */}
      {isRunning && (
        <div className={`border rounded-lg p-4 flex items-center space-x-3 ${
          wsConnected ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-ping'
          }`}></div>
          <span className="text-sm font-medium text-foreground">
            {wsConnected ? 'Connected - Receiving live updates' : 'Connecting to device...'}
          </span>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-muted border border-accent rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Operation Logs</h3>
            {isRunning && (
              <div className="flex items-center space-x-2 text-sm text-foreground opacity-70">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto bg-background border border-accent rounded-lg p-4 font-mono text-sm">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`mb-1 leading-relaxed ${
                  log.type === 'error' ? 'text-red-500' :
                  log.type === 'success' ? 'text-green-600' :
                  'text-foreground'
                }`}
              >
                <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                <span>{log.message}</span>
              </div>
            ))}
            {logs.length > 0 && (
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
