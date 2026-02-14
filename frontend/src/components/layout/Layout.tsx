import { useState, ReactNode } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { Footer } from "./Footer"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main
          className="flex-1 overflow-y-auto"
          style={{
            marginLeft: sidebarOpen ? "16rem" : "0",
            transition: "margin-left 300ms"
          }}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
