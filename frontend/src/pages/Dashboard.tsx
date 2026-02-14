import { useState } from 'react'
import { Zap } from 'lucide-react'
import { LogViewer } from '@/components/LogViewer'
import { LucidModal } from '@/components/LucidModal'

export function Dashboard() {
  const [showLucidModal, setShowLucidModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Log Viewer */}
      <LogViewer />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-accent border border-accent rounded-lg p-4">
          <div className="text-2xl mb-2">📸</div>
          <div className="text-sm text-foreground opacity-70">Snapshots</div>
        </div>
        <div className="bg-accent border border-accent rounded-lg p-4">
          <div className="text-2xl mb-2">🔧</div>
          <div className="text-sm text-foreground opacity-70">Devices</div>
        </div>
        <div className="bg-accent border border-accent rounded-lg p-4">
          <div className="text-2xl mb-2">🧪</div>
          <div className="text-sm text-foreground opacity-70">Tests</div>
        </div>
        <div className="bg-accent border border-accent rounded-lg p-4">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-sm text-foreground opacity-70">Lucid Run</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-muted border border-accent rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setShowLucidModal(true)}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>Run JSNAPy Operation</span>
          </button>
        </div>
      </div>
    </div>
  )
}
