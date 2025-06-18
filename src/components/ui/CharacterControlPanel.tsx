import React, { useEffect, useRef } from 'react'
import { GUI } from 'lil-gui'

/**
 * 角色控制面板组件
 * 专门用于调整角色球的渲染属性
 */

interface CharacterControlPanelProps {
  // 角色渲染属性
  visible: boolean
  opacity: number
  globalSize: number
  emissiveIntensity: number
  metalness: number
  roughness: number
  animationSpeed: number
  floatAmplitude: number

  // 别名控制
  showAliases: boolean
  aliasOpacity: number
  aliasSize: number

  // 分布控制
  radiusMultiplier: number
  heightMultiplier: number
  randomSpread: number

  // 颜色控制
  colorIntensity: number
  useOriginalColors: boolean

  // 回调函数
  onVisibilityChange: (visible: boolean) => void
  onOpacityChange: (opacity: number) => void
  onGlobalSizeChange: (size: number) => void
  onEmissiveIntensityChange: (intensity: number) => void
  onMetalnessChange: (metalness: number) => void
  onRoughnessChange: (roughness: number) => void
  onAnimationSpeedChange: (speed: number) => void
  onFloatAmplitudeChange: (amplitude: number) => void
  onShowAliasesChange: (show: boolean) => void
  onAliasOpacityChange: (opacity: number) => void
  onAliasSizeChange: (size: number) => void
  onRadiusMultiplierChange: (multiplier: number) => void
  onHeightMultiplierChange: (multiplier: number) => void
  onRandomSpreadChange: (spread: number) => void
  onColorIntensityChange: (intensity: number) => void
  onUseOriginalColorsChange: (use: boolean) => void
  onResetToDefaults: () => void
  onRegeneratePositions: () => void
}

export const CharacterControlPanel: React.FC<CharacterControlPanelProps> = ({
  visible,
  opacity,
  globalSize,
  emissiveIntensity,
  metalness,
  roughness,
  animationSpeed,
  floatAmplitude,
  showAliases,
  aliasOpacity,
  aliasSize,
  radiusMultiplier,
  heightMultiplier,
  randomSpread,
  colorIntensity,
  useOriginalColors,
  onVisibilityChange,
  onOpacityChange,
  onGlobalSizeChange,
  onEmissiveIntensityChange,
  onMetalnessChange,
  onRoughnessChange,
  onAnimationSpeedChange,
  onFloatAmplitudeChange,
  onShowAliasesChange,
  onAliasOpacityChange,
  onAliasSizeChange,
  onRadiusMultiplierChange,
  onHeightMultiplierChange,
  onRandomSpreadChange,
  onColorIntensityChange,
  onUseOriginalColorsChange,
  onResetToDefaults,
  onRegeneratePositions
}) => {
  const guiRef = useRef<GUI | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 创建GUI实例
    const gui = new GUI({ 
      container: containerRef.current,
      title: 'Character Controls'
    })
    guiRef.current = gui

    // 设置整个GUI面板为收缩状态
    gui.close()

    // 基础显示控制
    const displayFolder = gui.addFolder('显示控制')
    displayFolder.add({ visible }, 'visible')
      .name('显示角色球')
      .onChange((value: boolean) => onVisibilityChange(value))

    displayFolder.add({ opacity }, 'opacity', 0, 1, 0.01)
      .name('透明度')
      .onChange((value: number) => onOpacityChange(value))

    displayFolder.add({ globalSize }, 'globalSize', 0.1, 3.0, 0.1)
      .name('全局大小')
      .onChange((value: number) => onGlobalSizeChange(value))

    // 别名控制
    const aliasFolder = gui.addFolder('别名控制')
    aliasFolder.add({ showAliases }, 'showAliases')
      .name('显示别名')
      .onChange((value: boolean) => onShowAliasesChange(value))

    aliasFolder.add({ aliasOpacity }, 'aliasOpacity', 0, 1, 0.01)
      .name('别名透明度')
      .onChange((value: number) => onAliasOpacityChange(value))

    aliasFolder.add({ aliasSize }, 'aliasSize', 0.1, 2.0, 0.1)
      .name('别名大小')
      .onChange((value: number) => onAliasSizeChange(value))

    // 材质属性控制
    const materialFolder = gui.addFolder('材质属性')
    materialFolder.add({ emissiveIntensity }, 'emissiveIntensity', 0, 2.0, 0.1)
      .name('发光强度')
      .onChange((value: number) => onEmissiveIntensityChange(value))

    materialFolder.add({ metalness }, 'metalness', 0, 1, 0.01)
      .name('金属度')
      .onChange((value: number) => onMetalnessChange(value))

    materialFolder.add({ roughness }, 'roughness', 0, 1, 0.01)
      .name('粗糙度')
      .onChange((value: number) => onRoughnessChange(value))

    // 动画控制
    const animationFolder = gui.addFolder('动画效果')
    animationFolder.add({ animationSpeed }, 'animationSpeed', 0, 3.0, 0.1)
      .name('动画速度')
      .onChange((value: number) => onAnimationSpeedChange(value))

    animationFolder.add({ floatAmplitude }, 'floatAmplitude', 0, 1.0, 0.01)
      .name('浮动幅度')
      .onChange((value: number) => onFloatAmplitudeChange(value))

    // 分布控制
    const distributionFolder = gui.addFolder('空间分布')
    distributionFolder.add({ radiusMultiplier }, 'radiusMultiplier', 0.1, 3.0, 0.1)
      .name('径向倍数')
      .onChange((value: number) => onRadiusMultiplierChange(value))

    distributionFolder.add({ heightMultiplier }, 'heightMultiplier', 0.1, 4.0, 0.1)
      .name('高度倍数')
      .onChange((value: number) => onHeightMultiplierChange(value))

    distributionFolder.add({ randomSpread }, 'randomSpread', 0, 10.0, 0.1)
      .name('随机散布')
      .onChange((value: number) => onRandomSpreadChange(value))

    // 颜色控制
    const colorFolder = gui.addFolder('颜色控制')
    colorFolder.add({ useOriginalColors }, 'useOriginalColors')
      .name('使用原始颜色')
      .onChange((value: boolean) => onUseOriginalColorsChange(value))

    colorFolder.add({ colorIntensity }, 'colorIntensity', 0.1, 3.0, 0.1)
      .name('颜色强度')
      .onChange((value: number) => onColorIntensityChange(value))

    // 操作控制
    const actionsFolder = gui.addFolder('操作控制')
    actionsFolder.add({ resetToDefaults: onResetToDefaults }, 'resetToDefaults')
      .name('重置为默认值')

    actionsFolder.add({ regeneratePositions: onRegeneratePositions }, 'regeneratePositions')
      .name('重新生成位置')

    // 默认收拢所有文件夹
    displayFolder.close()
    aliasFolder.close()
    materialFolder.close()
    animationFolder.close()
    distributionFolder.close()
    colorFolder.close()
    actionsFolder.close()

    return () => {
      gui.destroy()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 37, // 放在主Controls面板下方
        right: 10, // 改为右侧，与主Controls面板对齐
        zIndex: 999, // 比角色数据面板稍低
      }}
    />
  )
}
