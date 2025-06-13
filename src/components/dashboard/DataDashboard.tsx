import React, { useState, useEffect } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { DashboardTab } from '@/types/dashboard'
import { DataLoader } from './DataLoader'
import { DataEditor } from './DataEditor'
import { CharacterMapper } from './CharacterMapper'
import { DataPreview } from './DataPreview'
import './DataDashboard.css'

/**
 * 西游记数据管理Dashboard主界面
 */
export const DataDashboard: React.FC = () => {
  const {
    dashboard,
    stats,
    setDashboardVisible,
    setActiveTab
  } = useDataStore()

  const activeTab = dashboard.activeTab

  const [isMinimized, setIsMinimized] = useState(false)

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+D 切换Dashboard显示
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault()
        setDashboardVisible(!dashboard.isVisible)
      }
      
      // ESC 关闭Dashboard
      if (event.key === 'Escape' && dashboard.isVisible) {
        setDashboardVisible(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dashboard.isVisible, setDashboardVisible])

  if (!dashboard.isVisible) {
    return (
      <div className="dashboard-toggle">
        <button
          onClick={() => setDashboardVisible(true)}
          className="dashboard-toggle-btn"
          title="打开数据管理面板 (Ctrl+D)"
        >
          数据管理
        </button>
      </div>
    )
  }

  return (
    <div className={`data-dashboard ${isMinimized ? 'minimized' : ''}`}>
      {/* 头部工具栏 */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>🎭 西游记数据管理</h2>
          <div className="dashboard-stats-summary">
            {stats && (
              <span>
                {stats.totalCharacters} 个角色 | 
                {stats.relationshipCount} 个关系 |
                最后更新: {new Date(stats.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="dashboard-controls">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="dashboard-control-btn"
            title={isMinimized ? "展开" : "最小化"}
          >
            {isMinimized ? '📈' : '📉'}
          </button>
          
          <button
            onClick={() => setDashboardVisible(false)}
            className="dashboard-control-btn"
            title="关闭 (ESC)"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 标签页导航 */}
          <div className="dashboard-tabs">
            <button
              className={`tab-btn ${activeTab === DashboardTab.DATA_LOADER ? 'active' : ''}`}
              onClick={() => setActiveTab(DashboardTab.DATA_LOADER)}
            >
              📁 数据加载
            </button>
            
            <button
              className={`tab-btn ${activeTab === DashboardTab.DATA_EDITOR ? 'active' : ''}`}
              onClick={() => setActiveTab(DashboardTab.DATA_EDITOR)}
            >
              ✏️ 数据编辑
            </button>
            
            <button
              className={`tab-btn ${activeTab === DashboardTab.CHARACTER_MAPPER ? 'active' : ''}`}
              onClick={() => setActiveTab(DashboardTab.CHARACTER_MAPPER)}
            >
              🎯 角色映射
            </button>
            
            <button
              className={`tab-btn ${activeTab === DashboardTab.DATA_PREVIEW ? 'active' : ''}`}
              onClick={() => setActiveTab(DashboardTab.DATA_PREVIEW)}
            >
              👁️ 数据预览
            </button>
            
            <button
              className={`tab-btn ${activeTab === DashboardTab.SETTINGS ? 'active' : ''}`}
              onClick={() => setActiveTab(DashboardTab.SETTINGS)}
            >
              ⚙️ 设置
            </button>
          </div>

          {/* 内容区域 */}
          <div className="dashboard-content">
            {dashboard.isLoading && (
              <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <span>加载中...</span>
              </div>
            )}

            {dashboard.error && (
              <div className="dashboard-error">
                <span>❌ {dashboard.error}</span>
                <button onClick={() => useDataStore.getState().setError(null)}>
                  关闭
                </button>
              </div>
            )}

            {/* 标签页内容 */}
            {activeTab === DashboardTab.DATA_LOADER && <DataLoader />}
            {activeTab === DashboardTab.DATA_EDITOR && <DataEditor />}
            {activeTab === DashboardTab.CHARACTER_MAPPER && <CharacterMapper />}
            {activeTab === DashboardTab.DATA_PREVIEW && <DataPreview />}
            {activeTab === DashboardTab.SETTINGS && <DashboardSettings />}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Dashboard设置组件
 */
const DashboardSettings: React.FC = () => {
  const { config, updateConfig } = useDataStore()

  return (
    <div className="dashboard-settings">
      <h3>⚙️ 设置</h3>
      
      <div className="settings-section">
        <h4>数据路径</h4>
        <input
          type="text"
          value={config.dataPath}
          onChange={(e) => updateConfig({ dataPath: e.target.value })}
          className="settings-input"
          placeholder="JSON数据文件夹路径"
        />
      </div>

      <div className="settings-section">
        <h4>自动保存</h4>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={config.autoSave}
            onChange={(e) => updateConfig({ autoSave: e.target.checked })}
          />
          启用自动保存
        </label>
        
        {config.autoSave && (
          <div className="settings-subsection">
            <label>
              保存间隔 (秒):
              <input
                type="number"
                value={config.autoSaveInterval}
                onChange={(e) => updateConfig({ autoSaveInterval: parseInt(e.target.value) })}
                min="5"
                max="300"
                className="settings-number"
              />
            </label>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h4>界面主题</h4>
        <select
          value={config.theme}
          onChange={(e) => updateConfig({ theme: e.target.value as 'light' | 'dark' })}
          className="settings-select"
        >
          <option value="dark">深色主题</option>
          <option value="light">浅色主题</option>
        </select>
      </div>

      <div className="settings-section">
        <h4>语言</h4>
        <select
          value={config.language}
          onChange={(e) => updateConfig({ language: e.target.value as 'zh' | 'en' })}
          className="settings-select"
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="settings-section">
        <h4>操作历史</h4>
        <label>
          最大撤销步数:
          <input
            type="number"
            value={config.maxUndoSteps}
            onChange={(e) => updateConfig({ maxUndoSteps: parseInt(e.target.value) })}
            min="10"
            max="100"
            className="settings-number"
          />
        </label>
      </div>

      <div className="settings-actions">
        <button className="settings-btn primary">
          💾 保存设置
        </button>
        
        <button className="settings-btn secondary">
          🔄 重置为默认
        </button>
        
        <button className="settings-btn danger">
          🗑️ 清除所有数据
        </button>
      </div>
    </div>
  )
}
