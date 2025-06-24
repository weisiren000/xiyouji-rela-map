import React from 'react'
import ReactDOM from 'react-dom/client'
import PageSwitcher from './components/navigation/PageSwitcher.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PageSwitcher />
  </React.StrictMode>,
)
