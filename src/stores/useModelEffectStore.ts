import { create } from 'zustand'
import { ModelEffectConfig } from '../components/three/ModelEffectRenderer'

interface ModelEffectState {
  // 当前配置
  config: ModelEffectConfig
  
  // 配置管理方法
  setConfig: (config: ModelEffectConfig) => void
  updateConfig: (updates: Partial<ModelEffectConfig>) => void
  resetConfig: () => void
}

const defaultConfig: ModelEffectConfig = {
  showWireframe: true,
  showPoints: true,
  activePaletteIndex: 3,
  pointSize: 0.9,
  pointBrightness: 2.0,
  pointOpacity: 1.0,
  pulseIntensity: 2.0,
  wireframeBrightness: 0.2,
  wireframeOpacity: 1.0,
  rotationSpeed: 0.002,
  pulseSpeed: 10.0,
  modelScale: 18.0,
  modelRotationX: 0,
  modelRotationY: 0,
  modelRotationZ: 0
}

/**
 * 模型特效配置全局状态管理
 * 功能：
 * - 管理模型特效的全局配置
 * - 支持GUI和渲染器之间的状态同步
 * - 提供配置的持久化和恢复
 */
export const useModelEffectStore = create<ModelEffectState>((set, get) => ({
  config: defaultConfig,

  setConfig: (config) => {
    console.log('🎛️ 更新模型特效配置:', config)
    set({ config })
  },

  updateConfig: (updates) => {
    const currentConfig = get().config
    const newConfig = { ...currentConfig, ...updates }
    console.log('🔧 部分更新模型特效配置:', updates)
    set({ config: newConfig })
  },

  resetConfig: () => {
    console.log('🔄 重置模型特效配置为默认值')
    set({ config: defaultConfig })
  }
}))

export default useModelEffectStore
