import React, { useState } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { CharacterData } from '@/types/character'
import { PreviewMode } from '@/types/dashboard'

/**
 * 数据预览组件
 * 提供数据的可视化预览
 */
export const DataPreview: React.FC = () => {
  const { characters, preview, stats, setViewMode, setSelectedCharacterPreview } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedFaction, setSelectedFaction] = useState<string>('all')

  // 过滤角色数据
  const filteredCharacters = characters.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         char.pinyin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         char.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || char.type === selectedType
    const matchesFaction = selectedFaction === 'all' || char.faction === selectedFaction

    return matchesSearch && matchesType && matchesFaction
  })

  // 获取唯一的类型和势力列表
  const uniqueTypes = Array.from(new Set(characters.map(char => char.type))).filter(Boolean)
  const uniqueFactions = Array.from(new Set(characters.map(char => char.faction))).filter(Boolean)

  // 角色卡片组件
  const CharacterCard: React.FC<{ character: CharacterData }> = ({ character }) => (
    <div
      className="character-card"
      onClick={() => setSelectedCharacterPreview(character.id)}
    >
      <div className="character-header">
        <h4 className="character-name">{character.name}</h4>
        <div className="character-badges">
          <span className={`character-type ${character.type}`}>
            {character.type}
          </span>
          {character.faction && (
            <span className="character-faction">
              {character.faction}
            </span>
          )}
        </div>
      </div>

      <div className="character-info">
        <div className="character-stats">
          <div className="stat-item">
            <span className="stat-label">等级</span>
            <span className="stat-value">{character.rank || 'N/A'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">实力</span>
            <span className="stat-value">{character.power || 'N/A'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">影响力</span>
            <span className="stat-value">{character.influence || 'N/A'}</span>
          </div>
        </div>

        {character.description && (
          <p className="character-description">
            {character.description.length > 100
              ? `${character.description.substring(0, 100)}...`
              : character.description}
          </p>
        )}

        {character.aliases && character.aliases.length > 0 && (
          <div className="character-aliases">
            <span className="aliases-label">别名:</span>
            <div className="aliases-list">
              {character.aliases.slice(0, 3).map((alias, index) => (
                <span key={index} className="alias-tag">{alias}</span>
              ))}
              {character.aliases.length > 3 && (
                <span className="alias-more">+{character.aliases.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="data-preview">
      <div className="preview-header">
        <h3>👁️ 数据预览</h3>

        {/* 视图模式切换 */}
        <div className="view-mode-selector">
          <button
            className={`mode-btn ${preview.viewMode === PreviewMode.LIST_VIEW ? 'active' : ''}`}
            onClick={() => setViewMode(PreviewMode.LIST_VIEW)}
          >
            📋 列表视图
          </button>
          <button
            className={`mode-btn ${preview.viewMode === PreviewMode.GALAXY_VIEW ? 'active' : ''}`}
            onClick={() => setViewMode(PreviewMode.GALAXY_VIEW)}
          >
            🌌 银河视图
          </button>
          <button
            className={`mode-btn ${preview.viewMode === PreviewMode.STATS_VIEW ? 'active' : ''}`}
            onClick={() => setViewMode(PreviewMode.STATS_VIEW)}
          >
            📊 统计视图
          </button>
        </div>
      </div>

      {/* 搜索和过滤器 */}
      <div className="preview-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索角色名称、拼音或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有类型</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={selectedFaction}
            onChange={(e) => setSelectedFaction(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有势力</option>
            {uniqueFactions.map(faction => (
              <option key={faction} value={faction}>{faction}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 数据统计概览 */}
      {stats && (
        <div className="preview-stats">
          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-number">{characters.length}</span>
              <span className="summary-label">总角色</span>
            </div>
            <div className="summary-item">
              <span className="summary-number">{filteredCharacters.length}</span>
              <span className="summary-label">筛选结果</span>
            </div>
            <div className="summary-item">
              <span className="summary-number">{uniqueTypes.length}</span>
              <span className="summary-label">角色类型</span>
            </div>
            <div className="summary-item">
              <span className="summary-number">{uniqueFactions.length}</span>
              <span className="summary-label">势力数量</span>
            </div>
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="preview-content">
        {preview.viewMode === PreviewMode.LIST_VIEW && (
          <div className="characters-grid">
            {filteredCharacters.length > 0 ? (
              filteredCharacters.map(character => (
                <CharacterCard key={character.id} character={character} />
              ))
            ) : (
              <div className="empty-state">
                <p>没有找到匹配的角色</p>
                <p>尝试调整搜索条件或过滤器</p>
              </div>
            )}
          </div>
        )}

        {preview.viewMode === PreviewMode.GALAXY_VIEW && (
          <div className="galaxy-preview">
            <div className="galaxy-info">
              <h4>🌌 银河系可视化预览</h4>
              <p>角色将在3D银河系中显示为发光球体</p>
              <div className="galaxy-mapping">
                <div className="mapping-rule">
                  <span className="rule-label">位置:</span>
                  <span className="rule-value">基于角色重要性和关系</span>
                </div>
                <div className="mapping-rule">
                  <span className="rule-label">颜色:</span>
                  <span className="rule-value">基于角色类型</span>
                </div>
                <div className="mapping-rule">
                  <span className="rule-label">大小:</span>
                  <span className="rule-value">基于实力等级</span>
                </div>
                <div className="mapping-rule">
                  <span className="rule-label">亮度:</span>
                  <span className="rule-value">基于影响力</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {preview.viewMode === PreviewMode.STATS_VIEW && stats && (
          <div className="stats-detailed">
            <div className="stats-section">
              <h4>📊 角色类型分布</h4>
              <div className="stats-chart">
                {Object.entries(stats.charactersByType).map(([type, count]) => (
                  <div key={type} className="chart-item">
                    <div className="chart-bar">
                      <div
                        className="chart-fill"
                        style={{
                          width: `${(count / characters.length) * 100}%`,
                          backgroundColor: getTypeColor(type)
                        }}
                      />
                    </div>
                    <div className="chart-label">
                      <span className="chart-type">{type}</span>
                      <span className="chart-count">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="stats-section">
              <h4>⚔️ 势力分布</h4>
              <div className="stats-chart">
                {Object.entries(stats.charactersByFaction).map(([faction, count]) => (
                  <div key={faction} className="chart-item">
                    <div className="chart-bar">
                      <div
                        className="chart-fill"
                        style={{
                          width: `${(count / characters.length) * 100}%`,
                          backgroundColor: getFactionColor(faction)
                        }}
                      />
                    </div>
                    <div className="chart-label">
                      <span className="chart-type">{faction}</span>
                      <span className="chart-count">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 辅助函数：获取类型颜色
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'protagonist': '#4CAF50',
    'antagonist': '#f44336',
    'supporting': '#2196F3',
    'immortal': '#9C27B0',
    'demon': '#FF5722',
    'human': '#795548',
    'deity': '#FFD700',
    'animal': '#8BC34A'
  }
  return colors[type] || '#666'
}

// 辅助函数：获取势力颜色
function getFactionColor(faction: string): string {
  const colors: Record<string, string> = {
    '取经团队': '#4CAF50',
    '天庭': '#FFD700',
    '佛教': '#FF9800',
    '妖怪': '#f44336',
    '龙族': '#2196F3',
    '地府': '#9C27B0',
    '人间': '#795548'
  }
  return colors[faction] || '#666'
}
