import React, { useState, useMemo } from 'react'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { useBatchModelDetection } from '@/hooks/useBatchModelDetection'
import { CharacterData } from '@/types/character'
import './ModelQuickAccess.css'

/**
 * 模型快速访问组件
 * 功能：
 * - 显示所有已加载模型的角色列表
 * - 提供搜索和过滤功能
 * - 点击直接进入局部视图
 * - 显示模型匹配信息
 */
export const ModelQuickAccess: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'confidence' | 'type'>('confidence')

  const { enterMainPageDetailView } = useGalaxyStore()
  const { checking, charactersWithModels, modelCount } = useBatchModelDetection()

  // 过滤和排序
  const filteredAndSortedCharacters = useMemo(() => {
    let filtered = charactersWithModels

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(char => 
        char.name.toLowerCase().includes(query) ||
        char.aliases?.some(alias => alias.toLowerCase().includes(query)) ||
        char.pinyin?.toLowerCase().includes(query) ||
        char.faction.toLowerCase().includes(query)
      )
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'confidence':
          return b.confidence - a.confidence
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    return filtered
  }, [charactersWithModels, searchQuery, sortBy])

  // 进入角色详情视图
  const handleCharacterClick = (character: CharacterData) => {
    console.log('🎯 快速访问角色:', character.name)
    enterMainPageDetailView(character)
    setIsVisible(false) // 关闭面板
  }

  // 获取匹配类型的显示文本
  const getMatchTypeText = (matchType: string) => {
    switch (matchType) {
      case 'name': return '名称匹配'
      case 'pinyin': return '拼音匹配'
      case 'alias': return '别名匹配'
      default: return '未知匹配'
    }
  }

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return '#4CAF50' // 绿色
    if (confidence >= 0.8) return '#FF9800' // 橙色
    return '#FF5722' // 红色
  }

  return (
    <>
      {/* 触发按钮 */}
      <button
        className="model-quick-access-trigger"
        onClick={() => setIsVisible(!isVisible)}
        title="快速访问已加载模型"
      >
        <span className="trigger-icon">🎭</span>
        <span className="trigger-text">模型库</span>
        <span className="model-count">{checking ? '...' : modelCount}</span>
      </button>

      {/* 主面板 */}
      {isVisible && (
        <div className="model-quick-access-panel">
          <div className="panel-header">
            <h3>已加载模型 ({checking ? '检测中...' : modelCount})</h3>
            <button 
              className="close-button"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </button>
          </div>

          {/* 搜索和排序控制 */}
          <div className="panel-controls">
            <input
              type="text"
              placeholder="搜索角色名称、别名、势力..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="confidence">按匹配度</option>
              <option value="name">按名称</option>
              <option value="type">按类型</option>
            </select>
          </div>

          {/* 角色列表 */}
          <div className="character-list">
            {filteredAndSortedCharacters.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? '未找到匹配的角色' : '暂无已加载的模型'}
              </div>
            ) : (
              filteredAndSortedCharacters.map((character) => (
                <div
                  key={character.id}
                  className="character-item"
                  onClick={() => handleCharacterClick(character)}
                >
                  <div className="character-info">
                    <div className="character-name">{character.name}</div>
                    <div className="character-meta">
                      <span className="character-type">{character.type}</span>
                      <span className="character-faction">{character.faction}</span>
                      {character.aliases && character.aliases.length > 0 && (
                        <span className="character-aliases">
                          别名: {character.aliases.slice(0, 2).join(', ')}
                          {character.aliases.length > 2 && '...'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="model-info">
                    <div 
                      className="confidence-badge"
                      style={{ backgroundColor: getConfidenceColor(character.confidence) }}
                    >
                      {Math.round(character.confidence * 100)}%
                    </div>
                    <div className="match-type">
                      {getMatchTypeText(character.matchType)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 底部统计信息 */}
          <div className="panel-footer">
            <span>显示 {filteredAndSortedCharacters.length} / {modelCount} 个模型</span>
            <span>点击角色进入局部视图</span>
          </div>
        </div>
      )}

      {/* 遮罩层 */}
      {isVisible && (
        <div 
          className="model-quick-access-overlay"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  )
}

export default ModelQuickAccess
