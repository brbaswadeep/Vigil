import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ReplayProvider } from './state/ReplayContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReplayProvider>
      <App />
    </ReplayProvider>
  </StrictMode>,
)
