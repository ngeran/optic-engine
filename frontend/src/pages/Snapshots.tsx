import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { SnapshotFile, SnapshotContent } from '@/lib/api'
import { Camera, Calendar, FileText, Trash2, Eye, RefreshCw, X } from 'lucide-react'

export function Snapshots() {
  const [snapshots, setSnapshots] = useState<SnapshotFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showViewer, setShowViewer] = useState(false)
  const [currentSnapshot, setCurrentSnapshot] = useState<SnapshotContent | null>(null)

  const fetchSnapshots = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getSnapshots()
      setSnapshots(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch snapshots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSnapshots()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getSnapshotType = (name: string): 'pre' | 'post' => {
    if (name.includes('_post_') || name.includes('-post-') || name.startsWith('post_')) {
      return 'post'
    }
    return 'pre'
  }

  const handleView = async (filename: string) => {
    try {
      const data = await api.getSnapshot(filename)
      setCurrentSnapshot(data)
      setShowViewer(true)
    } catch (err) {
      alert('Failed to load snapshot: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
      return
    }
    try {
      await api.deleteSnapshot(filename)
      await fetchSnapshots()
    } catch (err) {
      alert('Failed to delete snapshot: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Snapshots</h2>
          <p className="text-foreground opacity-70">
            View and manage JSNAPy device snapshots
          </p>
        </div>
        <button
          onClick={fetchSnapshots}
          className="flex items-center space-x-2 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Snapshots Table */}
      <div className="bg-background border border-accent rounded-lg overflow-hidden">
        {loading && snapshots.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-foreground opacity-50">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 mx-auto mb-2 animate-spin" />
              <p>Loading snapshots...</p>
            </div>
          </div>
        ) : snapshots.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-foreground opacity-50">
            <div className="text-center">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No snapshots found</p>
              <p className="text-sm mt-1">Create your first snapshot to get started</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent">
                {snapshots.map((snapshot) => {
                  const type = getSnapshotType(snapshot.name)
                  return (
                    <tr
                      key={snapshot.name}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-foreground opacity-70" />
                          <span className="text-sm font-medium text-foreground font-mono">
                            {snapshot.name}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            type === 'pre'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {type.toUpperCase()}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground opacity-70">
                          {formatSize(snapshot.size)}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 text-sm text-foreground opacity-70">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(snapshot.created_at)}</span>
                        </div>
                      </td>

                      {/* Modified */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground opacity-70">
                          {formatDate(snapshot.modified_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(snapshot.name)}
                            className="p-1.5 rounded hover:bg-accent transition-colors text-foreground"
                            title="View snapshot"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(snapshot.name)}
                            className="p-1.5 rounded hover:bg-red-500/20 transition-colors text-red-500"
                            title="Delete snapshot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {snapshots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-accent border border-accent rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {snapshots.filter((s) => getSnapshotType(s.name) === 'pre').length}
            </div>
            <div className="text-sm text-foreground opacity-70">Pre Snapshots</div>
          </div>
          <div className="bg-accent border border-accent rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {snapshots.filter((s) => getSnapshotType(s.name) === 'post').length}
            </div>
            <div className="text-sm text-foreground opacity-70">Post Snapshots</div>
          </div>
          <div className="bg-accent border border-accent rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {formatSize(snapshots.reduce((acc, s) => acc + s.size, 0))}
            </div>
            <div className="text-sm text-foreground opacity-70">Total Size</div>
          </div>
        </div>
      )}

      {/* Viewer Modal */}
      {showViewer && currentSnapshot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-accent rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-accent">
              <h3 className="text-lg font-semibold text-foreground font-mono">{currentSnapshot.filename}</h3>
              <button
                onClick={() => {
                  setShowViewer(false)
                  setCurrentSnapshot(null)
                }}
                className="p-1 rounded hover:bg-accent transition-colors text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              <pre className="bg-muted p-4 rounded-lg text-sm text-foreground font-mono whitespace-pre-wrap">
                {currentSnapshot.content}
              </pre>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-4 border-t border-accent">
              <button
                onClick={() => {
                  setShowViewer(false)
                  setCurrentSnapshot(null)
                }}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
