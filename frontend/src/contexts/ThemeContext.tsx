import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null
    const initialTheme = saved || "dark"
    console.log("ThemeContext: Initial theme from localStorage:", saved, "using:", initialTheme)
    return initialTheme
  })

  const toggleTheme = () => {
    console.log("ThemeContext: toggleTheme called, current theme:", theme)
    setTheme(prev => {
      const newTheme = prev === "dark" ? "light" : "dark"
      console.log("ThemeContext: switching from", prev, "to", newTheme)
      return newTheme
    })
  }

  useEffect(() => {
    const root = document.documentElement
    console.log("ThemeContext: useEffect - current theme:", theme, "root classes before:", root.className)
    root.classList.remove("dark", "light")
    root.classList.add(theme)
    console.log("ThemeContext: useEffect - root classes after:", root.className)

    // Debug: Check computed CSS variable value
    const computedStyle = getComputedStyle(root)
    const bgColor = computedStyle.getPropertyValue('--background')
    console.log("ThemeContext: Computed --background value:", bgColor, "expected:", theme === 'dark' ? '#000000' : '#ffffff')

    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
