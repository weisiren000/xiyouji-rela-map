import React from 'react'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import './DetailViewBackButton.css'

/**
 * 详情视图返回按钮组件
 * 功能：
 * - 左上角固定定位
 * - 点击返回上一个页面（主页面或八十一难页面）
 * - 简洁的图标设计
 * - 悬浮效果
 */
export const DetailViewBackButton: React.FC = () => {
  const { goBack, navigationHistory } = useGalaxyStore()

  const handleBackClick = () => {
    // 使用导航历史栈进行智能返回
    goBack()
  }

  // 根据导航历史确定返回目标
  const getBackTitle = () => {
    if (navigationHistory.length === 0) {
      return '返回'
    }

    const previousState = navigationHistory[navigationHistory.length - 1]
    const pageName = previousState.page === 'main' ? '主页面' : '八十一难页面'

    if (previousState.viewMode === 'galaxy') {
      return `返回${pageName}`
    } else if (previousState.selectedEvent) {
      return `返回事件详情视图`
    } else if (previousState.selectedCharacter) {
      return `返回角色详情视图`
    } else {
      return `返回${pageName}`
    }
  }

  const backTitle = getBackTitle()

  return (
    <button
      className="detail-view-back-button"
      onClick={handleBackClick}
      title={backTitle}
      aria-label={backTitle}
    >
      {/* 返回箭头图标 */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="back-icon"
      >
        <path 
          d="M19 12H5M12 19L5 12L12 5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      {/* 按钮文字 */}
      <span className="back-text">返回</span>
    </button>
  )
}

export default DetailViewBackButton
