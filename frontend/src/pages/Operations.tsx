import { useState, useEffect, useRef } from 'react'
import { Play, CheckCircle, Camera, GitCompare, Database, FolderOpen, Server, User, Lock, AlertCircle } from 'lucide-react'
import { api, WebSocketClient } from '@/lib/api'
import type { InventoryFile, TestFile } from '@/lib/api'
import { ResultsCard, type OperationResult, type OperationStatus } from '@/components/ResultsCard'

// History storage key
const HISTORY_STORAGE_KEY = 'operation_history'

// Load history from localStorage
const loadHistory = (): OperationResult[] => {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
    return []
  } catch (err) {
    console.error('Failed to load history:', err)
    return []
  }
}

// Save to localStorage
const saveToHistory = (entry: OperationResult) => {
  try {
    const history = loadHistory()
    const updated = [entry, ...history].slice(0, 100) // Keep last 100 entries
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated))
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: HISTORY_STORAGE_KEY,
      newValue: JSON.stringify(updated),
      storageArea: localStorage
    }))
  } catch (err) {
    console.error('Failed to save to history:', err)
  }
}

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

  // Operation results
  const [operationResults, setOperationResults] = useState<OperationResult[]>([])

  // WebSocket client reference
  const wsClientRef = useRef<WebSocketClient | null>(null)
  const currentOperationRef = useRef<OperationResult | null>(null)

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

    // Create new operation result
    const newResult: OperationResult = {
      id: Date.now().toString(),
      type: operationType,
      status: 'running',
      deviceIP: inputMode === 'manual' ? deviceIP : selectedInventory,
      testFile: selectedTests[0],
      startTime: new Date().toISOString(),
      logs: []
    }
    currentOperationRef.current = newResult
    setOperationResults(prev => [newResult, ...prev])

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
          // Also add to current operation result using functional update
          setOperationResults(prev => prev.map(r => {
            if (r.id === currentOperationRef.current?.id) {
              const updatedLogs = [...(r.logs || []), {
                timestamp: message.timestamp,
                message: message.data,
                type: 'info' as const
              }]
              const updated = { ...r, logs: updatedLogs }
              currentOperationRef.current = updated
              return updated
            }
            return r
          }))
        },
        onStatus: (message) => {
          addLog('info', message.data)
        },
        onComplete: (message) => {
          addLog('success', message.data || 'Operation completed')
          setIsRunning(false)
          // Update operation result as completed
          setOperationResults(prev => prev.map(r => {
            if (r.id === currentOperationRef.current?.id) {
              const updated = {
                ...r,
                status: 'success' as OperationStatus,
                endTime: new Date().toISOString(),
                message: message.data || 'Operation completed successfully'
              }
              currentOperationRef.current = updated
              // Save to history
              saveToHistory(updated)
              return updated
            }
            return r
          }))
        },
        onError: (message) => {
          addLog('error', message.data || 'Operation error')
          setIsRunning(false)
          // Update operation result as error
          setOperationResults(prev => prev.map(r => {
            if (r.id === currentOperationRef.current?.id) {
              const updated = {
                ...r,
                status: 'error' as OperationStatus,
                endTime: new Date().toISOString(),
                message: message.data || 'Operation failed'
              }
              currentOperationRef.current = updated
              // Save to history
              saveToHistory(updated)
              return updated
            }
            return r
          }))
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

  const clearResult = (id: string) => {
    setOperationResults(prev => prev.filter(r => r.id !== id))
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

      {/* Connection Details & Test Selection - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Details */}
        <div className="bg-muted border border-accent rounded-lg p-6">
          {/* Integrated Mode Selector */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Connection</h3>
            <div className="flex items-center bg-accent rounded-lg p-1">
              <button
                onClick={() => setInputMode('manual')}
                disabled={isRunning}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  inputMode === 'manual'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-accent-hover'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Database className="w-4 h-4" />
                <span>Manual</span>
              </button>
              <button
                onClick={() => setInputMode('inventory')}
                disabled={isRunning}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  inputMode === 'inventory'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-accent-hover'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Inventory</span>
              </button>
            </div>
          </div>

          {/* Connection Content with Animated Transition */}
          <div className="relative min-h-[200px]">
            <div className={`transition-all duration-300 ${
              inputMode === 'manual' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-20px] absolute'
            }`}>
              {inputMode === 'manual' && (
                <div className="space-y-4">
                  <div className="group">
                    <label className="flex items-center space-x-2 text-sm font-medium text-foreground mb-2">
                      <Server className="w-4 h-4 text-primary" />
                      <span>Device IP Address</span>
                    </label>
                    <input
                      type="text"
                      value={deviceIP}
                      onChange={(e) => setDeviceIP(e.target.value)}
                      placeholder="172.27.200.200"
                      disabled={isRunning}
                      className="w-full px-4 py-3 bg-background border-2 border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center space-x-2 text-sm font-medium text-foreground mb-2">
                      <User className="w-4 h-4 text-primary" />
                      <span>Username</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      disabled={isRunning}
                      className="w-full px-4 py-3 bg-background border-2 border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center space-x-2 text-sm font-medium text-foreground mb-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <span>Password</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••"
                      disabled={isRunning}
                      className="w-full px-4 py-3 bg-background border-2 border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={`transition-all duration-300 ${
              inputMode === 'inventory' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[20px] absolute'
            }`}>
              {inputMode === 'inventory' && (
                <div className="space-y-4">
                  <div className="group">
                    <label className="flex items-center space-x-2 text-sm font-medium text-foreground mb-2">
                      <FolderOpen className="w-4 h-4 text-primary" />
                      <span>Select Inventory File</span>
                    </label>
                    <select
                      value={selectedInventory}
                      onChange={(e) => setSelectedInventory(e.target.value)}
                      disabled={isRunning}
                      className="w-full px-4 py-3 bg-background border-2 border-accent rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Select Inventory --</option>
                      {inventories.map((inv) => (
                        <option key={inv.name} value={inv.name}>
                          {inv.name}
                        </option>
                      ))}
                    </select>
                    {inventories.length === 0 && (
                      <p className="text-sm text-foreground opacity-70 mt-2 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>No inventory files available</span>
                      </p>
                    )}
                  </div>

                  {inventories.length > 0 && selectedInventory && (
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-primary">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Selected: {selectedInventory}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Selection */}
        <div className="bg-muted border border-accent rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Tests</h3>
          <p className="text-sm text-foreground opacity-70 mb-4">Choose one or more tests to run</p>

          {availableTests.length === 0 ? (
            <p className="text-foreground opacity-70">No test files available</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTests.map((test) => (
                <button
                  key={test.name}
                  onClick={() => handleTestToggle(test.name)}
                  disabled={isRunning}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTests.includes(test.name)
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-accent text-foreground hover:bg-accent-hover border border-accent'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  type="button"
                >
                  <div className="flex items-center space-x-2">
                    {selectedTests.includes(test.name) && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{test.name.replace('.yaml', '')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Operation Cards */}
      <div className="bg-muted border border-accent rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Run Operation</h3>
          {selectedTests.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-primary">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">{selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} selected</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PRE Operation Card */}
          <button
            onClick={() => runOperation('PRE')}
            disabled={isRunning}
            className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
              selectedOperation === 'PRE' && isRunning
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                : 'border-accent bg-card hover:border-primary hover:shadow-lg hover:shadow-primary/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {selectedOperation === 'PRE' && isRunning && (
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-primary/20 text-primary">
                <Camera className="w-6 h-6" />
              </div>
              {selectedOperation === 'PRE' && isRunning ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-primary">Running</span>
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-accent group-hover:bg-primary transition-colors"></div>
              )}
            </div>
            <h4 className="text-lg font-bold text-card-foreground mb-1">PRE Snapshot</h4>
            <p className="text-sm text-card-foreground opacity-70 mb-3">Capture device state before changes</p>
            <div className="flex items-center space-x-1 text-xs text-card-foreground opacity-50">
              <Play className="w-3 h-3" />
              <span>Click to run</span>
            </div>
          </button>

          {/* POST Operation Card */}
          <button
            onClick={() => runOperation('POST')}
            disabled={isRunning}
            className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
              selectedOperation === 'POST' && isRunning
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                : 'border-accent bg-card hover:border-primary hover:shadow-lg hover:shadow-primary/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {selectedOperation === 'POST' && isRunning && (
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-orange-500/20 text-orange-500">
                <Camera className="w-6 h-6" />
              </div>
              {selectedOperation === 'POST' && isRunning ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-orange-500">Running</span>
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-accent group-hover:bg-orange-500 transition-colors"></div>
              )}
            </div>
            <h4 className="text-lg font-bold text-card-foreground mb-1">POST Snapshot</h4>
            <p className="text-sm text-card-foreground opacity-70 mb-3">Capture device state after changes</p>
            <div className="flex items-center space-x-1 text-xs text-card-foreground opacity-50">
              <Play className="w-3 h-3" />
              <span>Click to run</span>
            </div>
          </button>

          {/* CHECK Operation Card */}
          <button
            onClick={() => runOperation('CHECK')}
            disabled={isRunning}
            className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
              selectedOperation === 'CHECK' && isRunning
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                : 'border-accent bg-card hover:border-primary hover:shadow-lg hover:shadow-primary/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {selectedOperation === 'CHECK' && isRunning && (
              <div className="absolute top-4 right-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-500">
                <GitCompare className="w-6 h-6" />
              </div>
              {selectedOperation === 'CHECK' && isRunning ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-500">Running</span>
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-accent group-hover:bg-blue-500 transition-colors"></div>
              )}
            </div>
            <h4 className="text-lg font-bold text-card-foreground mb-1">COMPARE</h4>
            <p className="text-sm text-card-foreground opacity-70 mb-3">Compare pre/post snapshots</p>
            <div className="flex items-center space-x-1 text-xs text-card-foreground opacity-50">
              <GitCompare className="w-3 h-3" />
              <span>Click to run</span>
            </div>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {isRunning && (
        <div className={`border rounded-lg p-4 flex items-center space-x-3 ${
          wsConnected ? 'border-primary bg-primary/10' : 'border-yellow-500 bg-yellow-500/10'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            wsConnected ? 'bg-primary animate-pulse' : 'bg-yellow-500 animate-ping'
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
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto bg-background border border-accent rounded-lg p-4 font-mono text-sm">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`mb-1 leading-relaxed ${
                  log.type === 'error' ? 'text-destructive' :
                  log.type === 'success' ? 'text-primary' :
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

      {/* Operation Results */}
      {operationResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Operation Results</h2>
          {operationResults.map(result => (
            <ResultsCard
              key={result.id}
              result={result}
              onClear={() => clearResult(result.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
