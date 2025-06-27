import React from 'react'
import { EventData } from '@/types/events'
import './EventDetailPanel.css'

interface EventDetailPanelProps {
  event: EventData
}

/**
 * 事件详情面板组件
 * 功能：
 * - 显示西游记81难事件的详细信息
 * - 包含事件名称、难次、人物、地点、描述等
 * - 美观的卡片式布局
 * - 渐变色彩设计
 */
export const EventDetailPanel: React.FC<EventDetailPanelProps> = ({ event }) => {
  // 根据难次生成渐变颜色
  const getProgressColor = (nanci: number) => {
    const progress = (nanci - 1) / 80 // 0-1之间
    if (progress < 0.33) {
      // 蓝色到紫色
      const r = Math.round(100 + progress * 3 * 155)
      const g = Math.round(150 - progress * 3 * 100)
      const b = 255
      return `rgb(${r}, ${g}, ${b})`
    } else if (progress < 0.66) {
      // 紫色到粉色
      const localProgress = (progress - 0.33) / 0.33
      const r = Math.round(255)
      const g = Math.round(50 + localProgress * 100)
      const b = Math.round(255 - localProgress * 100)
      return `rgb(${r}, ${g}, ${b})`
    } else {
      // 粉色到金色
      const localProgress = (progress - 0.66) / 0.34
      const r = 255
      const g = Math.round(150 + localProgress * 105)
      const b = Math.round(155 - localProgress * 155)
      return `rgb(${r}, ${g}, ${b})`
    }
  }

  const progressColor = getProgressColor(event.nanci)
  const progressPercent = ((event.nanci - 1) / 80) * 100

  return (
    <div className="event-detail-panel">
      {/* 标题区域 */}
      <div className="event-header">
        <div className="event-title-section">
          <h1 className="event-title">{event.nanming}</h1>
          <div className="event-subtitle">
            <span className="difficulty-badge" style={{ backgroundColor: progressColor }}>
              第 {event.nanci} 难
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: progressColor 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 详细信息区域 */}
      <div className="event-details">
        {/* 基本信息 */}
        <div className="info-section">
          <h3 className="section-title">基本信息</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">主要人物</span>
              <span className="info-value">{event.zhuyaorenwu}</span>
            </div>
            <div className="info-item">
              <span className="info-label">发生地点</span>
              <span className="info-value">{event.didian}</span>
            </div>
          </div>
        </div>

        {/* 事件描述 */}
        <div className="info-section">
          <h3 className="section-title">事件描述</h3>
          <p className="event-description">{event.shijianmiaoshu}</p>
        </div>

        {/* 象征意义 */}
        <div className="info-section">
          <h3 className="section-title">象征意义</h3>
          <p className="event-meaning">{event.xiangzhengyi}</p>
        </div>

        {/* 文化内涵 */}
        <div className="info-section">
          <h3 className="section-title">文化内涵</h3>
          <p className="event-culture">{event.wenhuaneihan}</p>
        </div>

        {/* 元数据 */}
        {event.metadata && (
          <div className="info-section metadata-section">
            <h3 className="section-title">数据信息</h3>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label">数据源</span>
                <span className="metadata-value">{event.metadata.source}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">验证状态</span>
                <span className={`metadata-value ${event.metadata.verified ? 'verified' : 'unverified'}`}>
                  {event.metadata.verified ? '已验证' : '待验证'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDetailPanel
