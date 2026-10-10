import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ReplayProvider } from './state/ReplayContext.jsx'
import { PolicyProvider } from './state/PolicyContext.jsx'
import { AuthProvider } from './state/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ReplayProvider>
        <PolicyProvider>
          <App />
        </PolicyProvider>
      </ReplayProvider>
    </AuthProvider>
  </StrictMode>,
)
