import { Routes, Route, Link } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { DashboardStats } from "@/components/DashboardStats"
import { Snapshots } from "@/pages/Snapshots"
import { Devices } from "@/pages/Devices"
import { Tests } from "@/pages/Tests"
import { Operations } from "@/pages/Operations"
import { History } from "@/pages/History"
import { Documentation } from "@/pages/Documentation"
import { Camera, GitCompare, Plus } from 'lucide-react'

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome to Optic Engine
        </h2>
        <p className="text-foreground opacity-70">
          Your JSNAPy automation dashboard - Pre/Post change snapshots made easy
        </p>
      </div>

      {/* Quick Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="bg-muted border border-accent rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/operations" className="bg-accent hover:bg-accent-hover text-foreground px-4 py-3 rounded-lg transition-colors text-left">
            <Camera className="w-6 h-6 mb-1 text-foreground opacity-70" />
            <div className="font-medium">New Snapshot</div>
            <div className="text-xs opacity-70">Capture device state</div>
          </Link>

          <Link to="/operations" className="bg-accent hover:bg-accent-hover text-foreground px-4 py-3 rounded-lg transition-colors text-left">
            <GitCompare className="w-6 h-6 mb-1 text-foreground opacity-70" />
            <div className="font-medium">Compare Snapshots</div>
            <div className="text-xs opacity-70">Run pre/post checks</div>
          </Link>

          <Link to="/devices" className="bg-accent hover:bg-accent-hover text-foreground px-4 py-3 rounded-lg transition-colors text-left">
            <Plus className="w-6 h-6 mb-1 text-foreground opacity-70" />
            <div className="font-medium">Add Device</div>
            <div className="text-xs opacity-70">Configure new device</div>
          </Link>
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
        <Route path="/operations" element={<Operations />} />
        <Route path="/snapshots" element={<Snapshots />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/history" element={<History />} />
        <Route path="/docs" element={<Documentation />} />
      </Routes>
    </Layout>
  )
}

export default App
