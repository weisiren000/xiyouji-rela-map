

import { GalaxyScene } from '@scenes/GalaxyScene'
import { ControlPanel, InfoDisplay } from '@components/controls/ControlPanel'


import { DataDashboard } from '@components/dashboard/DataDashboard'
import { CharacterInfoOverlay } from '@components/indicators/CharacterInfoOverlay'
import { CharacterDetailView } from '@components/views/CharacterDetailView'
import { ModelQuickAccess } from '@components/views/ModelQuickAccess'
import { useCharacterInfoStore } from '@/stores/useCharacterInfoStore'
import { useGalaxyStore } from '@/stores/useGalaxyStore'


import { useLoadingStatus } from '@/hooks/useAutoLoader'

/**
 * 主应用组件
 * 1:1复刻原始HTML文件的银河系效果
 * 集成自动数据加载功能
 */
function App() {
  // 自动加载数据
  const { isLoading } = useLoadingStatus()

  // 🌐 全局角色信息状态
  const { hoveredCharacter, mousePosition, showInfoCard } = useCharacterInfoStore()

  // 🎯 视图状态管理 - 使用星谱特定的视图状态
  const { mainPageViewMode } = useGalaxyStore()

  // 生产环境已移除调试日志



  return (
    <div className="app">
      {/* 条件渲染：全局视图 vs 详情视图 */}
      {mainPageViewMode === 'galaxy' ? (
        <>
          {/* 全局银河系视图 */}
          {/* 信息显示 */}
          <InfoDisplay />

          {/* 3D场景 */}
          <GalaxyScene />

          {/* 控制面板 */}
          <ControlPanel />

          {/* 数据管理Dashboard */}
          <DataDashboard />

          {/* 模型快速访问 */}
          <ModelQuickAccess />
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
      {mainPageViewMode === 'galaxy' && (
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
