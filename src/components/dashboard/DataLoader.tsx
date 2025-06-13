import React, { useState, useEffect } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { DataApi } from '@/services/dataApi'
import { useAutoLoader, useLoadingStatus, useServerConnection } from '@/hooks/useAutoLoader'

/**
 * 数据加载器组件
 * 负责扫描和加载JSON文件
 */
export const DataLoader: React.FC = () => {
  const {
    loader,
    setDataPath,
    setFoundFiles,
    setSelectedFiles,
    setLoadProgress,
    setCharacters,
    setLoading,
    setError
  } = useDataStore()

  const { autoLoadEnabled, toggleAutoLoad, manualReload } = useAutoLoader()
  const { isLoading, hasData, dataCount, loadProgress } = useLoadingStatus()
  const { isOnline, lastCheck } = useServerConnection()

  const [isScanning, setIsScanning] = useState(false)
  const [selectAll, setSelectAll] = useState(true)

  // 检查服务器连接
  const checkServerConnection = async () => {
    try {
      const isOnline = await DataApi.checkConnection()
      if (!isOnline) {
        setError('无法连接到数据服务器，请确保服务器已启动 (npm run server)')
        return false
      }
      return true
    } catch (error) {
      setError(`服务器连接失败: ${error}`)
      return false
    }
  }

  // 扫描文件夹（模拟扫描，实际通过API获取）
  const handleScan = async () => {
    setIsScanning(true)
    setError(null)

    try {
      // 检查服务器连接
      const isConnected = await checkServerConnection()
      if (!isConnected) return

      // 模拟文件列表（实际数据通过API获取）
      const mockFiles = [
        'character_c0001_sunwukong.json',
        'character_c0002_tangseng.json',
        'character_c0003_zhubajie.json',
        'character_c0004_shaheshang.json',
        'character_c0005_xiaobailong.json'
      ]

      setFoundFiles(mockFiles)

      // 默认选择所有文件
      if (selectAll) {
        setSelectedFiles(mockFiles)
      }

      console.log(`扫描完成，找到 ${mockFiles.length} 个JSON文件`)
    } catch (error) {
      setError(`扫描失败: ${error}`)
    } finally {
      setIsScanning(false)
    }
  }

  // 加载选中的文件（通过API加载真实数据）
  const handleLoad = async () => {
    setLoading(true)
    setError(null)
    setLoadProgress(0)

    try {
      // 检查服务器连接
      const isConnected = await checkServerConnection()
      if (!isConnected) return

      // 模拟加载进度
      setLoadProgress(20)

      // 获取完整数据
      const completeData = await DataApi.getCompleteData()
      setLoadProgress(80)

      // 设置角色数据
      setCharacters(completeData.characters)
      setLoadProgress(100)

      console.log(`✅ 成功加载 ${completeData.characters.length} 个角色`)
      console.log(`✅ 成功加载 ${completeData.aliases.length} 个别名`)

    } catch (error) {
      setError(`加载过程中出错: ${error}`)
      console.error('❌ 数据加载失败:', error)
    } finally {
      setLoading(false)
      setTimeout(() => setLoadProgress(0), 1000) // 延迟清除进度条
    }
  }

  // 文件选择处理
  const handleFileToggle = (fileName: string) => {
    const newSelected = loader.selectedFiles.includes(fileName)
      ? loader.selectedFiles.filter(f => f !== fileName)
      : [...loader.selectedFiles, fileName]
    
    setSelectedFiles(newSelected)
  }

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFiles(loader.foundFiles)
    } else {
      setSelectedFiles([])
    }
  }

  useEffect(() => {
    handleSelectAll()
  }, [selectAll, loader.foundFiles])

  return (
    <div className="data-loader">
      <h3>📁 数据加载器</h3>

      {/* 自动加载状态 */}
      <div className="loader-section">
        <h4>🤖 自动加载状态</h4>
        <div className="auto-load-status">
          <div className="status-row">
            <span className="status-label">服务器状态:</span>
            <span className={`status-value ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢 在线' : '🔴 离线'}
            </span>
            {lastCheck && (
              <span className="status-time">
                (检查于 {lastCheck.toLocaleTimeString()})
              </span>
            )}
          </div>

          <div className="status-row">
            <span className="status-label">数据状态:</span>
            <span className={`status-value ${hasData ? 'loaded' : 'empty'}`}>
              {hasData ? `✅ 已加载 ${dataCount} 个角色` : '📭 无数据'}
            </span>
          </div>

          <div className="status-row">
            <span className="status-label">自动加载:</span>
            <label className="auto-load-toggle">
              <input
                type="checkbox"
                checked={autoLoadEnabled}
                onChange={(e) => toggleAutoLoad(e.target.checked)}
              />
              <span>{autoLoadEnabled ? '✅ 启用' : '❌ 禁用'}</span>
            </label>
          </div>

          {isLoading && (
            <div className="status-row">
              <span className="status-label">加载进度:</span>
              <div className="inline-progress">
                <div className="progress-bar-small">
                  <div
                    className="progress-fill-small"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <span className="progress-text-small">{Math.round(loadProgress)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="auto-load-actions">
          <button
            onClick={manualReload}
            disabled={isLoading}
            className="reload-btn"
          >
            {isLoading ? '⏳ 加载中...' : '🔄 立即重新加载'}
          </button>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="scan-btn secondary"
          >
            {isScanning ? '🔍 扫描中...' : '📂 扫描文件夹'}
          </button>

          {!isOnline && (
            <div className="server-hint">
              💡 提示: 请确保数据服务器已启动 (npm run server)
            </div>
          )}
        </div>
      </div>

      {/* 路径配置 */}
      <div className="loader-section">
        <h4>数据路径</h4>
        <div className="path-input-group">
          <input
            type="text"
            value={loader.dataPath}
            onChange={(e) => setDataPath(e.target.value)}
            placeholder="输入JSON文件夹路径"
            className="path-input"
          />
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="scan-btn"
          >
            {isScanning ? '扫描中...' : '🔍 扫描'}
          </button>
        </div>
        <div className="path-hint">
          默认路径: D:\codee\xiyouji-rela-map\docs\data\JSON
        </div>
      </div>

      {/* 文件列表 */}
      {loader.foundFiles.length > 0 && (
        <div className="loader-section">
          <div className="files-header">
            <h4>找到的文件 ({loader.foundFiles.length})</h4>
            <div className="files-controls">
              <label className="select-all-checkbox">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => setSelectAll(e.target.checked)}
                />
                全选
              </label>
              <span className="selected-count">
                已选择: {loader.selectedFiles.length}
              </span>
            </div>
          </div>

          <div className="files-list">
            {loader.foundFiles.map((fileName) => (
              <div key={fileName} className="file-item">
                <label className="file-checkbox">
                  <input
                    type="checkbox"
                    checked={loader.selectedFiles.includes(fileName)}
                    onChange={() => handleFileToggle(fileName)}
                  />
                  <span className="file-name">{fileName}</span>
                </label>
                
                <div className="file-info">
                  {fileName.startsWith('c') && !fileName.startsWith('ca') && (
                    <span className="file-type character">角色</span>
                  )}
                  {fileName.startsWith('ca') && (
                    <span className="file-type alias">别名</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 加载控制 */}
      {loader.selectedFiles.length > 0 && (
        <div className="loader-section">
          <div className="load-controls">
            <button
              onClick={handleLoad}
              disabled={loader.selectedFiles.length === 0 || isLoading}
              className="load-btn primary"
            >
              {isLoading ? '🔄 正在加载...' : `🚀 开始加载数据 (${loader.selectedFiles.length} 个文件)`}
            </button>

            <div className="load-options">
              <label className="load-option">
                <input type="checkbox" defaultChecked />
                ✅ 验证数据格式
              </label>
              <label className="load-option">
                <input type="checkbox" defaultChecked />
                🔧 自动修复错误
              </label>
              <label className="load-option">
                <input type="checkbox" defaultChecked />
                📊 生成统计报告
              </label>
            </div>
          </div>

          {/* 加载进度 */}
          {loader.loadProgress > 0 && (
            <div className="load-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${loader.loadProgress}%` }}
                />
              </div>
              <span className="progress-text">
                {Math.round(loader.loadProgress)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* 快速操作 */}
      <div className="loader-section">
        <h4>⚡ 快速操作</h4>
        <div className="quick-actions">
          <button
            className="quick-btn primary"
            onClick={() => handleLoad()}
            disabled={isLoading}
          >
            📋 加载示例数据
          </button>
          <button
            className="quick-btn secondary"
            onClick={handleScan}
            disabled={isScanning}
          >
            🔄 重新扫描文件
          </button>
          <button className="quick-btn secondary">
            📤 导出当前数据
          </button>
          <button className="quick-btn secondary">
            📥 导入外部文件
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      {loader.stats && (
        <div className="loader-section">
          <h4>数据统计</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">总角色数</span>
              <span className="stat-value">{loader.stats.totalCharacters}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">关系数</span>
              <span className="stat-value">{loader.stats.relationshipCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">最后更新</span>
              <span className="stat-value">
                {new Date(loader.stats.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
