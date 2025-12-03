import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

import ErrorBoundary from './components/ErrorBoundary.tsx'
import { CurrencyProvider } from './context/CurrencyContext.tsx'
import { ExpenseProvider } from './context/ExpenseContext.tsx'

// Register PWA Service Worker
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CurrencyProvider>
        <ExpenseProvider>
          <App />
        </ExpenseProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
