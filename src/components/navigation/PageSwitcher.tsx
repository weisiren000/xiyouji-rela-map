import React, { useState } from 'react'
import App from '../../App'
import EmptyGalaxyPage from '../../pages/EmptyGalaxyPage'

/**
 * 页面切换器组件
 * 提供在主页面和八十一难页面之间切换的功能
 * 默认加载八十一难页面作为首页
 */
export const PageSwitcher: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'main' | 'empty'>('empty')

  const switchToMain = () => setCurrentPage('main')
  const switchToEmpty = () => setCurrentPage('empty')

  return (
    <>
      {/* 页面切换按钮 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '200px', // 移到右边一些，避免与ModelQuickAccess重叠
        zIndex: 1000,
        display: 'flex',
        gap: '12px' // 增加按钮间距
      }}>
        <button
          onClick={switchToMain}
          style={{
            padding: '10px 16px',
            background: currentPage === 'main' ? '#4CAF50' : 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: currentPage === 'main' ? '1px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          🌌 主页面
        </button>
        <button
          onClick={switchToEmpty}
          style={{
            padding: '10px 16px',
            background: currentPage === 'empty' ? '#4CAF50' : 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: currentPage === 'empty' ? '1px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          ⭐ 八十一难
        </button>
      </div>

      {/* 根据当前页面渲染对应组件 */}
      {currentPage === 'main' ? <App /> : <EmptyGalaxyPage />}
    </>
  )
}

export default PageSwitcher
