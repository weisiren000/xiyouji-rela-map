import React from 'react'
import { Vector2 } from 'three'
import type { EventData } from '@/types/events'

interface EventInfoCardProps {
  event: EventData | null
  mousePosition: Vector2
  visible: boolean
}

/**
 * 事件信息卡片组件
 * 在鼠标悬浮时显示81难事件的详细信息
 */
export const EventInfoCard: React.FC<EventInfoCardProps> = ({
  event,
  mousePosition,
  visible
}) => {
  if (!visible || !event) return null

  // 计算卡片位置，避免超出屏幕边界
  const cardWidth = 320
  const cardHeight = 280
  const offset = 15

  let left = mousePosition.x + offset
  let top = mousePosition.y + offset

  // 防止卡片超出右边界
  if (left + cardWidth > window.innerWidth) {
    left = mousePosition.x - cardWidth - offset
  }

  // 防止卡片超出下边界
  if (top + cardHeight > window.innerHeight) {
    top = mousePosition.y - cardHeight - offset
  }

  // 防止卡片超出左边界
  if (left < 0) {
    left = offset
  }

  // 防止卡片超出上边界
  if (top < 0) {
    top = offset
  }

  // 根据难次生成渐变颜色
  const getEventColor = (nanci: number) => {
    const progress = (nanci - 1) / 80 // 0-1
    if (progress < 0.33) {
      // 蓝色到紫色
      return `hsl(${240 - progress * 60}, 70%, 60%)`
    } else if (progress < 0.66) {
      // 紫色到红色
      return `hsl(${180 - (progress - 0.33) * 60}, 70%, 60%)`
    } else {
      // 红色到金色
      return `hsl(${120 - (progress - 0.66) * 75}, 70%, 60%)`
    }
  }

  const eventColor = getEventColor(event.nanci)

  // 截断长文本
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${cardWidth}px`,
        background: 'rgba(0, 0, 0, 0.95)',
        border: `2px solid ${eventColor}`,
        borderRadius: '12px',
        padding: '16px',
        color: '#ffffff',
        fontSize: '14px',
        zIndex: 10000,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px ${eventColor}40`,
        pointerEvents: 'none',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.4'
      }}
    >
      {/* 标题区域 */}
      <div style={{ 
        borderBottom: `1px solid ${eventColor}40`,
        paddingBottom: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          color: eventColor,
          marginBottom: '4px'
        }}>
          {event.nanming}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#aaa',
          fontStyle: 'italic'
        }}>
          第{event.nanci}难
        </div>
      </div>

      {/* 事件信息 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#888', fontWeight: 'bold' }}>主要人物：</span>
        </div>
        <div style={{ 
          color: '#e0e0e0',
          marginBottom: '8px',
          fontSize: '13px'
        }}>
          {truncateText(event.zhuyaorenwu, 40)}
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#888', fontWeight: 'bold' }}>地点：</span>
        </div>
        <div style={{ 
          color: '#e0e0e0',
          marginBottom: '8px',
          fontSize: '13px'
        }}>
          {truncateText(event.didian, 40)}
        </div>
      </div>

      {/* 事件描述 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ 
          color: '#888', 
          fontWeight: 'bold',
          marginBottom: '6px'
        }}>
          事件描述：
        </div>
        <div style={{ 
          color: '#e0e0e0',
          fontSize: '12px',
          lineHeight: '1.5'
        }}>
          {truncateText(event.shijianmiaoshu, 80)}
        </div>
      </div>

      {/* 象征意义 */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          color: '#888', 
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          象征意义：
        </div>
        <div style={{ 
          color: eventColor,
          fontSize: '12px',
          fontStyle: 'italic'
        }}>
          {truncateText(event.xiangzhengyi, 60)}
        </div>
      </div>

      {/* 文化内涵 */}
      <div>
        <div style={{ 
          color: '#888', 
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          文化内涵：
        </div>
        <div style={{ 
          color: '#d0d0d0',
          fontSize: '12px',
          fontStyle: 'italic'
        }}>
          {truncateText(event.wenhuaneihan, 60)}
        </div>
      </div>
    </div>
  )
}

export default EventInfoCard
