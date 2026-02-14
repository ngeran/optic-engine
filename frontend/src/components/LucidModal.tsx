import { useState } from 'react'
import { Zap, Server, Play } from 'lucide-react'
import { api } from '@/lib/api'
import type { InventoryFile } from '@/lib/api'

interface LucidModalProps {
  isOpen: boolean
  onClose: () => void
}

type OperationTab = 'manual' | 'inventory'

export function LucidModal({ isOpen, onClose }: LucidModalProps) {
  const [activeTab, setActiveTab] = useState<OperationTab>('manual')
  const [deviceIP, setDeviceIP] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedInventory, setSelectedInventory] = useState<string | null>(null)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [selectedOperation, setSelectedOperation] = useState<'PRE' | 'POST' | 'CHECK'>('PRE')
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [operationComplete, setOperationComplete] = useState(false)

  const [inventories, setInventories] = useState<InventoryFile[]>([])
  const [tests, setTests] = useState<string[]>([])

  // Fetch inventories and tests on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invData, testData] = await Promise.all([
          api.getInventories(),
          api.getTestFiles()
        ])
        if (invData) setInventories(invData)
        if (testData) setTests(testData)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      }
    }
    fetchData()
  }, [])

  const handleClose = () => {
    onClose()
    // Reset state
    setActiveTab('manual')
    setDeviceIP('')
    setUsername('')
    setPassword('')
    setSelectedInventory(null)
    setSelectedTest(null)
    setSelectedOperation('PRE')
    setLogs([])
    setIsRunning(false)
    setOperationComplete(false)
  }

  const handleRun = async () => {
    if (!selectedOperation) {
      alert('Please select an operation first')
      return
    }

    if (activeTab === 'manual' && (!deviceIP || !username || !password)) {
      alert('Please enter device credentials')
      return
    }

    if (activeTab === 'inventory' && !selectedInventory) {
      alert('Please select an inventory file')
      return
    }

    if (activeTab === 'inventory' && !selectedTest) {
      alert('Please select a test file')
      return
    }

    setIsRunning(true)
    setOperationComplete(false)
    setLogs([])

    try {
      const deviceIPtoUse = activeTab === 'manual' ? deviceIP : undefined
      const usernameToUse = activeTab === 'manual' ? username : undefined
      const passwordToUse = activeTab === 'manual' ? password : undefined
      const inventoryToUse = activeTab === 'inventory' ? selectedInventory : undefined
      const testFileToUse = activeTab === 'inventory' ? selectedTest : undefined

      const response = await fetch('http://localhost:8000/run-operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: selectedOperation,
          device_ip: deviceIPtoUse,
          username: usernameToUse,
          password: passwordToUse,
          test_file: testFileToUse,
          inventory_file: inventoryToUse,
        })
      })

      if (response.ok) {
        const reader = response.body?.getReader()
        if (reader) {
          const decoder = new TextDecoder()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = decoder.decode(value)
            const logEntry = { type: 'log', data: text, timestamp: new Date().toISOString() }
            setLogs((prev) => [...prev, logEntry])
          }
        }
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLogs((prev) => [
        ...prev,
        { type: 'error', data: String(error), timestamp: new Date().toISOString() }
      ])
    } finally {
      setIsRunning(false)
      setOperationComplete(true)
    }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-accent rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-accent">
          <h3 className="text-lg font-semibold text-foreground">Lucid Run - JSNAPy Operations</h3>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-accent transition-colors text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-accent">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'manual' ? 'bg-accent text-foreground' : 'text-foreground opacity-70 hover:bg-accent/50'
            }`}
          >
            ⚡ Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'inventory' ? 'bg-accent text-foreground' : 'text-foreground opacity-70 hover:bg-accent/50'
            }`}
          >
            📋 From Inventory
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Device IP</label>
                <input
                  type="text"
                  value={deviceIP}
                  onChange={(e) => setDeviceIP(e.target.value)}
                  placeholder="172.27.200.200"
                  className="w-full px-3 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label className="block text-sm font-medium text-foreground mb-2">Operation</label>
                <button
                  onClick={() => setSelectedOperation('PRE')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedOperation === 'PRE' ? 'bg-green-600 text-white' : 'bg-accent hover:bg-accent-hover text-foreground'
                  }`}
                >
                  PRE Snapshot
                </button>
                <button
                  onClick={() => setSelectedOperation('POST')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedOperation === 'POST' ? 'bg-green-600 text-white' : 'bg-accent hover:bg-accent-hover text-foreground'
                  }`}
                >
                  POST Snapshot
                </button>
                <button
                  onClick={() => setSelectedOperation('CHECK')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedOperation === 'CHECK' ? 'bg-green-600 text-white' : 'bg-accent hover:bg-accent-hover text-foreground'
                  }`}
                >
                  CHECK
                </button>
              </div>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Operation</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Inventory File</label>
                <select
                  value={selectedInventory || ''}
                  onChange={(e) => setSelectedInventory(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-accent rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">-- Select Inventory --</option>
                  {inventories.map((inv) => (
                    <option key={inv.name} value={inv.name}>
                      {inv.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Test File</label>
                <select
                  value={selectedTest || ''}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-accent rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">-- Select Test --</option>
                  {tests.map((test) => (
                    <option key={test.name} value={test.name}>
                      {test.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label className="block text-sm font-medium text-foreground mb-2">Operation</label>
                <button
                  onClick={() => setSelectedOperation('PRE')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedOperation === 'PRE' ? 'bg-green-600 text-white' : 'bg-accent hover:bg-accent-hover text-foreground'
                  }`}
                >
                  PRE Snapshot
                </button>
                <button
                  onClick={() => setSelectedOperation('POST')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedOperation === 'POST' ? 'bg-green-600 text-white' : 'bg-accent hover:bg-accent-hover text-foreground'
                  }`}
                >
                  POST Snapshot
                </button>
                <button
                  onClick={() => setSelectedOperation('CHECK')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedOperation === 'CHECK' ? 'bg-green-600 text-white' : 'bg-accent hover:bg-accent-hover text-foreground'
                  }`}
                >
                  CHECK
                </button>
              </div>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Operation</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Logs */}
        {(logs.length > 0 || isRunning) && (
          <div className="flex-1 overflow-auto p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-foreground">Real-time Logs</h4>
              {isRunning && logs.length === 0 && (
                <div className="flex items-center space-x-2 text-sm text-foreground opacity-70">
                  <div className="w-2 h-2 border-2 border-green-500 rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto max-h-40 bg-background border border-accent rounded-lg p-2">
              <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">
                {logs.map((log, idx) => (
                  <div key={idx} className={log.type === 'error' ? 'text-red-500' : log.type === 'complete' ? 'text-green-600' : 'text-foreground'}>
                    [{new Date(log.timestamp).toLocaleTimeString()}] {log.data}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-accent">
          <button
            onClick={handleClose}
            disabled={isRunning}
            className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
          {operationComplete && !isRunning && (
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Operation Complete ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
