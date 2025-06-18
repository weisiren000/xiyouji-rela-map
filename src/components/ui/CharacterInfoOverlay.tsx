import React, { useEffect, useState } from 'react'
import { Vector2 } from 'three'

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
                  0 0 30px var(--character-color)30,
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    50% {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8),
                  0 0 40px var(--character-color)50,
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
  }

  .character-info-card {
    animation: fadeInUp 0.3s ease-out;
  }

  .character-info-card:hover {
    animation: pulse 2s infinite;
  }
`

// 注入样式到页面
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('character-info-styles')
  if (!styleElement) {
    const style = document.createElement('style')
    style.id = 'character-info-styles'
    style.textContent = cardStyles
    document.head.appendChild(style)
  }
}

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
  // 扩展数据结构以支持更丰富的信息
  basic?: {
    name: string
    pinyin: string
    aliases?: string[]
    type: string
    category: string
  }
  attributes?: {
    level?: {
      id: string
      name: string
      tier: number
      category: string
    }
    rank: number
    power: number
    influence: number
    morality?: string
  }
  metadata?: {
    description?: string
    tags?: string[]
    sourceChapters?: number[]
    firstAppearance?: number
  }
}

interface CharacterInfoOverlayProps {
  character: CharacterData | null
  mousePosition: Vector2
  visible: boolean
}

/**
 * 角色信息覆盖层组件 - 安全版本
 * 不使用Portal，直接渲染在组件树中
 */
export const CharacterInfoOverlay: React.FC<CharacterInfoOverlayProps> = ({
  character,
  mousePosition,
  visible
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  // 处理显示状态变化的动画
  useEffect(() => {
    if (visible && character) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [visible, character])
  if (!visible || !character) {
    return (
      <div 
        id="character-info-overlay" 
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
  const cardWidth = 320  // 增加宽度以容纳更多信息
  const cardHeight = 280 // 增加高度以容纳更多信息
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

  // 获取道德倾向描述
  const getMoralityName = (morality?: string) => {
    const moralityMap: Record<string, string> = {
      'lawful_good': '守序善良',
      'neutral_good': '中立善良',
      'chaotic_good': '混乱善良',
      'lawful_neutral': '守序中立',
      'true_neutral': '绝对中立',
      'chaotic_neutral': '混乱中立',
      'lawful_evil': '守序邪恶',
      'neutral_evil': '中立邪恶',
      'chaotic_evil': '混乱邪恶'
    }
    return morality ? moralityMap[morality] || morality : '未知'
  }

  // 获取修为等级颜色
  const getLevelColor = (tier?: number) => {
    if (!tier) return '#888'
    if (tier >= 8) return '#ffd700' // 金色 - 大罗金仙等
    if (tier >= 6) return '#ff6b6b' // 红色 - 太乙金仙等
    if (tier >= 4) return '#4ecdc4' // 青色 - 金仙等
    if (tier >= 2) return '#95e1d3' // 绿色 - 天仙等
    return '#ddd' // 灰色 - 凡人等
  }

  return (
    <div
      id="character-info-overlay"
      className="character-info-card"
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${cardWidth}px`,
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.95))',
        border: `2px solid ${character.visual.color}`,
        borderRadius: '16px',
        padding: '20px',
        color: '#ffffff',
        fontSize: '14px',
        zIndex: 10000,
        backdropFilter: 'blur(15px)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.8),
          0 0 30px ${character.visual.color}30,
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        pointerEvents: 'none', // 防止卡片阻挡鼠标事件
        fontFamily: '"Segoe UI", "Microsoft YaHei", Arial, sans-serif',
        display: 'block',
        transition: 'all 0.3s ease',
        '--character-color': character.visual.color,
        transform: isAnimating ? 'translateY(-5px)' : 'translateY(0)',
        opacity: visible ? 1 : 0
      } as React.CSSProperties}
    >
      {/* 标题区域 */}
      <div style={{
        borderBottom: `1px solid ${character.visual.color}40`,
        paddingBottom: '16px',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: character.visual.color,
          marginBottom: '6px',
          textShadow: `0 0 10px ${character.visual.color}40`
        }}>
          {character.basic?.name || character.name}
          {character.isAlias && (
            <span style={{
              fontSize: '12px',
              color: '#888',
              marginLeft: '8px',
              background: 'rgba(136, 136, 136, 0.2)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              别名
            </span>
          )}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#bbb',
          fontStyle: 'italic',
          marginBottom: '8px'
        }}>
          {character.basic?.pinyin || character.pinyin}
        </div>

        {/* 修为等级 */}
        {character.attributes?.level && (
          <div style={{
            fontSize: '13px',
            color: getLevelColor(character.attributes.level.tier),
            fontWeight: '600',
            background: `linear-gradient(90deg, ${getLevelColor(character.attributes.level.tier)}20, transparent)`,
            padding: '4px 8px',
            borderRadius: '6px',
            border: `1px solid ${getLevelColor(character.attributes.level.tier)}40`
          }}>
            {character.attributes.level.name} (第{character.attributes.level.tier}阶)
          </div>
        )}
      </div>

      {/* 基本信息 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>类别</div>
            <div style={{ color: character.visual.color, fontWeight: '600' }}>
              {getCategoryName(character.basic?.category || character.category)}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>阵营</div>
            <div style={{ color: '#fff', fontWeight: '600' }}>{character.faction}</div>
          </div>
        </div>

        {/* 道德倾向 */}
        {character.attributes?.morality && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '8px'
          }}>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>道德倾向</div>
            <div style={{ color: character.visual.color, fontWeight: '600' }}>
              {getMoralityName(character.attributes.morality)}
            </div>
          </div>
        )}
      </div>

      {/* 能力数值 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          color: '#888',
          fontSize: '12px',
          marginBottom: '8px',
          fontWeight: '600'
        }}>
          能力评估
        </div>

        {/* 排名 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          padding: '6px 0'
        }}>
          <span style={{ color: '#bbb' }}>综合排名</span>
          <span style={{
            color: character.rank <= 10 ? '#ffd700' :
                   character.rank <= 50 ? '#ff6b6b' : '#4ecdc4',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            #{character.attributes?.rank || character.rank}
          </span>
        </div>

        {/* 能力值进度条 */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <span style={{ color: '#bbb', fontSize: '12px' }}>战斗力</span>
            <span style={{ color: character.visual.color, fontWeight: '600' }}>
              {character.attributes?.power || character.power} ({getPowerLevel(character.attributes?.power || character.power)})
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(character.attributes?.power || character.power)}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${character.visual.color}, ${character.visual.color}80)`,
              borderRadius: '3px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {/* 影响力进度条 */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <span style={{ color: '#bbb', fontSize: '12px' }}>影响力</span>
            <span style={{ color: character.visual.color, fontWeight: '600' }}>
              {character.attributes?.influence || character.influence}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(character.attributes?.influence || character.influence)}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${character.visual.color}80, ${character.visual.color}40)`,
              borderRadius: '3px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* 描述信息 */}
      {character.metadata?.description && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '12px',
          borderRadius: '8px',
          border: `1px solid ${character.visual.color}20`,
          marginBottom: '12px'
        }}>
          <div style={{
            color: '#888',
            fontSize: '11px',
            marginBottom: '6px',
            fontWeight: '600'
          }}>
            角色描述
          </div>
          <div style={{
            color: '#ddd',
            fontSize: '12px',
            lineHeight: '1.4',
            maxHeight: '60px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {character.metadata.description}
          </div>
        </div>
      )}

      {/* 别名信息 */}
      {character.basic?.aliases && character.basic.aliases.length > 0 && (
        <div style={{
          marginBottom: '12px'
        }}>
          <div style={{
            color: '#888',
            fontSize: '11px',
            marginBottom: '6px',
            fontWeight: '600'
          }}>
            别名 ({character.basic.aliases.length})
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
          }}>
            {character.basic.aliases.slice(0, 6).map((alias, index) => (
              <span
                key={index}
                style={{
                  background: `${character.visual.color}20`,
                  color: character.visual.color,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  border: `1px solid ${character.visual.color}40`
                }}
              >
                {alias}
              </span>
            ))}
            {character.basic.aliases.length > 6 && (
              <span style={{
                color: '#888',
                fontSize: '10px',
                padding: '2px 6px'
              }}>
                +{character.basic.aliases.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 标签信息 */}
      {character.metadata?.tags && character.metadata.tags.length > 0 && (
        <div style={{
          marginBottom: '12px'
        }}>
          <div style={{
            color: '#888',
            fontSize: '11px',
            marginBottom: '6px',
            fontWeight: '600'
          }}>
            特征标签
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '3px'
          }}>
            {character.metadata.tags.slice(0, 8).map((tag, index) => (
              <span
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ccc',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 出场信息 */}
      {character.metadata?.firstAppearance && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
          borderTop: `1px solid ${character.visual.color}20`,
          marginTop: '8px'
        }}>
          <span style={{ color: '#888', fontSize: '11px' }}>首次出场</span>
          <span style={{ color: character.visual.color, fontSize: '11px', fontWeight: '600' }}>
            第{character.metadata.firstAppearance}回
          </span>
        </div>
      )}

      {/* 别名特殊信息 */}
      {character.isAlias && character.originalCharacter && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px solid ${character.visual.color}40`,
          fontSize: '12px',
          color: '#888',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '8px',
          borderRadius: '6px'
        }}>
          <span style={{ color: '#888' }}>原角色：</span>
          <span style={{ color: character.visual.color }}>{character.originalCharacter}</span>
        </div>
      )}
    </div>
  )
}
