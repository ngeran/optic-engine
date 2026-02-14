import { ThemeContext } from '../../contexts/ThemeContext'

export default function Header() {
  const { theme, setTheme } = useContext(ThemeContext)

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-foreground">Optic Engine</h1>
          <span className="text-sm text-muted-foreground">JSNAPy Web Interface</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status Placeholder */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="text-sm text-muted-foreground">WebSocket: Connecting...</span>
          </div>

          {/* Theme Toggle Placeholder */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md border border-border bg-card hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            <span className="text-sm">Theme</span>
          </button>
        </div>
      </div>
    </header>
  )
}
