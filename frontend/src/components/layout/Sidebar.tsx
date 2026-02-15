import { Link } from 'react-router-dom'
import { LayoutDashboard, Zap, Camera, Settings, TestTube, History as HistoryIcon } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Operations', icon: Zap, href: '/operations' },
    { name: 'Snapshots', icon: Camera, href: '/snapshots' },
    { name: 'Devices', icon: Settings, href: '/devices' },
    { name: 'Tests', icon: TestTube, href: '/tests' },
    { name: 'History', icon: HistoryIcon, href: '/history' },
  ]

  return (
    <>
      {/* Overlay when collapsed on mobile */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-16 left-0 z-40 w-16 h-12 flex items-center justify-center bg-accent hover:bg-accent-hover transition-colors border-r border-accent"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-30 h-[calc(100vh-4rem-3rem)] transition-all duration-300
          ${isOpen ? 'w-64' : 'w-0 -translate-x-full'}
          bg-background border-r border-accent
          overflow-hidden
        `}
      >
        <div className="w-64 h-full flex flex-col">
          {/* Close button */}
          <div className="p-4 border-b border-accent flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Navigation</span>
            <button
              onClick={onToggle}
              className="p-1 rounded hover:bg-accent transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:bg-accent hover:text-white transition-colors"
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 768) {
                        onToggle()
                      }
                    }}
                  >
                    <item.icon className="w-5 h-5 text-foreground opacity-70" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
