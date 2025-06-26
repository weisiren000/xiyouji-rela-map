import React, { useEffect, useState } from 'react'
import { Vector2 } from 'three'
import type { EventData } from '@/types/events'

// 添加CSS动画样式
const cardStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8),
                  0 0 30px var(--event-color)30,
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    50% {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8),
                  0 0 40px var(--event-color)50,
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
  }

  .event-info-card {
    animation: fadeInUp 0.3s ease-out;
  }

  .event-info-card:hover {
    animation: pulse 2s infinite;
  }
`

// 注入样式到页面
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('event-info-styles')
  if (!styleElement) {
    const style = document.createElement('style')
    style.id = 'event-info-styles'
    style.textContent = cardStyles
    document.head.appendChild(style)
  }
}

interface EventInfoOverlayProps {
  event: EventData | null
  mousePosition: Vector2
  visible: boolean
}

/**
 * 事件信息覆盖层组件
 * 在鼠标悬浮时显示81难事件的详细信息
 */
export const EventInfoOverlay: React.FC<EventInfoOverlayProps> = ({
  event,
  mousePosition,
  visible
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  // 处理显示状态变化的动画
  useEffect(() => {
    if (visible && event) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [visible, event])

  if (!visible || !event) {
    return (
      <div 
        id="event-info-overlay" 
        style={{ 
          position: 'fixed', 
          display: 'none',
          zIndex: 10000,
          pointerEvents: 'none'
        }} 
      />
    )
  }

  // 计算卡片位置，避免超出屏幕边界
  const cardWidth = 360
  const cardHeight = 320
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
      id="event-info-overlay"
      className="event-info-card"
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${cardWidth}px`,
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.95))',
        border: `2px solid ${eventColor}`,
        borderRadius: '16px',
        padding: '20px',
        color: '#ffffff',
        fontSize: '14px',
        zIndex: 10000,
        backdropFilter: 'blur(15px)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.8),
          0 0 30px ${eventColor}30,
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        pointerEvents: 'none',
        fontFamily: '"Segoe UI", "Microsoft YaHei", Arial, sans-serif',
        display: 'block',
        transition: 'all 0.3s ease',
        '--event-color': eventColor,
        transform: isAnimating ? 'translateY(-5px)' : 'translateY(0)',
        opacity: visible ? 1 : 0,
        lineHeight: '1.4'
      } as React.CSSProperties}
    >
      {/* 标题区域 */}
      <div style={{
        borderBottom: `1px solid ${eventColor}40`,
        paddingBottom: '16px',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: eventColor,
          marginBottom: '6px',
          textShadow: `0 0 10px ${eventColor}40`
        }}>
          {event.nanming}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#bbb',
          fontStyle: 'italic',
          marginBottom: '8px'
        }}>
          第{event.nanci}难
        </div>
        
        {/* 进度指示器 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          height: '4px',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '8px'
        }}>
          <div style={{
            width: `${(event.nanci / 81) * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${eventColor}, ${eventColor}80)`,
            borderRadius: '2px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{
          fontSize: '10px',
          color: '#888',
          marginTop: '4px',
          textAlign: 'right'
        }}>
          取经进度: {Math.round((event.nanci / 81) * 100)}%
        </div>
      </div>

      {/* 基本信息 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '8px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>主要人物</div>
            <div style={{ color: '#e0e0e0', fontSize: '13px', lineHeight: '1.3' }}>
              {truncateText(event.zhuyaorenwu, 50)}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>发生地点</div>
            <div style={{ color: eventColor, fontSize: '13px', fontWeight: '600' }}>
              {truncateText(event.didian, 50)}
            </div>
          </div>
        </div>
      </div>

      {/* 事件描述 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '12px',
        borderRadius: '8px',
        border: `1px solid ${eventColor}20`,
        marginBottom: '12px'
      }}>
        <div style={{
          color: '#888',
          fontSize: '11px',
          marginBottom: '6px',
          fontWeight: '600'
        }}>
          事件描述
        </div>
        <div style={{
          color: '#ddd',
          fontSize: '12px',
          lineHeight: '1.5',
          maxHeight: '60px',
          overflow: 'hidden'
        }}>
          {truncateText(event.shijianmiaoshu, 120)}
        </div>
      </div>

      {/* 象征意义与文化内涵 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '8px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '10px',
          borderRadius: '6px',
          border: `1px solid ${eventColor}30`
        }}>
          <div style={{
            color: '#888',
            fontSize: '11px',
            marginBottom: '4px',
            fontWeight: '600'
          }}>
            象征意义
          </div>
          <div style={{
            color: eventColor,
            fontSize: '12px',
            fontStyle: 'italic',
            lineHeight: '1.4'
          }}>
            {truncateText(event.xiangzhengyi, 80)}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            color: '#888',
            fontSize: '11px',
            marginBottom: '4px',
            fontWeight: '600'
          }}>
            文化内涵
          </div>
          <div style={{
            color: '#d0d0d0',
            fontSize: '12px',
            fontStyle: 'italic',
            lineHeight: '1.4'
          }}>
            {truncateText(event.wenhuaneihan, 80)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventInfoOverlay
