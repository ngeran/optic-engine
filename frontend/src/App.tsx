import { Routes, Route, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/Layout"
import { DashboardStats } from "@/components/DashboardStats"
import { Snapshots } from "@/pages/Snapshots"
import { Devices } from "@/pages/Devices"
import { Tests } from "@/pages/Tests"
import { Operations } from "@/pages/Operations"
import { History } from "@/pages/History"
import { Documentation } from "@/pages/Documentation"
import { type OperationResult } from "@/components/ResultsCard"
import { Camera, GitCompare, Plus, Clock, CheckCircle, XCircle, ArrowRight, TrendingUp, Activity, BookOpen, AlertCircle } from 'lucide-react'

// Load history from localStorage
const loadHistory = (): OperationResult[] => {
  try {
    const saved = localStorage.getItem('operation_history')
    if (saved) {
      return JSON.parse(saved)
    }
    return []
  } catch (err) {
    console.error('Failed to load history from localStorage:', err)
    return []
  }
}

function Dashboard() {
  const [recentActivity, setRecentActivity] = useState<OperationResult[]>([])
  const [systemStatus, setSystemStatus] = useState({
    totalOperations: 0,
    successRate: 0,
    lastActivity: null as Date | null
  })

  useEffect(() => {
    // Load recent activity
    const history = loadHistory()
    const recent = history.slice(0, 5)
    setRecentActivity(recent)

    // Calculate system status
    const total = history.length
    const successful = history.filter(h => h.status === 'success').length
    const lastOp = history.length > 0 ? new Date(history[0].startTime) : null

    setSystemStatus({
      totalOperations: total,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      lastActivity: lastOp
    })

    // Listen for storage changes
    const handleStorageChange = () => {
      const updated = loadHistory()
      setRecentActivity(updated.slice(0, 5))
      const newTotal = updated.length
      const newSuccessful = updated.filter(h => h.status === 'success').length
      const newLastOp = updated.length > 0 ? new Date(updated[0].startTime) : null
      setSystemStatus({
        totalOperations: newTotal,
        successRate: newTotal > 0 ? Math.round((newSuccessful / newTotal) * 100) : 0,
        lastActivity: newLastOp
      })
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const getStatusIcon = (status: OperationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-primary" />
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-foreground opacity-50" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-accent rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Optic Engine
            </h2>
            <p className="text-foreground opacity-70">
              Your JSNAPy automation dashboard - Pre/Post change snapshots made easy
            </p>
          </div>
          <Link
            to="/docs"
            className="hidden md:flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">View Docs</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/operations"
            className="group relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 border border-primary/30 hover:border-primary/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
          >
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-3 h-3" />
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-primary/20">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                PRE
              </div>
            </div>
            <h4 className="font-semibold text-foreground mb-1">New Snapshot</h4>
            <p className="text-sm text-foreground opacity-70">Capture device state before changes</p>
          </Link>

          <Link
            to="/operations"
            className="group relative overflow-hidden bg-gradient-to-br from-orange-500/20 to-orange-500/5 hover:from-orange-500/30 hover:to-orange-500/10 border border-orange-500/30 hover:border-orange-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1"
          >
            <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-3 h-3" />
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-orange-500/20">
                <GitCompare className="w-6 h-6 text-orange-500" />
              </div>
              <div className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium">
                CHECK
              </div>
            </div>
            <h4 className="font-semibold text-foreground mb-1">Compare Snapshots</h4>
            <p className="text-sm text-foreground opacity-70">Validate changes with pre/post checks</p>
          </Link>

          <Link
            to="/devices"
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-blue-500/5 hover:from-blue-500/30 hover:to-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
          >
            <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-3 h-3" />
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20">
                <Plus className="w-6 h-6 text-blue-500" />
              </div>
              <div className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                NEW
              </div>
            </div>
            <h4 className="font-semibold text-foreground mb-1">Add Device</h4>
            <p className="text-sm text-foreground opacity-70">Configure and manage network devices</p>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-muted border border-accent rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            </div>
            <Link to="/history" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-foreground opacity-30 mx-auto mb-3" />
              <p className="text-sm text-foreground opacity-70">No recent activity</p>
              <p className="text-xs text-foreground opacity-50 mt-1">Run operations to see activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-background hover:bg-accent transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">{activity.type}</span>
                      <span className="text-xs text-foreground opacity-50">•</span>
                      <span className="text-xs text-foreground opacity-70">{activity.deviceIP}</span>
                    </div>
                    <p className="text-xs text-foreground opacity-60 mt-0.5 truncate">
                      {activity.testFile}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-foreground opacity-50">
                    {formatTimeAgo(new Date(activity.startTime))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-muted border border-accent rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">System Status</h3>
          </div>

          <div className="space-y-4">
            {/* Success Rate */}
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground opacity-70">Success Rate</span>
                <span className="text-2xl font-bold text-primary">{systemStatus.successRate}%</span>
              </div>
              <div className="w-full bg-accent rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${systemStatus.successRate}%` }}
                />
              </div>
            </div>

            {/* Total Operations */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{systemStatus.totalOperations}</div>
                <div className="text-xs text-foreground opacity-70 mt-1">Total Operations</div>
              </div>
              <div className="bg-background rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {systemStatus.totalOperations > 0 ? Math.round(systemStatus.totalOperations * 0.67) : 0}
                </div>
                <div className="text-xs text-foreground opacity-70 mt-1">Snapshots Taken</div>
              </div>
            </div>

            {/* Last Activity */}
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-foreground opacity-70" />
                  <span className="text-sm text-foreground opacity-70">Last Activity</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {systemStatus.lastActivity ? formatTimeAgo(systemStatus.lastActivity) : 'Never'}
                </span>
              </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Quick Tip</p>
                  <p className="text-foreground opacity-80">
                    Always capture a PRE snapshot before making changes, then POST after changes, and run CHECK to validate.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
