import React from 'react'
import { CharacterData, CharacterType } from '@/types/character'
import './CharacterDetailPanel.css'

interface CharacterDetailPanelProps {
  character: CharacterData
}

/**
 * 角色详情信息面板组件
 * 功能：
 * - 显示角色基础信息（姓名、描述、属性）
 * - 显示扩展信息（别名、详细属性）
 * - 响应式设计
 * - 美观的信息展示
 */
export const CharacterDetailPanel: React.FC<CharacterDetailPanelProps> = ({ character }) => {
  
  // 角色类型中文映射
  const getCharacterTypeLabel = (type: CharacterType): string => {
    const typeLabels = {
      [CharacterType.PROTAGONIST]: '主角团队',
      [CharacterType.DEITY]: '神仙',
      [CharacterType.DEMON]: '妖怪',
      [CharacterType.HUMAN]: '人类',
      [CharacterType.DRAGON]: '龙族',
      [CharacterType.CELESTIAL]: '天庭',
      [CharacterType.BUDDHIST]: '佛教',
      [CharacterType.UNDERWORLD]: '地府'
    }
    return typeLabels[type] || type
  }

  // 格式化能力值显示
  const formatPowerLevel = (power?: number): string => {
    if (!power) return '未知'
    if (power >= 90) return '极强'
    if (power >= 70) return '很强'
    if (power >= 50) return '中等'
    if (power >= 30) return '较弱'
    return '很弱'
  }

  return (
    <div className="character-detail-panel">
      {/* 角色头部信息 */}
      <div className="character-header">
        <div className="character-color-indicator" 
             style={{ backgroundColor: character.visual.color }}>
        </div>
        <div className="character-title">
          <h1 className="character-name">{character.name}</h1>
          {character.pinyin && (
            <p className="character-pinyin">{character.pinyin}</p>
          )}
        </div>
      </div>

      {/* 基础信息 */}
      <div className="info-section">
        <h3 className="section-title">基础信息</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">角色类型</span>
            <span className="info-value">{getCharacterTypeLabel(character.type)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">所属势力</span>
            <span className="info-value">{character.faction}</span>
          </div>
          <div className="info-item">
            <span className="info-label">重要性排名</span>
            <span className="info-value">#{character.rank}</span>
          </div>
          <div className="info-item">
            <span className="info-label">等级</span>
            <span className="info-value">{character.level.name}</span>
          </div>
        </div>
      </div>

      {/* 能力信息 */}
      {(character.power || character.influence) && (
        <div className="info-section">
          <h3 className="section-title">能力评估</h3>
          <div className="info-grid">
            {character.power && (
              <div className="info-item">
                <span className="info-label">能力值</span>
                <span className="info-value">
                  {character.power} ({formatPowerLevel(character.power)})
                </span>
              </div>
            )}
            {character.influence && (
              <div className="info-item">
                <span className="info-label">影响力</span>
                <span className="info-value">{character.influence}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 角色描述 */}
      <div className="info-section">
        <h3 className="section-title">角色描述</h3>
        <p className="character-description">{character.description}</p>
      </div>

      {/* 别名信息 */}
      {character.aliases && character.aliases.length > 0 && (
        <div className="info-section">
          <h3 className="section-title">别名</h3>
          <div className="aliases-container">
            {character.aliases.map((alias, index) => (
              <span key={index} className="alias-tag">
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 能力技能 */}
      {character.abilities && character.abilities.length > 0 && (
        <div className="info-section">
          <h3 className="section-title">能力技能</h3>
          <div className="abilities-container">
            {character.abilities.map((ability, index) => (
              <span key={index} className="ability-tag">
                {ability}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 出现章节 */}
      {character.chapter && (
        <div className="info-section">
          <h3 className="section-title">出现章节</h3>
          <p className="chapter-info">{character.chapter}</p>
        </div>
      )}

      {/* 视觉属性 */}
      <div className="info-section">
        <h3 className="section-title">视觉属性</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">颜色</span>
            <span className="info-value">
              <span className="color-preview" 
                    style={{ backgroundColor: character.visual.color }}>
              </span>
              {character.visual.color}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">大小系数</span>
            <span className="info-value">{character.visual.size.toFixed(2)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">发光强度</span>
            <span className="info-value">{character.visual.emissiveIntensity.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 元数据 */}
      <div className="info-section metadata-section">
        <h3 className="section-title">数据信息</h3>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">数据来源</span>
            <span className="metadata-value">{character.metadata.source}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">最后修改</span>
            <span className="metadata-value">{character.metadata.lastModified}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">验证状态</span>
            <span className={`metadata-value ${character.metadata.verified ? 'verified' : 'unverified'}`}>
              {character.metadata.verified ? '已验证' : '未验证'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterDetailPanel
