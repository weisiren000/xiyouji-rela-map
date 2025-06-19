import React from 'react'
import ModelEffectGUI from './ModelEffectGUI'
import { useModelExists } from '../../hooks/useSmartModelDetection'
import { useModelEffectStore } from '../../stores/useModelEffectStore'

interface ModelGUIManagerProps {
  characterName: string
  visible?: boolean
}

/**
 * 模型GUI管理器
 * 功能：
 * - 管理模型特效配置状态
 * - 只在有模型时显示GUI
 * - 在Canvas外部渲染GUI
 */
export const ModelGUIManager: React.FC<ModelGUIManagerProps> = ({
  characterName,
  visible = true
}) => {
  const { exists: modelExists } = useModelExists(characterName)
  const { config, setConfig } = useModelEffectStore()

  // 只在有模型且可见时显示GUI
  if (!visible || !modelExists) {
    return null
  }

  return (
    <ModelEffectGUI
      config={config}
      onConfigChange={setConfig}
      visible={true}
    />
  )
}

export default ModelGUIManager
