import React from 'react'
import ReactDOM from 'react-dom/client'
import PageSwitcher from './components/navigation/PageSwitcher.tsx'
import './index.css'

// 生产环境禁用console日志
if (import.meta.env.PROD) {
  console.log = () => {}
  console.info = () => {}
  console.warn = () => {}
  // 保留console.error用于错误追踪
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PageSwitcher />
  </React.StrictMode>,
)
