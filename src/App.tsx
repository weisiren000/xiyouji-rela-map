
import { useEffect } from 'react'
import { GalaxyScene } from '@scenes/GalaxyScene'
import { ControlPanel, InfoDisplay } from '@components/ui/ControlPanel'
import { PerformanceDisplay } from '@components/ui/PerformanceDisplay'
import { WebGPUStatus } from '@components/ui/WebGPUStatus'
import { DataDashboard } from '@components/dashboard/DataDashboard'

import { useAutoLoader, useLoadingStatus, useServerConnection } from '@/hooks/useAutoLoader'

/**
 * 主应用组件
 * 1:1复刻原始HTML文件的银河系效果
 * 集成自动数据加载功能
 */
function App() {
  // 自动加载数据
  const { isInitialized, autoLoadEnabled } = useAutoLoader()
  const { isLoading, hasData, dataCount } = useLoadingStatus()
  const { isOnline } = useServerConnection()

  // 应用启动日志
  useEffect(() => {
    console.log('🚀 西游记银河系可视化应用启动')
    console.log('📡 自动加载:', autoLoadEnabled ? '启用' : '禁用')
    console.log('🌐 服务器状态:', isOnline ? '在线' : '离线')
  }, [autoLoadEnabled, isOnline])

  // 数据加载状态日志
  useEffect(() => {
    if (isInitialized) {
      console.log('✅ 应用初始化完成')
      console.log('📊 数据状态:', hasData ? `已加载 ${dataCount} 个角色` : '无数据')
    }
  }, [isInitialized, hasData, dataCount])

  return (
    <div className="app">
      {/* 信息显示 */}
      <InfoDisplay />

      {/* 3D场景 */}
      <GalaxyScene />

      {/* 性能显示 */}
      <PerformanceDisplay />

      {/* WebGPU状态显示 */}
      <WebGPUStatus />

      {/* 控制面板 */}
      <ControlPanel />

      {/* 数据管理Dashboard */}
      <DataDashboard />

      {/* 加载状态指示器 */}
      {isLoading && (
        <div className="app-loading-indicator">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <span>正在自动加载数据...</span>
          </div>
        </div>
      )}

      {/* 服务器状态指示器 */}
      {isOnline === false && (
        <div className="app-status-indicator offline">
          <span>🔴 数据服务器离线</span>
        </div>
      )}

      {/* 数据状态指示器 */}
      {isInitialized && hasData && (
        <div className="app-status-indicator online">
          <span>🟢 已加载 {dataCount} 个角色</span>
        </div>
      )}
    </div>
  )
}

export default App
