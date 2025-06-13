import React from 'react'
import { useDataStore } from '@/stores/useDataStore'

/**
 * 数据统计组件
 * 显示数据的统计信息
 */
export const DataStats: React.FC = () => {
  const { stats } = useDataStore()

  if (!stats) {
    return (
      <div className="data-stats">
        <p>暂无统计数据</p>
      </div>
    )
  }

  return (
    <div className="data-stats">
      <h4>📊 数据统计</h4>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalCharacters}</div>
          <div className="stat-label">总角色数</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.relationshipCount}</div>
          <div className="stat-label">关系数量</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{Object.keys(stats.charactersByType).length}</div>
          <div className="stat-label">角色类型</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{Object.keys(stats.charactersByFaction).length}</div>
          <div className="stat-label">势力数量</div>
        </div>
      </div>
      
      <div className="stats-details">
        <div className="stats-section">
          <h5>按类型分布</h5>
          {Object.entries(stats.charactersByType).map(([type, count]) => (
            <div key={type} className="stats-item">
              <span>{type}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
        
        <div className="stats-section">
          <h5>按势力分布</h5>
          {Object.entries(stats.charactersByFaction).map(([faction, count]) => (
            <div key={faction} className="stats-item">
              <span>{faction}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
