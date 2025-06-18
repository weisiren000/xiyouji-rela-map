import React from 'react'
import { Vector2 } from 'three'

interface CharacterData {
  id: string
  name: string
  pinyin: string
  type: string
  category: string
  faction: string
  rank: number
  power: number
  influence: number
  visual: {
    color: string
    size: number
    emissiveIntensity: number
  }
  isAlias?: boolean
  originalCharacter?: string
}

interface CharacterInfoCardProps {
  character: CharacterData | null
  mousePosition: Vector2
  visible: boolean
}

/**
 * 角色信息卡片组件
 * 在鼠标悬浮时显示角色详细信息
 */
export const CharacterInfoCard: React.FC<CharacterInfoCardProps> = ({
  character,
  mousePosition,
  visible
}) => {
  if (!visible || !character) return null

  // 计算卡片位置，避免超出屏幕边界
  const cardWidth = 280
  const cardHeight = 200
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

  // 获取类别显示名称
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'protagonist': '主角团队',
      'deity': '神仙',
      'demon': '妖魔',
      'dragon': '龙族',
      'buddhist': '佛教',
      'celestial': '天庭',
      'underworld': '地府',
      'human': '人类'
    }
    return categoryMap[category] || category
  }

  // 获取能力等级描述
  const getPowerLevel = (power: number) => {
    if (power >= 90) return '至尊'
    if (power >= 80) return '极强'
    if (power >= 70) return '很强'
    if (power >= 60) return '较强'
    if (power >= 50) return '中等'
    if (power >= 40) return '较弱'
    return '弱'
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${cardWidth}px`,
        background: 'rgba(0, 0, 0, 0.9)',
        border: `2px solid ${character.visual.color}`,
        borderRadius: '12px',
        padding: '16px',
        color: '#ffffff',
        fontSize: '14px',
        zIndex: 10000,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px ${character.visual.color}40`,
        pointerEvents: 'none', // 防止卡片阻挡鼠标事件
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* 标题区域 */}
      <div style={{ 
        borderBottom: `1px solid ${character.visual.color}40`,
        paddingBottom: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          color: character.visual.color,
          marginBottom: '4px'
        }}>
          {character.name}
          {character.isAlias && (
            <span style={{ 
              fontSize: '12px', 
              color: '#888',
              marginLeft: '8px'
            }}>
              (别名)
            </span>
          )}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#aaa',
          fontStyle: 'italic'
        }}>
          {character.pinyin}
        </div>
      </div>

      {/* 基本信息 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ marginBottom: '6px' }}>
          <span style={{ color: '#888' }}>类别：</span>
          <span style={{ color: character.visual.color }}>
            {getCategoryName(character.category)}
          </span>
        </div>
        <div style={{ marginBottom: '6px' }}>
          <span style={{ color: '#888' }}>阵营：</span>
          <span>{character.faction}</span>
        </div>
        <div style={{ marginBottom: '6px' }}>
          <span style={{ color: '#888' }}>类型：</span>
          <span>{character.type}</span>
        </div>
      </div>

      {/* 能力数值 */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <span style={{ color: '#888' }}>排名：</span>
          <span style={{ 
            color: character.rank <= 10 ? '#ffd700' : 
                   character.rank <= 50 ? '#ff6b6b' : '#4ecdc4'
          }}>
            #{character.rank}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <span style={{ color: '#888' }}>能力：</span>
          <span style={{ color: character.visual.color }}>
            {character.power} ({getPowerLevel(character.power)})
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#888' }}>影响力：</span>
          <span style={{ color: character.visual.color }}>
            {character.influence}
          </span>
        </div>
      </div>

      {/* 别名特殊信息 */}
      {character.isAlias && character.originalCharacter && (
        <div style={{ 
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px solid ${character.visual.color}40`,
          fontSize: '12px',
          color: '#888'
        }}>
          原角色：{character.originalCharacter}
        </div>
      )}
    </div>
  )
}
