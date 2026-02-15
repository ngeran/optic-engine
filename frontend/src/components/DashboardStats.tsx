import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Camera, Settings, CheckCircle, XCircle } from 'lucide-react'

interface DashboardStats {
  snapshots: number
  devices: number
  testsPassed: number
  testsFailed: number
  comparisons: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    snapshots: 0,
    devices: 0,
    testsPassed: 0,
    testsFailed: 0,
    comparisons: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [snapshots, devices, testFiles] = await Promise.all([
          api.getSnapshots(),
          api.getInventories(),
          api.getTestFiles()
        ])

        // Calculate statistics
        const testsPassed = testFiles.filter(t => t.name.includes('pass')).length
        const testsFailed = testFiles.filter(t => t.name.includes('fail')).length

        setStats({
          snapshots: snapshots.length,
          devices: devices.length,
          testsPassed,
          testsFailed,
          comparisons: 0 // TODO: Calculate from history
        })
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading ? (
        <>
          <div className="bg-accent border border-accent rounded-lg p-4 animate-pulse">
            <Camera className="w-8 h-8 mb-2 text-foreground opacity-70" />
            <div className="text-2xl font-bold text-foreground">...</div>
            <div className="text-sm text-foreground opacity-70">Snapshots</div>
          </div>

          <div className="bg-accent border border-accent rounded-lg p-4 animate-pulse">
            <Settings className="w-8 h-8 mb-2 text-foreground opacity-70" />
            <div className="text-2xl font-bold text-foreground">...</div>
            <div className="text-sm text-foreground opacity-70">Devices</div>
          </div>

          <div className="bg-accent border border-accent rounded-lg p-4 animate-pulse">
            <CheckCircle className="w-8 h-8 mb-2 text-foreground opacity-70" />
            <div className="text-2xl font-bold text-foreground">...</div>
            <div className="text-sm text-foreground opacity-70">Tests Passed</div>
          </div>

          <div className="bg-accent border border-accent rounded-lg p-4 animate-pulse">
            <XCircle className="w-8 h-8 mb-2 text-foreground opacity-70" />
            <div className="text-2xl font-bold text-foreground">...</div>
            <div className="text-sm text-foreground opacity-70">Tests Failed</div>
          </div>
        </>
      ) : error ? (
        <div className="col-span-full bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <>
          <div className="bg-accent border border-accent rounded-lg p-4 hover:bg-accent-hover transition-colors">
            <Camera className="w-8 h-8 mb-2 text-foreground opacity-70" />
            <div className="text-2xl font-bold text-foreground">{stats.snapshots}</div>
            <div className="text-sm text-foreground opacity-70">Snapshot{stats.snapshots !== 1 ? 's' : ''}</div>
          </div>

          <div className="bg-accent border border-accent rounded-lg p-4 hover:bg-accent-hover transition-colors">
            <Settings className="w-8 h-8 mb-2 text-foreground opacity-70" />
            <div className="text-2xl font-bold text-foreground">{stats.devices}</div>
            <div className="text-sm text-foreground opacity-70">Device{stats.devices !== 1 ? 's' : ''}</div>
          </div>

          <div className="bg-accent border border-accent rounded-lg p-4 hover:bg-accent-hover transition-colors">
            <CheckCircle className="w-8 h-8 mb-2 text-foreground opacity-70" />
            <div className="text-2xl font-bold text-foreground">{stats.testsPassed}</div>
            <div className="text-sm text-foreground opacity-70">Tests Passed</div>
          </div>

          <div className="bg-accent border border-accent rounded-lg p-4 hover:bg-accent-hover transition-colors">
            <XCircle className="w-8 h-8 mb-2 text-foreground opacity-70" />
            <div className="text-2xl font-bold text-foreground">{stats.testsFailed}</div>
            <div className="text-sm text-foreground opacity-70">Tests Failed</div>
          </div>
        </>
      )}
    </div>
  )
}
