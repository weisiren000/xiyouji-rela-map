import { useState, useCallback } from 'react'
import { ModelEffectConfig } from '../components/three/ModelSystem/components/ModelEffectRenderer'

const defaultConfig: ModelEffectConfig = {
  showWireframe: true,
  showPoints: true,
  activePaletteIndex: 1,
  pointSize: 1.0,
  pointBrightness: 0.7,
  pointOpacity: 0.8,
  pulseIntensity: 0.8,
  wireframeBrightness: 0.7,
  wireframeOpacity: 0.8,
  rotationSpeed: 0.0005,
  pulseSpeed: 3.0,
  modelScale: 18.0,
  modelRotationX: 0,
  modelRotationY: 0,
  modelRotationZ: 0
}

/**
 * 模型特效配置管理Hook
 * 功能：
 * - 管理模型特效配置状态
 * - 提供配置更新方法
 * - 支持多个组件共享配置
 */
export const useModelEffectConfig = (characterName: string) => {
  const [config, setConfig] = useState<ModelEffectConfig>(defaultConfig)

  // 处理配置变化
  const handleConfigChange = useCallback((newConfig: ModelEffectConfig) => {
    setConfig(newConfig)
    console.log(`🎛️ 模型配置更新 (${characterName}):`, newConfig)
  }, [characterName])

  // 重置为默认配置
  const resetConfig = useCallback(() => {
    setConfig(defaultConfig)
    console.log(`🔄 重置模型配置 (${characterName})`)
  }, [characterName])

  return {
    config,
    setConfig: handleConfigChange,
    resetConfig
  }
}

export default useModelEffectConfig
