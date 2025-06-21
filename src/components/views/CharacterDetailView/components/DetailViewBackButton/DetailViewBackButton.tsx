import React from 'react'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import './DetailViewBackButton.css'

/**
 * 详情视图返回按钮组件
 * 功能：
 * - 左上角固定定位
 * - 点击返回全局视图
 * - 简洁的图标设计
 * - 悬浮效果
 */
export const DetailViewBackButton: React.FC = () => {
  const { exitDetailView } = useGalaxyStore()

  const handleBackClick = () => {
    exitDetailView()
  }

  return (
    <button 
      className="detail-view-back-button"
      onClick={handleBackClick}
      title="返回银河系视图"
      aria-label="返回银河系视图"
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
