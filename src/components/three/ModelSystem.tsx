import React, { useState, useCallback, Suspense } from 'react'
import { ModelLoader } from './ModelLoader'
import ModelEffectRenderer, { ModelEffectConfig } from './ModelEffectRenderer'
import { useModelEffectStore } from '../../stores/useModelEffectStore'
import { useModelExists } from '../../hooks/useSmartModelDetection'
import * as THREE from 'three'

interface ModelSystemProps {
  characterName: string
  fallbackSphere?: React.ReactNode
  showGUI?: boolean
  visible?: boolean
}

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
 * 模型系统组件
 * 功能：
 * - 统一管理模型加载、特效渲染和GUI控制
 * - 实现条件渲染逻辑（模型存在时显示模型，否则显示球体）
 * - 提供完整的调试界面
 * - 处理加载状态和错误
 */
export const ModelSystem: React.FC<ModelSystemProps> = ({
  characterName,
  fallbackSphere,
  showGUI = true,
  visible = true
}) => {
  const [loadedModel, setLoadedModel] = useState<THREE.Group | null>(null)
  const [modelError, setModelError] = useState<Error | null>(null)

  // 使用全局配置store
  const { config } = useModelEffectStore()
  
  // 检查模型是否存在
  const { exists: modelExists, checking } = useModelExists(characterName)

  // 处理模型加载成功
  const handleModelLoad = useCallback((model: THREE.Group) => {
    console.log(`🎯 模型加载成功: ${characterName}`)
    setLoadedModel(model)
    setModelError(null)
  }, [characterName])

  // 处理模型加载错误
  const handleModelError = useCallback((error: Error) => {
    console.warn(`⚠️ 模型加载失败: ${characterName}`, error)
    setLoadedModel(null)
    setModelError(error)
  }, [characterName])

  // 配置变化处理已移到全局store中

  // 如果正在检查模型存在性，显示加载状态
  if (checking) {
    return (
      <group visible={visible}>
        {/* 可以添加加载指示器 */}
        <mesh>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#666666" transparent opacity={0.5} />
        </mesh>
      </group>
    )
  }

  return (
    <>
      <group visible={visible}>
        {/* 条件渲染：模型存在且加载成功时显示模型特效，否则显示球体 */}
        {modelExists && !modelError ? (
          <Suspense fallback={
            <mesh>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#666666" transparent opacity={0.5} />
            </mesh>
          }>
            {/* 模型加载器 */}
            <ModelLoader
              characterName={characterName}
              onModelLoad={handleModelLoad}
              onModelError={handleModelError}
              visible={false} // 隐藏原始模型，只显示特效
            />

            {/* 模型特效渲染器 */}
            {loadedModel && (
              <ModelEffectRenderer
                model={loadedModel}
                config={config}
                visible={true}
              />
            )}
          </Suspense>
        ) : (
          <>
            {/* 回退到球体渲染 */}
            {fallbackSphere}
          </>
        )}
      </group>

      {/* GUI调试面板已移到Canvas外部 */}
    </>
  )
}

export default ModelSystem
