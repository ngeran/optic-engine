import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { InventoryFile } from '@/lib/api'
import { Server, Plus, Trash2, Save, Download } from 'lucide-react'

interface Device {
  ip: string
  username: string
  password: string
}

interface DeviceGroup {
  name: string
  devices: Device[]
}

export function Devices() {
  const [inventoryFiles, setInventoryFiles] = useState<InventoryFile[]>([])
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newDeviceIP, setNewDeviceIP] = useState('')
  const [newDeviceUsername, setNewDeviceUsername] = useState('')
  const [newDevicePassword, setNewDevicePassword] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')

  // Fetch inventory files on mount
  useEffect(() => {
    fetchInventories()
  }, [])

  const fetchInventories = async () => {
    setLoading(true)
    try {
      const files = await api.getInventories()
      setInventoryFiles(files)
    } catch (error) {
      console.error('Failed to fetch inventories:', error)
    } finally {
      setLoading(false)
    }
  }

  const addGroup = () => {
    if (!newGroupName.trim()) return
    const group: DeviceGroup = {
      name: newGroupName.trim(),
      devices: []
    }
    setDeviceGroups([...deviceGroups, group])
    setNewGroupName('')
  }

  const removeGroup = (groupName: string) => {
    setDeviceGroups(deviceGroups.filter(g => g.name !== groupName))
  }

  const addDevice = () => {
    if (!newDeviceIP.trim() || !selectedGroup) return

    const device: Device = {
      ip: newDeviceIP.trim(),
      username: newDeviceUsername.trim() || 'root',
      password: newDevicePassword.trim()
    }

    setDeviceGroups(deviceGroups.map(group => {
      if (group.name === selectedGroup) {
        return {
          ...group,
          devices: [...group.devices, device]
        }
      }
      return group
    }))

    setNewDeviceIP('')
    setNewDeviceUsername('')
    setNewDevicePassword('')
  }

  const removeDevice = (groupName: string, deviceIP: string) => {
    setDeviceGroups(deviceGroups.map(group => {
      if (group.name === groupName) {
        return {
          ...group,
          devices: group.devices.filter(d => d.ip !== deviceIP)
        }
      }
      return group
    }))
  }

  const generateYAML = () => {
    if (deviceGroups.length === 0) return ''

    let yaml = ''
    deviceGroups.forEach(group => {
      yaml += `${group.name}:\n`
      group.devices.forEach(device => {
        yaml += `  - ${device.ip}:\n`
        yaml += `      username: ${device.username}\n`
        yaml += `      passwd: ${device.password}\n`
      })
      yaml += '\n'
    })
    return yaml
  }

  const saveInventory = async () => {
    const fileName = currentFile || `inventory_${Date.now()}.yml`
    const yaml = generateYAML()

    if (!yaml.trim()) {
      alert('No device groups to save')
      return
    }

    try {
      await api.saveInventory({ filename: fileName, content: yaml })
      alert(`Inventory saved as ${fileName}`)
      await fetchInventories()
    } catch (error) {
      alert(`Failed to save inventory: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const downloadInventory = () => {
    const yaml = generateYAML()
    const fileName = currentFile || `inventory_${Date.now()}.yml`

    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Device Inventory</h2>
          <p className="text-foreground opacity-70">
            Manage and organize device groups for JSNAPy operations
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={downloadInventory}
            className="flex items-center space-x-2 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground"
          >
            <Download className="w-4 h-4" />
            <span>Export YAML</span>
          </button>
          <button
            onClick={saveInventory}
            disabled={deviceGroups.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>Save to Server</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Files Panel */}
        <div className="lg:col-span-1 bg-background border border-accent rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Inventory Files</h3>
            <button className="p-2 rounded hover:bg-accent transition-colors text-foreground" title="Create new inventory">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-foreground opacity-50 text-sm">
                Loading...
              </div>
            ) : inventoryFiles.length === 0 ? (
              <div className="text-center py-8 text-foreground opacity-50 text-sm">
                No inventory files yet
              </div>
            ) : (
              inventoryFiles.map((file) => (
                <div
                  key={file.name}
                  onClick={() => {
                    setCurrentFile(file.name)
                    alert(`Load ${file.name} - Implementation to be added`)
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentFile === file.name
                      ? 'bg-accent-hover border-2 border-accent'
                      : 'bg-accent hover:bg-accent-hover'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-foreground opacity-70" />
                    <span className="text-sm font-medium text-foreground">{file.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Device Group */}
          <div className="bg-background border border-accent rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Add Device Group</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGroup()}
                placeholder="Group name (e.g., MX, EX, QFX)"
                className="flex-1 px-3 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={addGroup}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add Device */}
          <div className="bg-background border border-accent rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Add Device</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-3 py-2 bg-background border border-accent rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Group</option>
                {deviceGroups.map((group) => (
                  <option key={group.name} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={newDeviceIP}
                onChange={(e) => setNewDeviceIP(e.target.value)}
                placeholder="Device IP (e.g., 10.20.1.20)"
                className="px-3 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
              />

              <input
                type="text"
                value={newDeviceUsername}
                onChange={(e) => setNewDeviceUsername(e.target.value)}
                placeholder="Username (default: root)"
                className="px-3 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
              />

              <input
                type="password"
                value={newDevicePassword}
                onChange={(e) => setNewDevicePassword(e.target.value)}
                placeholder="Password"
                className="px-3 py-2 bg-background border border-accent rounded-lg text-foreground placeholder:text-foreground opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <button
              onClick={addDevice}
              disabled={!selectedGroup || !newDeviceIP.trim()}
              className="mt-3 w-full px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Device
            </button>
          </div>

          {/* Device Groups Display */}
          <div className="space-y-4">
            {deviceGroups.length === 0 ? (
              <div className="bg-background border border-accent rounded-lg p-8 text-center">
                <Server className="w-12 h-12 mx-auto mb-3 text-foreground opacity-50" />
                <p className="text-foreground opacity-70">No device groups yet</p>
                <p className="text-sm text-foreground opacity-50 mt-1">
                  Create a group and add devices to get started
                </p>
              </div>
            ) : (
              deviceGroups.map((group) => (
                <div
                  key={group.name}
                  className="bg-background border border-accent rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground flex items-center space-x-2">
                      <Server className="w-4 h-4" />
                      <span>{group.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-accent rounded-full">
                        {group.devices.length} devices
                      </span>
                    </h4>
                    <button
                      onClick={() => removeGroup(group.name)}
                      className="p-1 rounded hover:bg-red-500/20 transition-colors text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {group.devices.length === 0 ? (
                    <p className="text-sm text-foreground opacity-50 text-center py-4">
                      No devices in this group
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {group.devices.map((device) => (
                        <div
                          key={device.ip}
                          className="flex items-center justify-between p-3 bg-accent rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground font-mono">
                              {device.ip}
                            </div>
                            <div className="text-xs text-foreground opacity-70">
                              {device.username}
                            </div>
                          </div>
                          <button
                            onClick={() => removeDevice(group.name, device.ip)}
                            className="p-1 rounded hover:bg-red-500/20 transition-colors text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* YAML Preview */}
          {deviceGroups.length > 0 && (
            <div className="bg-background border border-accent rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">YAML Preview</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs text-foreground font-mono max-h-64">
                {generateYAML()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
