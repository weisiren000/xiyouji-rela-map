import React from 'react'
import { Vector2 } from 'three'

interface CharacterData {
  id: string
  name: string
  pinyin: string
  visual: {
    color: string
  }
  isAlias?: boolean
}

interface SimpleCharacterTooltipProps {
  character: CharacterData | null
  mousePosition: Vector2
  visible: boolean
}

/**
 * 简单角色提示组件 - 最小化版本
 * 只显示角色名称，用于测试是否会引起黑屏
 */
export const SimpleCharacterTooltip: React.FC<SimpleCharacterTooltipProps> = ({
  character,
  mousePosition,
  visible
}) => {
  if (!visible || !character) return null

  const offset = 15
  const left = mousePosition.x + offset
  const top = mousePosition.y + offset

  return (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        background: 'rgba(0, 0, 0, 0.8)',
        color: character.visual.color,
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 10000,
        pointerEvents: 'none',
        border: `1px solid ${character.visual.color}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {character.name}
      {character.isAlias && <span style={{ color: '#888', fontSize: '12px' }}> (别名)</span>}
    </div>
  )
}
