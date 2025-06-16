import React, { useState, useEffect } from 'react'
import './CharacterDataPanel.css'

/**
 * 角色数据控制面板
 * 用于控制角色数据的显示和配置
 */

interface CharacterDataPanelProps {
  onVisibilityChange: (visible: boolean) => void
  onOpacityChange: (opacity: number) => void
  visible?: boolean
  opacity?: number
}

interface DataStats {
  totalCharacters: number
  totalAliases: number
  charactersByType: Record<string, number>
  charactersByFaction: Record<string, number>
  lastUpdated: string
}

export const CharacterDataPanel: React.FC<CharacterDataPanelProps> = ({
  onVisibilityChange,
  onOpacityChange,
  visible = true,
  opacity = 1.0
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [stats, setStats] = useState<DataStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 加载数据统计
   */
  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:3001/api/stats')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error || '加载统计数据失败')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
      console.error('❌ 加载统计数据失败:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时加载统计数据
  useEffect(() => {
    loadStats()
  }, [])

  /**
   * 刷新数据缓存
   */
  const refreshCache = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('http://localhost:3001/api/cache/refresh', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ 缓存已刷新')
        await loadStats() // 重新加载统计数据
      } else {
        throw new Error(result.error || '刷新缓存失败')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
      console.error('❌ 刷新缓存失败:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`character-data-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* 标题栏 */}
      <div 
        className="panel-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="panel-title">📊 角色数据</span>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {/* 展开的内容 */}
      {isExpanded && (
        <div className="panel-content">
          {/* 显示控制 */}
          <div className="control-section">
            <h4>显示控制</h4>
            
            <div className="control-item">
              <label>
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => onVisibilityChange(e.target.checked)}
                />
                显示角色数据点
              </label>
            </div>

            <div className="control-item">
              <label>透明度: {Math.round(opacity * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                disabled={!visible}
              />
            </div>
          </div>

          {/* 数据统计 */}
          <div className="stats-section">
            <h4>数据统计</h4>
            
            {loading && <div className="loading">🔄 加载中...</div>}
            
            {error && (
              <div className="error">
                ❌ {error}
                <button onClick={loadStats} className="retry-btn">重试</button>
              </div>
            )}
            
            {stats && (
              <div className="stats-content">
                <div className="stat-item">
                  <span className="stat-label">角色总数:</span>
                  <span className="stat-value">{stats.totalCharacters}</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">别名总数:</span>
                  <span className="stat-value">{stats.totalAliases}</span>
                </div>

                {/* 按类型统计 */}
                <div className="stat-group">
                  <h5>按类型分布</h5>
                  {Object.entries(stats.charactersByType).map(([type, count]) => (
                    <div key={type} className="stat-item small">
                      <span className="stat-label">{type}:</span>
                      <span className="stat-value">{count}</span>
                    </div>
                  ))}
                </div>

                {/* 按势力统计 */}
                <div className="stat-group">
                  <h5>按势力分布</h5>
                  {Object.entries(stats.charactersByFaction).map(([faction, count]) => (
                    <div key={faction} className="stat-item small">
                      <span className="stat-label">{faction}:</span>
                      <span className="stat-value">{count}</span>
                    </div>
                  ))}
                </div>

                <div className="stat-item">
                  <span className="stat-label">更新时间:</span>
                  <span className="stat-value">
                    {new Date(stats.lastUpdated).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="actions-section">
            <button 
              onClick={refreshCache}
              disabled={loading}
              className="action-btn"
            >
              🔄 刷新数据
            </button>
            
            <button 
              onClick={loadStats}
              disabled={loading}
              className="action-btn"
            >
              📊 重新统计
            </button>
          </div>

          {/* 说明文字 */}
          <div className="info-section">
            <p className="info-text">
              💡 角色数据点基于西游记角色的排名、能力和类别在银河系中分布。
              不同颜色代表不同的角色类型，位置反映角色的重要性和势力归属。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
