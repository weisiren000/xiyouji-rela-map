import React, { useEffect, useRef } from 'react'
import { GUI } from 'lil-gui'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { EVENT_CHARACTER_GRAPH_PRESETS } from '@/types/eventCharacterGraph'

/**
 * 事件角色关系图谱GUI控制面板
 * 用于实时调试和配置关系图谱的球体渲染参数
 */

interface EventCharacterGraphGUIProps {
  visible?: boolean
  position?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
}

export const EventCharacterGraphGUI: React.FC<EventCharacterGraphGUIProps> = ({
  visible = true,
  position = { bottom: 20, left: 20 }
}) => {
  const guiRef = useRef<GUI | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)

  const { eventCharacterGraphConfig, updateEventCharacterGraphConfig } = useGalaxyStore()

  useEffect(() => {
    if (!containerRef.current || !visible || isInitializedRef.current) return

    // 标记为已初始化
    isInitializedRef.current = true

    // 创建GUI实例
    const gui = new GUI({
      container: containerRef.current,
      title: '关系图谱控制',
      width: 320
    })

    guiRef.current = gui

    // 设置整个GUI面板为收缩状态
    gui.close()

    // 创建配置对象的副本用于GUI绑定
    const guiConfig = { ...eventCharacterGraphConfig }

    // 预设配置
    const presetFolder = gui.addFolder('预设配置')
    const presetNames = Object.keys(EVENT_CHARACTER_GRAPH_PRESETS)
    const presetController = {
      preset: 'default',
      applyPreset: () => {
        const selectedPreset = EVENT_CHARACTER_GRAPH_PRESETS[presetController.preset as keyof typeof EVENT_CHARACTER_GRAPH_PRESETS]
        if (selectedPreset) {
          updateEventCharacterGraphConfig(selectedPreset.config)
        }
      }
    }
    
    presetFolder.add(presetController, 'preset', presetNames).name('选择预设')
    presetFolder.add(presetController, 'applyPreset').name('应用预设')

    // 球体基础属性
    const basicFolder = gui.addFolder('球体基础属性')
    basicFolder.add(guiConfig, 'baseSize', 0.1, 2.0, 0.1).name('基础大小').onChange((value: number) => {
      updateEventCharacterGraphConfig({ baseSize: value })
    })
    basicFolder.add(guiConfig, 'opacity', 0.0, 1.0, 0.01).name('透明度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ opacity: value })
    })
    basicFolder.add(guiConfig, 'metalness', 0.0, 1.0, 0.01).name('金属度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ metalness: value })
    })
    basicFolder.add(guiConfig, 'roughness', 0.0, 1.0, 0.01).name('粗糙度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ roughness: value })
    })

    // 动画效果
    const animationFolder = gui.addFolder('动画效果')
    animationFolder.add(guiConfig, 'floatIntensity', 0.0, 1.0, 0.01).name('浮动强度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ floatIntensity: value })
    })
    animationFolder.add(guiConfig, 'floatSpeed', 0.5, 5.0, 0.1).name('浮动速度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ floatSpeed: value })
    })
    animationFolder.add(guiConfig, 'pulseIntensity', 0.0, 0.5, 0.01).name('脉冲强度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ pulseIntensity: value })
    })
    animationFolder.add(guiConfig, 'pulseSpeed', 1.0, 8.0, 0.1).name('脉冲速度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ pulseSpeed: value })
    })
    animationFolder.add(guiConfig, 'rotationSpeed', 0.0, 1.0, 0.01).name('旋转速度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ rotationSpeed: value })
    })
    animationFolder.add(guiConfig, 'rotationAmplitude', 0.0, 0.5, 0.01).name('旋转幅度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ rotationAmplitude: value })
    })

    // 交互状态
    const interactionFolder = gui.addFolder('交互状态')
    interactionFolder.add(guiConfig, 'hoverSizeMultiplier', 1.0, 2.0, 0.01).name('悬浮大小倍数').onChange((value: number) => {
      updateEventCharacterGraphConfig({ hoverSizeMultiplier: value })
    })
    interactionFolder.add(guiConfig, 'longPressSizeMultiplier', 1.0, 2.0, 0.01).name('长按大小倍数').onChange((value: number) => {
      updateEventCharacterGraphConfig({ longPressSizeMultiplier: value })
    })
    interactionFolder.add(guiConfig, 'dragSizeMultiplier', 1.0, 3.0, 0.01).name('拖拽大小倍数').onChange((value: number) => {
      updateEventCharacterGraphConfig({ dragSizeMultiplier: value })
    })
    interactionFolder.add(guiConfig, 'hoverColorMultiplier', 1.0, 2.0, 0.01).name('悬浮颜色倍数').onChange((value: number) => {
      updateEventCharacterGraphConfig({ hoverColorMultiplier: value })
    })
    interactionFolder.add(guiConfig, 'longPressGoldLerp', 0.0, 1.0, 0.01).name('长按金色混合').onChange((value: number) => {
      updateEventCharacterGraphConfig({ longPressGoldLerp: value })
    })
    interactionFolder.add(guiConfig, 'dragGoldMultiplier', 1.0, 5.0, 0.1).name('拖拽金色倍数').onChange((value: number) => {
      updateEventCharacterGraphConfig({ dragGoldMultiplier: value })
    })

    // 连接线属性
    const lineFolder = gui.addFolder('连接线属性')
    lineFolder.add(guiConfig, 'lineOpacity', 0.0, 1.0, 0.01).name('线条透明度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ lineOpacity: value })
    })
    lineFolder.add(guiConfig, 'lineOpacityDrag', 0.0, 1.0, 0.01).name('拖拽时透明度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ lineOpacityDrag: value })
    })
    lineFolder.add(guiConfig, 'lineWidth', 1, 10, 1).name('线条宽度').onChange((value: number) => {
      updateEventCharacterGraphConfig({ lineWidth: value })
    })

    // 几何体属性
    const geometryFolder = gui.addFolder('几何体属性')
    geometryFolder.add(guiConfig, 'sphereSegments', 4, 32, 1).name('球体分段数').onChange((value: number) => {
      updateEventCharacterGraphConfig({ sphereSegments: value })
    })
    geometryFolder.add(guiConfig, 'sphereRings', 4, 32, 1).name('球体环数').onChange((value: number) => {
      updateEventCharacterGraphConfig({ sphereRings: value })
    })

    // 默认收拢所有文件夹
    presetFolder.close()
    basicFolder.close()
    animationFolder.close()
    interactionFolder.close()
    lineFolder.close()
    geometryFolder.close()

    return () => {
      gui.destroy()
      isInitializedRef.current = false
    }
  }, [visible]) // 只依赖 visible，避免配置变化时重新创建GUI

  // 当不可见时重置初始化标志
  useEffect(() => {
    if (!visible) {
      isInitializedRef.current = false
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        ...position,
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
    />
  )
}

export default EventCharacterGraphGUI
