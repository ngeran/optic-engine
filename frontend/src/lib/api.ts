export type WSMessageType = 'connected' | 'log' | 'status' | 'complete' | 'error'

export interface WSMessage {
  type: WSMessageType
  data: string
  timestamp: string
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface WSHandlers {
  onConnected?: (message: WSMessage) => void
  onLog?: (message: WSMessage) => void
  onStatus?: (message: WSMessage) => void
  onComplete?: (message: WSMessage) => void
  onError?: (message: WSMessage) => void
}

export interface WSRequest {
  action: string
  data?: Record<string, unknown>
}

export interface TestFile {
  name: string
  path: string
  size: number
  created_at: string
  modified_at: string
}

export interface SnapshotFile {
  name: string
  path: string
  size: number
  created_at: string
  modified_at: string
}

export interface InventoryFile {
  name: string
  path: string
  size: number
  created_at: string
  modified_at: string
}

export interface TestFileContent {
  filename: string
  content: string
  size: number
}

export interface SnapshotContent {
  filename: string
  content: string
  size: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'

class OpticEngineAPI {
  private apiBaseUrl: string
  private wsBaseUrl: string

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || API_BASE_URL
    this.wsBaseUrl = WS_BASE_URL
  }

  async getTestFiles(): Promise<TestFile[]> {
    const response = await fetch(this.apiBaseUrl + '/testfiles')
    if (!response.ok) {
      throw new Error('Failed to fetch test files')
    }
    return response.json()
  }

  async getTestFile(filename: string): Promise<TestFileContent> {
    const response = await fetch(this.apiBaseUrl + `/testfiles/${filename}`)
    if (!response.ok) {
      throw new Error('Failed to fetch test file')
    }
    return response.json()
  }

  async saveTestFile(request: { filename: string; content: string }): Promise<{ status: string; message: string; filename: string }> {
    const response = await fetch(this.apiBaseUrl + '/testfiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: request.filename, content: request.content })
    })
    if (!response.ok) {
      throw new Error('Failed to save test file')
    }
    return response.json()
  }

  async deleteTestFile(filename: string): Promise<{ status: string; message: string }> {
    const response = await fetch(this.apiBaseUrl + `/testfiles/${filename}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete test file')
    }
    return response.json()
  }

  async getSnapshots(): Promise<SnapshotFile[]> {
    const response = await fetch(this.apiBaseUrl + '/snapshots')
    if (!response.ok) {
      throw new Error('Failed to fetch snapshots')
    }
    return response.json()
  }

  async getSnapshot(filename: string): Promise<SnapshotContent> {
    const response = await fetch(this.apiBaseUrl + `/snapshots/${filename}`)
    if (!response.ok) {
      throw new Error('Failed to fetch snapshot')
    }
    return response.json()
  }

  async deleteSnapshot(filename: string): Promise<{ status: string; message: string }> {
    const response = await fetch(this.apiBaseUrl + `/snapshots/${filename}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete snapshot')
    }
    return response.json()
  }

  async getInventories(): Promise<InventoryFile[]> {
    const response = await fetch(this.apiBaseUrl + '/inventories')
    if (!response.ok) {
      throw new Error('Failed to fetch inventories')
    }
    return response.json()
  }

  async saveInventory(request: { filename: string; content: string }): Promise<{ status: string; message: string; filename: string }> {
    const response = await fetch(this.apiBaseUrl + '/inventories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: request.filename, content: request.content })
    })
    if (!response.ok) {
      throw new Error('Failed to save inventory')
    }
    return response.json()
  }

  connectWebSocket(handlers: WSHandlers): WebSocketClient {
    return new WebSocketClient(this.wsBaseUrl, handlers)
  }
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private handlers: WSHandlers
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private state: ConnectionState = 'disconnected'

  constructor(url: string, handlers: WSHandlers) {
    this.url = url.endsWith('/') ? url + 'ws/snapshot' : url + '/ws/snapshot'
    this.handlers = handlers
    this.connect()
  }

  private connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }
    this.state = 'connecting'
    console.log('[WebSocket] Connecting to ' + this.url)
    try {
      this.ws = new WebSocket(this.url)
      this.setupEventHandlers()
    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
      this.state = 'error'
      this.scheduleReconnect()
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return
    this.ws.onopen = () => {
      console.log('[WebSocket] Connected')
      this.state = 'connected'
      this.reconnectAttempts = 0
    }
    this.ws.onclose = (event) => {
      console.log('[WebSocket] Disconnected: code=' + event.code + ', reason=' + event.reason)
      this.state = 'disconnected'
      this.scheduleReconnect()
    }
    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
      this.state = 'error'
      this.scheduleReconnect()
    }
    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error)
      }
    }
  }

  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case 'connected':
        this.handlers.onConnected?.(message)
        break
      case 'log':
        this.handlers.onLog?.(message)
        break
      case 'status':
        this.handlers.onStatus?.(message)
        break
      case 'complete':
        this.handlers.onComplete?.(message)
        break
      case 'error':
        this.handlers.onError?.(message)
        break
      default:
        console.warn('[WebSocket] Unknown message type:', message)
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached')
      return
    }
    if (this.reconnectTimeout) {
      return
    }
    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts
    console.log('[WebSocket] Reconnecting in ' + delay + 'ms (attempt ' + this.reconnectAttempts + '/' + this.maxReconnectAttempts + ')')
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null
      this.connect()
    }, delay)
  }

  send(request: WSRequest): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] Cannot send: not connected')
      return false
    }
    try {
      this.ws.send(JSON.stringify(request))
      return true
    } catch (error) {
      console.error('[WebSocket] Send error:', error)
      return false
    }
  }

  getState(): ConnectionState {
    return this.state
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.state = 'disconnected'
    this.reconnectAttempts = this.maxReconnectAttempts
  }
}

export const api = new OpticEngineAPI()
export { OpticEngineAPI, WebSocketClient }
