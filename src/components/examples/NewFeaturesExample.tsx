/**
 * 新增API功能使用示例
 * 演示角色搜索和健康检查功能的使用方法
 */

import React, { useEffect } from 'react'
import { DataApi } from '@/services/dataApi'
import { useCharacterSearch, useHealthCheck } from '@/hooks/useCharacterSearch'

export const NewFeaturesExample: React.FC = () => {
  const { 
    searchCharacters, 
    searchResults, 
    isSearching,
    searchError 
  } = useCharacterSearch()
  
  const { 
    checkHealth, 
    healthStatus, 
    isChecking,
    isHealthy 
  } = useHealthCheck()

  // 组件加载时检查健康状态
  useEffect(() => {
    checkHealth()
  }, [])

  // 示例搜索函数
  const handleExampleSearch = async () => {
    // 搜索孙悟空相关角色
    await searchCharacters({ q: '孙悟空' })
  }

  const handlePowerSearch = async () => {
    // 搜索高能力值角色
    await searchCharacters({ minPower: 90 })
  }

  const handleCategorySearch = async () => {
    // 搜索主角分类
    await searchCharacters({ category: '主角' })
  }

  // 直接API调用示例
  const handleDirectApiCall = async () => {
    try {
      // 1. 角色搜索API
      const searchResult = await DataApi.searchCharacters({
        q: '观音',
        category: '佛教',
        minPower: 80
      })
      console.log('搜索结果:', searchResult)

      // 2. 健康检查API
      const health = await DataApi.healthCheck()
      console.log('服务器健康状态:', health)

    } catch (error) {
      console.error('API调用失败:', error)
    }
  }

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2>🆕 新增API功能演示</h2>

      {/* 健康状态显示 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}>
        <h3>🏥 服务器健康状态</h3>
        {isChecking ? (
          <p>检查中...</p>
        ) : healthStatus ? (
          <div>
            <p>状态: <span style={{ color: isHealthy ? '#4CAF50' : '#f44336' }}>
              {healthStatus.status}
            </span></p>
            <p>运行时间: {Math.floor(healthStatus.uptime / 3600)}小时</p>
            <p>数据库状态: 角色-{healthStatus.database.characters}, 事件-{healthStatus.database.events}</p>
          </div>
        ) : (
          <p style={{ color: '#f44336' }}>无法获取健康状态</p>
        )}
        <button onClick={checkHealth} disabled={isChecking}>
          刷新状态
        </button>
      </div>

      {/* 搜索功能演示 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}>
        <h3>🔍 角色搜索功能</h3>
        <div style={{ marginBottom: '15px' }}>
          <button onClick={handleExampleSearch} disabled={isSearching} style={{ margin: '5px' }}>
            搜索"孙悟空"
          </button>
          <button onClick={handlePowerSearch} disabled={isSearching} style={{ margin: '5px' }}>
            搜索高能力值角色(≥90)
          </button>
          <button onClick={handleCategorySearch} disabled={isSearching} style={{ margin: '5px' }}>
            搜索主角分类
          </button>
          <button onClick={handleDirectApiCall} style={{ margin: '5px' }}>
            直接API调用示例
          </button>
        </div>

        {isSearching && <p>搜索中...</p>}
        {searchError && <p style={{ color: '#f44336' }}>错误: {searchError}</p>}
        
        {searchResults && (
          <div>
            <h4>搜索结果 ({searchResults.count} 个)</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {searchResults.data.slice(0, 5).map((character) => (
                <div key={character.id} style={{ 
                  padding: '10px', 
                  margin: '5px 0', 
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px'
                }}>
                  <strong>{character.name}</strong>
                  <span style={{ marginLeft: '10px', color: '#FFD700' }}>
                    {character.category}
                  </span>
                  <span style={{ marginLeft: '10px', color: '#4CAF50' }}>
                    能力: {character.power}
                  </span>
                </div>
              ))}
              {searchResults.data.length > 5 && (
                <p>... 还有 {searchResults.data.length - 5} 个结果</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
        <h4>📚 使用说明</h4>
        <ul>
          <li><strong>角色搜索</strong>: 支持关键词、分类、能力值范围等多种搜索条件</li>
          <li><strong>健康检查</strong>: 实时监控服务器状态和数据库连接</li>
          <li><strong>Hook使用</strong>: 使用 useCharacterSearch 和 useHealthCheck 简化状态管理</li>
          <li><strong>直接API</strong>: 使用 DataApi.searchCharacters() 和 DataApi.healthCheck() 进行直接调用</li>
        </ul>
      </div>
    </div>
  )
}
