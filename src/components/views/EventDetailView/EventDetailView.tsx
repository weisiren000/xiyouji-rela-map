import React from 'react'
import { EventDetailScene } from '../../three/Scenes/EventDetailScene'
import { EventDetailPanel } from '../../panels/EventDetailPanel'
import { DetailViewBackButton } from '../CharacterDetailView/components/DetailViewBackButton'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import './EventDetailView.css'

/**
 * 事件详情视图组件
 * 功能：
 * - 左右分屏布局：左侧3D场景，右侧信息面板
 * - 左上角返回按钮
 * - 响应式设计
 * - 专门用于显示西游记81难事件详情
 */
export const EventDetailView: React.FC = () => {
  const { selectedEvent } = useGalaxyStore()

  // 如果没有选中事件，不应该渲染此组件
  if (!selectedEvent) {
    return (
      <div className="event-detail-view">
        <div className="detail-error">
          <h2>错误：未选择事件</h2>
          <p>请返回主视图选择一个事件</p>
        </div>
      </div>
    )
  }

  return (
    <div className="event-detail-view">
      {/* 返回按钮 */}
      <DetailViewBackButton />
      
      {/* 主要内容区域 */}
      <div className="detail-content">
        {/* 左侧：3D场景 */}
        <div className="detail-scene-container">
          <EventDetailScene />
        </div>
        
        {/* 右侧：信息面板 */}
        <div className="detail-panel-container">
          <EventDetailPanel event={selectedEvent} />
        </div>
      </div>
    </div>
  )
}

export default EventDetailView
