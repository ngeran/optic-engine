import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="h-12 border-t border-accent bg-background">
      <div className="h-full px-6 flex items-center justify-between text-xs text-foreground">
        <span>© 2026 Optic Engine - JSNAPy Automation Platform</span>
        <span className="flex items-center space-x-4">
          <Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link>
          <span>v1.0.0</span>
        </span>
      </div>
    </footer>
  )
}
