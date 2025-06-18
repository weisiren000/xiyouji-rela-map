
import { useEffect } from 'react'
import { GalaxyScene } from '@scenes/GalaxyScene'
import { ControlPanel, InfoDisplay } from '@components/ui/ControlPanel'
import { PerformanceDisplay } from '@components/ui/PerformanceDisplay'


import { DataDashboard } from '@components/dashboard/DataDashboard'
import { CharacterInfoOverlay } from '@components/ui/CharacterInfoOverlay'
import { CharacterDetailView } from '@components/ui/CharacterDetailView'
import { useCharacterInfoStore } from '@/stores/useCharacterInfoStore'
import { useGalaxyStore } from '@/stores/useGalaxyStore'

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

  // 🌐 全局角色信息状态
  const { hoveredCharacter, mousePosition, showInfoCard } = useCharacterInfoStore()

  // 🎯 视图状态管理
  const { viewMode, selectedCharacter } = useGalaxyStore()

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

  // 🌐 全局状态变化日志
  useEffect(() => {
    if (hoveredCharacter) {
      console.log('📱 App层接收到角色信息:', hoveredCharacter.name)
      console.log('📍 鼠标位置:', mousePosition.x, mousePosition.y)
      console.log('💳 显示信息卡片:', showInfoCard)
    }
  }, [hoveredCharacter, mousePosition, showInfoCard])

  return (
    <div className="app">
      {/* 条件渲染：全局视图 vs 详情视图 */}
      {viewMode === 'galaxy' ? (
        <>
          {/* 全局银河系视图 */}
          {/* 信息显示 */}
          <InfoDisplay />

          {/* 3D场景 */}
          <GalaxyScene />

          {/* 性能显示 */}
          <PerformanceDisplay />

          {/* 控制面板 */}
          <ControlPanel />

          {/* 数据管理Dashboard */}
          <DataDashboard />
        </>
      ) : (
        <>
          {/* 角色详情视图 */}
          <CharacterDetailView />
        </>
      )}

      {/* 全局UI元素 - 在所有视图中都显示 */}

      {/* 加载状态指示器 */}
      {isLoading && (
        <div className="app-loading-indicator">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <span>正在自动加载数据...</span>
          </div>
        </div>
      )}

      {/* 🎯 全局角色信息卡片 - 只在银河系视图中显示 */}
      {viewMode === 'galaxy' && (
        <CharacterInfoOverlay
          character={hoveredCharacter}
          mousePosition={mousePosition}
          visible={showInfoCard}
        />
      )}
    </div>
  )
}

export default App
