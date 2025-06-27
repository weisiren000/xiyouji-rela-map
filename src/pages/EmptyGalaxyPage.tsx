import { useEffect } from 'react'
import { EmptyGalaxyScene } from '@scenes/EmptyGalaxyScene'
import { ControlPanel, InfoDisplay } from '@components/controls/ControlPanel'
import { DataDashboard } from '@components/dashboard/DataDashboard'
import { EventInfoOverlay } from '@components/indicators/EventInfoOverlay'
import { CharacterDetailView } from '@components/views/CharacterDetailView'
import { EventDetailView } from '@components/views/EventDetailView'
import { ModelQuickAccess } from '@components/views/ModelQuickAccess'
import { SpiralControls } from '@components/controls/SpiralDebugGUI'
import { useEventInfoStore } from '@/stores/useEventInfoStore'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { useAutoLoader, useLoadingStatus, useServerConnection } from '@/hooks/useAutoLoader'

/**
 * 空银河系页面组件
 * 与主页面相同的界面和功能，但不加载任何数据点
 * 用于测试和演示银河系基础效果
 */
function EmptyGalaxyPage() {
  // 自动加载数据 - 但在这个页面中不会实际加载数据点
  const { isInitialized, autoLoadEnabled } = useAutoLoader()
  const { isLoading, hasData, dataCount } = useLoadingStatus()
  const { isOnline } = useServerConnection()

  // 🌐 全局事件信息状态
  const { hoveredEvent, mousePosition, showInfoCard } = useEventInfoStore()

  // 🎯 视图状态管理
  const { viewMode, selectedCharacter, selectedEvent, applyCameraPreset } = useGalaxyStore()

  // 应用启动日志
  useEffect(() => {
    console.log('🚀 空银河系可视化页面启动')
    console.log('📡 自动加载:', autoLoadEnabled ? '启用' : '禁用')
    console.log('🌐 服务器状态:', isOnline ? '在线' : '离线')
    console.log('⚠️ 注意：此页面不会加载任何数据点')
    
    // 确保使用俯视视角作为默认视角
    applyCameraPreset('top-view')
  }, [autoLoadEnabled, isOnline, applyCameraPreset])

  // 数据加载状态日志
  useEffect(() => {
    if (isInitialized) {
      console.log('✅ 空银河系页面初始化完成')
      console.log('📊 数据状态:', hasData ? `已加载 ${dataCount} 个角色` : '无数据')
    }
  }, [isInitialized, hasData, dataCount])

  // 🌐 全局状态变化日志
  useEffect(() => {
    if (hoveredEvent) {
      console.log('📱 EmptyGalaxyPage层接收到事件信息:', hoveredEvent.nanming)
      console.log('📍 鼠标位置:', mousePosition.x, mousePosition.y)
      console.log('💳 显示信息卡片:', showInfoCard)
    }
  }, [hoveredEvent, mousePosition, showInfoCard])

  return (
    <div className="app">
      {/* 条件渲染：全局视图 vs 详情视图 */}
      {viewMode === 'galaxy' ? (
        <>
          {/* 空银河系视图 */}
          {/* 信息显示 */}
          <InfoDisplay />

          {/* 3D场景 - 使用空银河系场景 */}
          <EmptyGalaxyScene />

          {/* 控制面板 */}
          <ControlPanel />

          {/* 数据管理Dashboard */}
          <DataDashboard />

          {/* 模型快速访问 */}
          <ModelQuickAccess />

          {/* 螺旋线控制面板 */}
          <SpiralControls visible={true} />
        </>
      ) : (
        <>
          {/* 详情视图 - 根据选中的内容类型显示不同的详情视图 */}
          {selectedCharacter && <CharacterDetailView />}
          {selectedEvent && <EventDetailView />}
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

      {/* 🎯 全局事件信息卡片 - 只在银河系视图中显示 */}
      {viewMode === 'galaxy' && (
        <EventInfoOverlay
          event={hoveredEvent}
          mousePosition={mousePosition}
          visible={showInfoCard}
        />
      )}

      {/* 页面标识已移除 */}
    </div>
  )
}

export default EmptyGalaxyPage
