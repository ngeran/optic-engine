import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import MainLayout from './components/layout/MainLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<div>Optic Engine - Dashboard Coming Soon</div>} />
                  <Route path="/tests" element={<div>Test Execution Coming Soon</div>} />
                  <Route path="/snapshots" element={<div>Snapshots Coming Soon</div>} />
                </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
