import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'

const root = document.getElementById('root') as HTMLElement

if (root) {
  ReactDOM.createRoot(
    <StrictMode>
      <App />
    </StrictMode>,
    root,
  )
}

throw new Error('Root element not found. Ensure index.html has a valid root element.')
