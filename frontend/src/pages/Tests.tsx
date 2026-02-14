import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { TestFile, TestFileContent } from '@/lib/api'
import { FileText, Calendar, Trash2, Eye, RefreshCw, X, Pencil, Plus } from 'lucide-react'

export function Tests() {
  const [tests, setTests] = useState<TestFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showViewer, setShowViewer] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [currentTest, setCurrentTest] = useState<TestFileContent | null>(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showNewTest, setShowNewTest] = useState(false)
  const [newTestName, setNewTestName] = useState('')
  const [newTestContent, setNewTestContent] = useState('')

  const fetchTests = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getTestFiles()
      setTests(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch test files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const handleView = async (filename: string) => {
    try {
      const data = await api.getTestFile(filename)
      setCurrentTest(data)
      setShowViewer(true)
    } catch (err) {
      alert('Failed to load test file: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
      return
    }
    try {
      await api.deleteTestFile(filename)
      await fetchTests()
    } catch (err) {
      alert('Failed to delete test file: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleEdit = async (filename: string) => {
    try {
      const data = await api.getTestFile(filename)
      setCurrentTest(data)
      setEditContent(data.content)
      setShowEditor(true)
    } catch (err) {
      alert('Failed to load test file: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleSaveEdit = async () => {
    if (!currentTest) return
    setSaving(true)
    try {
      await api.saveTestFile({ filename: currentTest.filename, content: editContent })
      setShowEditor(false)
      setCurrentTest(null)
      setEditContent('')
      await fetchTests()
    } catch (err) {
      alert('Failed to save test file: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNew = async () => {
    if (!newTestName.trim() || !newTestContent.trim()) {
      alert('Please provide both filename and content')
      return
    }

    const filename = newTestName.endsWith('.yml') || newTestName.endsWith('.yaml')
      ? newTestName
      : newTestName + '.yml'

    setSaving(true)
    try {
      await api.saveTestFile({ filename, content: newTestContent })
      setShowNewTest(false)
      setNewTestName('')
      setNewTestContent('')
      await fetchTests()
    } catch (err) {
      alert('Failed to create test file: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Test Files</h2>
          <p className="text-foreground opacity-70">
            Manage JSNAPy test definitions for validation checks
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchTests}
            className="flex items-center space-x-2 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowNewTest(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Test</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tests Table */}
      <div className="bg-background border border-accent rounded-lg overflow-hidden">
        {loading && tests.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-foreground opacity-50">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 mx-auto mb-2 animate-spin" />
              <p>Loading test files...</p>
            </div>
          </div>
        ) : tests.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-foreground opacity-50">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No test files found</p>
              <p className="text-sm mt-1">Create your first test file to get started</p>
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
                {tests.map((test) => (
                  <tr
                    key={test.name}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-foreground opacity-70" />
                        <span className="text-sm font-medium text-foreground font-mono">
                          {test.name}
                        </span>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground opacity-70">
                        {formatSize(test.size)}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-foreground opacity-70">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(test.created_at)}</span>
                      </div>
                    </td>

                    {/* Modified */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground opacity-70">
                        {formatDate(test.modified_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(test.name)}
                          className="p-1.5 rounded hover:bg-accent transition-colors text-foreground"
                          title="View test"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(test.name)}
                          className="p-1.5 rounded hover:bg-accent transition-colors text-foreground"
                          title="Edit test"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.name)}
                          className="p-1.5 rounded hover:bg-red-500/20 transition-colors text-red-500"
                          title="Delete test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {tests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-accent border border-accent rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {tests.length}
            </div>
            <div className="text-sm text-foreground opacity-70">Total Test Files</div>
          </div>
          <div className="bg-accent border border-accent rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {formatSize(tests.reduce((acc, t) => acc + t.size, 0))}
            </div>
            <div className="text-sm text-foreground opacity-70">Total Size</div>
          </div>
        </div>
      )}

      {/* Viewer Modal */}
      {showViewer && currentTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-accent rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-accent">
              <h3 className="text-lg font-semibold text-foreground font-mono">{currentTest.filename}</h3>
              <button
                onClick={() => {
                  setShowViewer(false)
                  setCurrentTest(null)
                }}
                className="p-1 rounded hover:bg-accent transition-colors text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              <pre className="bg-muted p-4 rounded-lg text-sm text-foreground font-mono whitespace-pre-wrap">
                {currentTest.content}
              </pre>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-4 border-t border-accent">
              <button
                onClick={() => {
                  setShowViewer(false)
                  setCurrentTest(null)
                }}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && currentTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-accent rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-accent">
              <h3 className="text-lg font-semibold text-foreground font-mono">Edit {currentTest.filename}</h3>
              <button
                onClick={() => {
                  setShowEditor(false)
                  setCurrentTest(null)
                  setEditContent('')
                }}
                className="p-1 rounded hover:bg-accent transition-colors text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 px-3 py-2 bg-muted border border-accent rounded-lg text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-accent">
              <button
                onClick={() => {
                  setShowEditor(false)
                  setCurrentTest(null)
                  setEditContent('')
                }}
                disabled={saving}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Test Modal */}
      {showNewTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-accent rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-accent">
              <h3 className="text-lg font-semibold text-foreground">Create New Test</h3>
              <button
                onClick={() => {
                  setShowNewTest(false)
                  setNewTestName('')
                  setNewTestContent('')
                }}
                className="p-1 rounded hover:bg-accent transition-colors text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Filename
                </label>
                <input
                  type="text"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="test_bgp.yml"
                  className="w-full px-3 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  YAML Content
                </label>
                <textarea
                  value={newTestContent}
                  onChange={(e) => setNewTestContent(e.target.value)}
                  placeholder="# Enter your JSNAPy test YAML here
tests_include:
  - test_bgp_neighbors

test_bgp_neighbors:
  - command: show bgp neighbor
    iterate:
      xpath: //bgp-peer
      id: peer-address
      tests:
        - no-diff: peer-state
          info: 'BGP peer state matches'
          err: 'BGP peer state does not match'"
                  className="w-full h-96 px-3 py-2 bg-muted border border-accent rounded-lg text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-accent">
              <button
                onClick={() => {
                  setShowNewTest(false)
                  setNewTestName('')
                  setNewTestContent('')
                }}
                disabled={saving}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
