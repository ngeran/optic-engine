import { ThemeToggle } from "@/components/ThemeToggle"
import { WebSocketStatus } from "@/components/WebSocketStatus"

export function Header() {
  return (
    <header className="h-16 border-b border-accent bg-background">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-foreground">
            Optic Engine
          </h1>
          <span className="text-xs px-2 py-1 rounded bg-accent text-foreground">
            JSNAPy
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <WebSocketStatus />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
