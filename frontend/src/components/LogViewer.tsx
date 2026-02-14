import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { WSMessage, ConnectionState, WSMessageType } from '@/lib/api'
import { Terminal, X, Copy, Trash2, Check, AlertCircle, Info } from 'lucide-react'

interface LogEntry {
  id: string
  type: WSMessageType
  message: string
  timestamp: string
}

interface LogViewerProps {
  onClose?: () => void
}

export function LogViewer({ onClose }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const logContainerRef = useRef<HTMLDivElement>(null)
  const prevLogCountRef = useRef(0)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current && logs.length > prevLogCountRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
      prevLogCountRef.current = logs.length
    }
  }, [logs])

  // Connect to WebSocket on mount
  useEffect(() => {
    const client = api.connectWebSocket({
      onConnected: (message: WSMessage) => {
        setConnectionState('connected')
        addLog('connected', message.data, message.timestamp)
      },
      onLog: (message: WSMessage) => {
        addLog('log', message.data, message.timestamp)
      },
      onStatus: (message: WSMessage) => {
        addLog('status', message.data, message.timestamp)
      },
      onComplete: (message: WSMessage) => {
        addLog('complete', message.data, message.timestamp)
      },
      onError: (message: WSMessage) => {
        addLog('error', message.data, message.timestamp)
      },
    })

    setConnectionState('connecting')

    return () => {
      client.disconnect()
    }
  }, [])

  const addLog = (type: WSMessageType, message: string, timestamp: string) => {
    const entry: LogEntry = {
      id: `${timestamp}-${Math.random()}`,
      type,
      message,
      timestamp,
    }
    setLogs((prev) => [...prev, entry])
  }

  const clearLogs = () => {
    setLogs([])
    prevLogCountRef.current = 0
  }

  const copyLogs = async () => {
    const logText = logs
      .map((log) => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`)
      .join('\n')
    await navigator.clipboard.writeText(logText)
  }

  const getLogIcon = (type: WSMessageType) => {
    switch (type) {
      case 'connected':
        return <Check className="w-4 h-4 text-green-500" />
      case 'log':
        return <Info className="w-4 h-4 text-blue-400" />
      case 'status':
        return <Info className="w-4 h-4 text-yellow-400" />
      case 'complete':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Terminal className="w-4 h-4 text-foreground opacity-70" />
    }
  }

  const getLogColor = (type: WSMessageType) => {
    switch (type) {
      case 'connected':
        return 'text-green-500'
      case 'log':
        return 'text-blue-400'
      case 'status':
        return 'text-yellow-400'
      case 'complete':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-foreground'
    }
  }

  return (
    <div className="bg-background border border-accent rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-accent bg-accent">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-foreground" />
          <h3 className="font-semibold text-foreground">JSNAPy Logs</h3>
          <div className="flex items-center space-x-1 ml-4">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionState === 'connected'
                  ? 'bg-green-500 animate-pulse'
                  : connectionState === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : connectionState === 'error'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
              }`}
            />
            <span className="text-xs text-foreground opacity-70 capitalize">
              {connectionState}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyLogs}
            className="p-2 rounded hover:bg-accent-hover transition-colors text-foreground"
            title="Copy logs"
            disabled={logs.length === 0}
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={clearLogs}
            className="p-2 rounded hover:bg-accent-hover transition-colors text-foreground"
            title="Clear logs"
            disabled={logs.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-accent-hover transition-colors text-foreground"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Log container */}
      <div
        ref={logContainerRef}
        className="h-96 overflow-y-auto p-4 space-y-2 bg-muted font-mono text-sm"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-foreground opacity-50">
            <div className="text-center">
              <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Waiting for logs...</p>
              <p className="text-xs mt-1">
                {connectionState === 'connected'
                  ? 'WebSocket connected'
                  : 'Connecting to WebSocket...'}
              </p>
            </div>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-2 py-1 px-2 rounded hover:bg-accent transition-colors group"
            >
              {getLogIcon(log.type)}
              <span className="text-foreground opacity-50 text-xs shrink-0 mt-0.5">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`flex-1 ${getLogColor(log.type)} break-all`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-accent bg-accent text-xs text-foreground opacity-70 flex justify-between">
        <span>{logs.length} log entries</span>
        <span>Real-time JSNAPy output</span>
      </div>
    </div>
  )
}
