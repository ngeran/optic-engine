import { CheckCircle, XCircle, Clock, FileText, Server } from 'lucide-react'
import { useState } from 'react'

export type OperationStatus = 'pending' | 'running' | 'success' | 'error'

export interface OperationResult {
  id: string
  type: 'PRE' | 'POST' | 'CHECK'
  status: OperationStatus
  deviceIP: string
  testFile: string
  startTime: string
  endTime?: string
  duration?: string
  message?: string
  summary?: {
    total_tests?: number
    passed?: number
    failed?: number
  }
  logs?: Array<{ timestamp: string; message: string; type: 'info' | 'error' | 'success' }>
}

interface ResultsCardProps {
  result: OperationResult
  onClear?: () => void
}

export function ResultsCard({ result, onClear }: ResultsCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getStatusIcon = () => {
    switch (result.status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'running':
        return <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />
      default:
        return <Clock className="w-6 h-6 text-foreground opacity-50" />
    }
  }

  const getStatusText = () => {
    switch (result.status) {
      case 'success':
        return 'Completed Successfully'
      case 'error':
        return 'Failed'
      case 'running':
        return 'Running...'
      default:
        return 'Pending'
    }
  }

  const getStatusColor = () => {
    switch (result.status) {
      case 'success':
        return 'border-green-500 bg-green-500/10'
      case 'error':
        return 'border-red-500 bg-red-500/10'
      case 'running':
        return 'border-yellow-500 bg-yellow-500/10'
      default:
        return 'border-accent bg-muted'
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  return (
    <div className={`border rounded-lg p-6 ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-foreground">
                {result.type} Operation
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                result.status === 'success'
                  ? 'bg-green-600 text-white'
                  : result.status === 'error'
                  ? 'bg-red-600 text-white'
                  : result.status === 'running'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-accent text-foreground'
              }`}>
                {getStatusText()}
              </span>
            </div>
            <p className="text-sm text-foreground opacity-70 mt-1">
              {new Date(result.startTime).toLocaleString()}
            </p>
          </div>
        </div>
        {result.status !== 'running' && onClear && (
          <button
            onClick={onClear}
            className="text-sm text-foreground opacity-70 hover:opacity-100"
          >
            Clear
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-foreground opacity-70" />
          <div>
            <p className="text-xs text-foreground opacity-70">Device</p>
            <p className="text-sm font-medium text-foreground">{result.deviceIP || 'Default'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-foreground opacity-70" />
          <div>
            <p className="text-xs text-foreground opacity-70">Test File</p>
            <p className="text-sm font-medium text-foreground">{result.testFile}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-foreground opacity-70" />
          <div>
            <p className="text-xs text-foreground opacity-70">Duration</p>
            <p className="text-sm font-medium text-foreground">
              {result.duration || (result.endTime ? formatDuration(new Date(result.endTime).getTime() - new Date(result.startTime).getTime()) : 'N/A')}
            </p>
          </div>
        </div>

        {result.summary && result.summary.total_tests !== undefined && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-foreground opacity-70" />
            <div>
              <p className="text-xs text-foreground opacity-70">Tests</p>
              <p className="text-sm font-medium text-foreground">
                {result.summary.passed}/{result.summary.total_tests} passed
                {result.summary.failed !== undefined && result.summary.failed > 0 && (
                  <span className="text-red-600 ml-1">({result.summary.failed} failed)</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message */}
      {result.message && (
        <div className={`p-3 rounded-lg mb-4 ${
          result.status === 'error' ? 'bg-red-500/20' : 'bg-accent'
        }`}>
          <p className="text-sm text-foreground">{result.message}</p>
        </div>
      )}

      {/* Logs Expandable */}
      {result.logs && result.logs.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-foreground opacity-70 hover:opacity-100 flex items-center space-x-2"
          >
            <span>{expanded ? 'Hide' : 'Show'} Logs ({result.logs.length})</span>
          </button>

          {expanded && (
            <div className="mt-3 max-h-60 overflow-y-auto bg-background border border-accent rounded-lg p-3">
              {result.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`mb-1 text-sm font-mono ${
                    log.type === 'error' ? 'text-red-500' :
                    log.type === 'success' ? 'text-green-600' :
                    'text-foreground'
                  }`}
                >
                  <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons for running operations */}
      {result.status === 'running' && (
        <div className="flex items-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-foreground">Operation in progress...</span>
        </div>
      )}
    </div>
  )
}
