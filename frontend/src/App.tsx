import { Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { LogViewer } from "@/components/LogViewer"
import { Snapshots } from "@/pages/Snapshots"

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Log Viewer */}
      <LogViewer />

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome to Optic Engine
        </h2>
        <p className="text-foreground opacity-70">
          Your JSNAPy automation dashboard - Pre/Post change snapshots made easy
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-accent border border-accent rounded-lg p-4 hover:bg-accent-hover transition-colors">
          <div className="text-2xl mb-2">📸</div>
          <div className="text-2xl font-bold text-foreground">0</div>
          <div className="text-sm text-foreground opacity-70">Snapshots</div>
        </div>

        <div className="bg-accent border border-accent rounded-lg p-4 hover:bg-accent-hover transition-colors">
          <div className="text-2xl mb-2">🔧</div>
          <div className="text-2xl font-bold text-foreground">0</div>
          <div className="text-sm text-foreground opacity-70">Devices</div>
        </div>

        <div className="bg-accent border border-accent rounded-lg p-4 hover:bg-accent-hover transition-colors">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-2xl font-bold text-foreground">0</div>
          <div className="text-sm text-foreground opacity-70">Tests Passed</div>
        </div>

        <div className="bg-accent border border-accent rounded-lg p-4 hover:bg-accent-hover transition-colors">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-2xl font-bold text-foreground">0</div>
          <div className="text-sm text-foreground opacity-70">Comparisons</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-muted border border-accent rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-accent hover:bg-accent-hover text-foreground px-4 py-3 rounded-lg transition-colors text-left">
            <div className="text-lg mb-1">📸</div>
            <div className="font-medium">New Snapshot</div>
            <div className="text-xs opacity-70">Capture device state</div>
          </button>

          <button className="bg-accent hover:bg-accent-hover text-foreground px-4 py-3 rounded-lg transition-colors text-left">
            <div className="text-lg mb-1">🔍</div>
            <div className="font-medium">Compare Snapshots</div>
            <div className="text-xs opacity-70">Run pre/post checks</div>
          </button>

          <button className="bg-accent hover:bg-accent-hover text-foreground px-4 py-3 rounded-lg transition-colors text-left">
            <div className="text-lg mb-1">➕</div>
            <div className="font-medium">Add Device</div>
            <div className="text-xs opacity-70">Configure new device</div>
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/snapshots" element={<Snapshots />} />
      </Routes>
    </Layout>
  )
}

export default App
