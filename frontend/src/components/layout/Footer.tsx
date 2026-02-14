export function Footer() {
  return (
    <footer className="h-12 border-t border-accent bg-background">
      <div className="h-full px-6 flex items-center justify-between text-xs text-foreground">
        <span>© 2026 Optic Engine - JSNAPy Automation Platform</span>
        <span className="flex items-center space-x-4">
          <a href="/docs" className="hover:text-white transition-colors">Documentation</a>
          <a href="/support" className="hover:text-white transition-colors">Support</a>
          <span>v1.0.0</span>
        </span>
      </div>
    </footer>
  )
}
