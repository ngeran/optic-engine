import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react'
import { type OperationResult } from '@/components/ResultsCard'

// Storage key (must match Operations page)
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
    console.error('Failed to load history from localStorage:', err)
    return []
  }
}

// Save history to localStorage
const saveHistory = (history: OperationResult[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch (err) {
    console.error('Failed to save history to localStorage:', err)
  }
}

export function History() {
  const [history, setHistory] = useState<OperationResult[]>([])
  const [filter, setFilter] = useState<'all' | 'PRE' | 'POST' | 'CHECK'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error' | 'running'>('all')
  const [selectedEntry, setSelectedEntry] = useState<OperationResult | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)

  // Load history on mount
  useEffect(() => {
    const loaded = loadHistory()
    setHistory(loaded)
  }, [])

  // Listen for storage changes (from other tabs/components)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === HISTORY_STORAGE_KEY) {
        const updated = loadHistory()
        setHistory(updated)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const filteredHistory = history.filter(entry => {
    const typeMatch = filter === 'all' || entry.type === filter
    const statusMatch = statusFilter === 'all' || entry.status === statusFilter
    return typeMatch && statusMatch
  })

  const getStatusIcon = (status: OperationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'running':
        return <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
      default:
        return <Clock className="w-5 h-5 text-foreground opacity-50" />
    }
  }

  const getStatusBadge = (status: OperationResult['status']) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-green-600 text-white">Success</span>
      case 'error':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-red-600 text-white">Failed</span>
      case 'running':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-600 text-white">Running</span>
      default:
        return <span className="px-2 py-1 rounded text-xs font-medium bg-accent text-foreground">Unknown</span>
    }
  }

  const formatDuration = (entry: OperationResult) => {
    if (entry.duration) return entry.duration
    if (entry.endTime) {
      const ms = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()
      if (ms < 1000) return `${ms}ms`
      if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
      return `${(ms / 60000).toFixed(1)}m`
    }
    return 'N/A'
  }

  const viewDetails = (entry: OperationResult) => {
    setSelectedEntry(entry)
    setShowLogModal(true)
  }

  const deleteEntry = (id: string) => {
    const updated = history.filter(e => e.id !== id)
    setHistory(updated)
    saveHistory(updated)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Test Run History</h1>
        <p className="text-foreground opacity-70 mt-2">
          View and manage your JSNAPy operation history
        </p>
      </div>

      {/* Filters */}
      <div className="bg-muted border border-accent rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Operation Type:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 bg-background border border-accent rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="PRE">PRE Snapshots</option>
              <option value="POST">POST Snapshots</option>
              <option value="CHECK">Checks</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 bg-background border border-accent rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="error">Failed</option>
              <option value="running">Running</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <div className="bg-muted border border-accent rounded-lg p-12 text-center">
          <p className="text-foreground opacity-70">
            {history.length === 0
              ? 'No operation history yet. Run some operations to see them here.'
              : 'No operations match the current filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-muted border border-accent rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Device</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Test File</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Start Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Message</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent">
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-accent-hover transition-colors">
                    <td className="px-4 py-3">{getStatusIcon(entry.status)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        entry.type === 'PRE' ? 'text-blue-600' :
                        entry.type === 'POST' ? 'text-orange-600' :
                        'text-purple-600'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{entry.deviceIP}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{entry.testFile}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {new Date(entry.startTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground font-mono">
                      {formatDuration(entry)}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate" title={entry.message}>
                      {entry.message || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewDetails(entry)}
                          className="p-1 rounded hover:bg-accent transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-foreground" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="bg-background border border-accent rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-accent">
              <h3 className="text-lg font-semibold text-foreground">
                {selectedEntry.type} Operation Details
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-foreground opacity-70">Status</p>
                  <p className="font-medium text-foreground">{getStatusBadge(selectedEntry.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground opacity-70">Device</p>
                  <p className="font-medium text-foreground">{selectedEntry.deviceIP}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground opacity-70">Test File</p>
                  <p className="font-medium text-foreground">{selectedEntry.testFile}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground opacity-70">Duration</p>
                  <p className="font-medium text-foreground">{formatDuration(selectedEntry)}</p>
                </div>
              </div>

              {selectedEntry.message && (
                <div>
                  <p className="text-sm text-foreground opacity-70 mb-2">Message</p>
                  <div className="bg-accent rounded-lg p-3">
                    <p className="text-sm text-foreground">{selectedEntry.message}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-foreground opacity-70 mb-2">Timestamp</p>
                <p className="text-sm text-foreground">
                  {new Date(selectedEntry.startTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
