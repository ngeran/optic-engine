import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import type { WSMessage, ConnectionState } from '@/lib/api'
import { Wifi, WifiOff, ChevronDown, Server, Clock, Users } from 'lucide-react'

interface ConnectionInfo {
  server: string
  status: ConnectionState
  connectedAt: string | null
  messageCount: number
  lastMessage: string | null
}

export function WebSocketStatus() {
  const [isOpen, setIsOpen] = useState(false)
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    server: api['wsBaseUrl'] || 'ws://localhost:8000',
    status: 'disconnected',
    connectedAt: null,
    messageCount: 0,
    lastMessage: null,
  })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Connect to WebSocket on mount
  useEffect(() => {
    const ws = api.connectWebSocket({
      onConnected: (message: WSMessage) => {
        setConnectionInfo((prev) => ({
          ...prev,
          status: 'connected',
          connectedAt: new Date().toISOString(),
          messageCount: prev.messageCount + 1,
          lastMessage: message.data,
        }))
      },
      onLog: (message: WSMessage) => {
        setConnectionInfo((prev) => ({
          ...prev,
          messageCount: prev.messageCount + 1,
          lastMessage: message.data,
        }))
      },
      onStatus: (message: WSMessage) => {
        setConnectionInfo((prev) => ({
          ...prev,
          messageCount: prev.messageCount + 1,
          lastMessage: message.data,
        }))
      },
      onComplete: (message: WSMessage) => {
        setConnectionInfo((prev) => ({
          ...prev,
          messageCount: prev.messageCount + 1,
          lastMessage: message.data,
        }))
      },
      onError: (message: WSMessage) => {
        setConnectionInfo((prev) => ({
          ...prev,
          status: 'error',
          messageCount: prev.messageCount + 1,
          lastMessage: message.data,
        }))
      },
    })

    setConnectionInfo((prev) => ({ ...prev, status: 'connecting' }))

    return () => {
      ws.disconnect()
    }
  }, [])

  const getStatusColor = () => {
    switch (connectionInfo.status) {
      case 'connected':
        return 'text-green-500'
      case 'connecting':
        return 'text-yellow-500 animate-pulse'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusDot = () => {
    switch (connectionInfo.status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500 animate-pulse'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDuration = (connectedAt: string | null) => {
    if (!connectedAt) return 'Not connected'
    const seconds = Math.floor((Date.now() - new Date(connectedAt).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Status Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-foreground"
        title={`WebSocket: ${connectionInfo.status.toUpperCase()}`}
      >
        {connectionInfo.status === 'connected' ? (
          <Wifi className={`w-5 h-5 ${getStatusColor()}`} />
        ) : (
          <WifiOff className={`w-5 h-5 ${getStatusColor()}`} />
        )}
        <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-accent rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-accent">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">WebSocket Connection</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
                <span className="text-xs text-foreground capitalize">
                  {connectionInfo.status}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="p-4 space-y-3">
            {/* Server */}
            <div className="flex items-start space-x-3">
              <Server className="w-4 h-4 text-foreground opacity-70 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground opacity-70">Server</div>
                <div className="text-sm text-foreground font-mono truncate">
                  {connectionInfo.server}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start space-x-3">
              <div className="w-4 h-4 mt-0.5">
                <div className={`w-3 h-3 rounded-full ${getStatusDot()}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground opacity-70">Status</div>
                <div className="text-sm text-foreground capitalize">
                  {connectionInfo.status}
                </div>
              </div>
            </div>

            {/* Connected Duration */}
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-foreground opacity-70 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground opacity-70">Duration</div>
                <div className="text-sm text-foreground">
                  {formatDuration(connectionInfo.connectedAt)}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex items-start space-x-3">
              <Users className="w-4 h-4 text-foreground opacity-70 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground opacity-70">Messages Received</div>
                <div className="text-sm text-foreground font-mono">
                  {connectionInfo.messageCount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Last Message */}
            {connectionInfo.lastMessage && (
              <div className="pt-2 border-t border-accent">
                <div className="text-xs text-foreground opacity-70 mb-1">Last Message</div>
                <div className="text-xs text-foreground font-mono bg-muted p-2 rounded border border-accent truncate">
                  {connectionInfo.lastMessage}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-accent bg-accent">
            <div className="text-xs text-foreground opacity-70">
              {connectionInfo.status === 'connected'
                ? 'Connected - Receiving real-time updates'
                : connectionInfo.status === 'connecting'
                  ? 'Connecting to server...'
                  : 'Disconnected - Reconnect required'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
