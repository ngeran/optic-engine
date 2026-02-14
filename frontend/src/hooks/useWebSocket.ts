import { useEffect, useRef, useState, useCallback } from 'react'

interface UseWebSocketReturn {
  isConnected: boolean
  isConnecting: boolean
  logs: string[]
  sendMessage: (message: any) => void
  connect: () => void
  disconnect: () => void
  error: string | null
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        addLog('info', 'WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          addLog(message.type, message.data)

          if (message.type === 'complete') {
            // Re-enable buttons after completion
          }
        } catch (e) {
          // If not JSON, add as plain text
          addLog('log', event.data)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection failed')
        addLog('error', 'Connection error')
        setIsConnected(false)
      }

      ws.onclose = () => {
        setIsConnected(false)
        setIsConnecting(false)
        addLog('info', 'WebSocket disconnected')
      }
    } catch (e) {
      setError('Failed to connect: ' + (e as Error).message)
      setIsConnecting(false)
    }
  }, [url])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    wsRef.current?.close()
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  const addLog = useCallback((type: string, data: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] [${type.toUpperCase()}] ${data}`])
  }, [])

  useEffect(() => {
    // Auto-connect on mount
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [url, connect])

  return {
    isConnected,
    isConnecting,
    logs,
    sendMessage,
    connect,
    disconnect,
    error,
  }
}
