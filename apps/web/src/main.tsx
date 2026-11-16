import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import { queryClient } from './lib/queryClient'
import './index.css'

// Apply saved theme before first render to avoid flash
try {
  const saved = localStorage.getItem('finance-tracker-theme')
  if (saved) {
    const { state } = JSON.parse(saved)
    if (state?.theme === 'dark') document.documentElement.classList.add('dark')
  }
} catch {
  // ignore parse errors
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
