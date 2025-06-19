import React, { useEffect, useRef } from 'react'
import { GUI } from 'lil-gui'
import { ModelEffectConfig } from '../three/ModelEffectRenderer'

interface ModelEffectGUIProps {
  config: ModelEffectConfig
  onConfigChange: (config: ModelEffectConfig) => void
  visible?: boolean
}

/**
 * 模型特效GUI调试面板
 * 功能：
 * - 实时调试所有特效参数
 * - 分组管理不同类型的参数
 * - 支持显示/隐藏
 * - 保存/加载预设
 */
export const ModelEffectGUI: React.FC<ModelEffectGUIProps> = ({
  config,
  onConfigChange,
  visible = true
}) => {
  const guiRef = useRef<GUI | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !visible) return

    // 创建GUI实例
    const gui = new GUI({
      container: containerRef.current,
      title: '模型特效调试',
      width: 300
    })
    
    guiRef.current = gui

    // 创建配置对象的副本用于GUI绑定
    const guiConfig = { ...config }

    // 全局设置文件夹
    const globalFolder = gui.addFolder('全局设置')
    globalFolder.add(guiConfig, 'showWireframe').name('显示线框').onChange((value: boolean) => {
      onConfigChange({ ...guiConfig, showWireframe: value })
    })
    globalFolder.add(guiConfig, 'showPoints').name('显示点').onChange((value: boolean) => {
      onConfigChange({ ...guiConfig, showPoints: value })
    })
    globalFolder.add(guiConfig, 'activePaletteIndex', 0, 3, 1).name('调色板').onChange((value: number) => {
      onConfigChange({ ...guiConfig, activePaletteIndex: value })
    })

    // 点特效文件夹
    const pointsFolder = gui.addFolder('点特效')
    pointsFolder.add(guiConfig, 'pointSize', 0.1, 50.0, 0.1).name('点大小').onChange((value: number) => {
      onConfigChange({ ...guiConfig, pointSize: value })
    })
    pointsFolder.add(guiConfig, 'pointBrightness', 0.0, 2.0, 0.1).name('点亮度').onChange((value: number) => {
      onConfigChange({ ...guiConfig, pointBrightness: value })
    })
    pointsFolder.add(guiConfig, 'pointOpacity', 0.0, 1.0, 0.1).name('点透明度').onChange((value: number) => {
      onConfigChange({ ...guiConfig, pointOpacity: value })
    })

    // 线框特效文件夹
    const wireframeFolder = gui.addFolder('线框特效')
    wireframeFolder.add(guiConfig, 'wireframeBrightness', 0.0, 2.0, 0.1).name('线框亮度').onChange((value: number) => {
      onConfigChange({ ...guiConfig, wireframeBrightness: value })
    })
    wireframeFolder.add(guiConfig, 'wireframeOpacity', 0.0, 1.0, 0.1).name('线框透明度').onChange((value: number) => {
      onConfigChange({ ...guiConfig, wireframeOpacity: value })
    })

    // 动画参数文件夹
    const animationFolder = gui.addFolder('动画参数')
    animationFolder.add(guiConfig, 'pulseIntensity', 0.0, 2.0, 0.1).name('脉冲强度').onChange((value: number) => {
      onConfigChange({ ...guiConfig, pulseIntensity: value })
    })
    animationFolder.add(guiConfig, 'pulseSpeed', 0.5, 10.0, 0.5).name('脉冲速度').onChange((value: number) => {
      onConfigChange({ ...guiConfig, pulseSpeed: value })
    })
    animationFolder.add(guiConfig, 'rotationSpeed', 0.0, 0.01, 0.0001).name('旋转速度').onChange((value: number) => {
      onConfigChange({ ...guiConfig, rotationSpeed: value })
    })

    // 模型变换文件夹
    const transformFolder = gui.addFolder('模型变换')
    transformFolder.add(guiConfig, 'modelScale', 0.1, 50.0, 0.1).name('缩放').onChange((value: number) => {
      onConfigChange({ ...guiConfig, modelScale: value })
    })
    transformFolder.add(guiConfig, 'modelRotationX', -Math.PI, Math.PI, 0.1).name('X轴旋转').onChange((value: number) => {
      onConfigChange({ ...guiConfig, modelRotationX: value })
    })
    transformFolder.add(guiConfig, 'modelRotationY', -Math.PI, Math.PI, 0.1).name('Y轴旋转').onChange((value: number) => {
      onConfigChange({ ...guiConfig, modelRotationY: value })
    })
    transformFolder.add(guiConfig, 'modelRotationZ', -Math.PI, Math.PI, 0.1).name('Z轴旋转').onChange((value: number) => {
      onConfigChange({ ...guiConfig, modelRotationZ: value })
    })

    // 预设管理
    const presetActions = {
      '保存预设': () => {
        const presetName = prompt('请输入预设名称:')
        if (presetName) {
          localStorage.setItem(`model-effect-preset-${presetName}`, JSON.stringify(guiConfig))
          console.log(`✅ 预设 "${presetName}" 已保存`)
        }
      },
      '加载预设': () => {
        const presetName = prompt('请输入要加载的预设名称:')
        if (presetName) {
          const saved = localStorage.getItem(`model-effect-preset-${presetName}`)
          if (saved) {
            const loadedConfig = JSON.parse(saved)
            onConfigChange(loadedConfig)
            console.log(`✅ 预设 "${presetName}" 已加载`)
          } else {
            alert(`预设 "${presetName}" 不存在`)
          }
        }
      },
      '重置默认': () => {
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
        onConfigChange(defaultConfig)
        console.log('✅ 已重置为默认配置')
      }
    }

    const presetFolder = gui.addFolder('预设管理')
    presetFolder.add(presetActions, '保存预设')
    presetFolder.add(presetActions, '加载预设')
    presetFolder.add(presetActions, '重置默认')

    // 默认收起整个GUI面板，只显示标题栏
    gui.close()

    // 也收起所有内部文件夹（当用户展开面板时保持收起状态）
    globalFolder.close()
    pointsFolder.close()
    wireframeFolder.close()
    animationFolder.close()
    transformFolder.close()
    presetFolder.close()

    // 清理函数
    return () => {
      if (guiRef.current) {
        guiRef.current.destroy()
        guiRef.current = null
      }
    }
  }, [visible])

  // 当配置改变时更新GUI显示
  useEffect(() => {
    if (guiRef.current) {
      // 更新GUI控制器的值
      guiRef.current.controllersRecursive().forEach(controller => {
        const property = controller.property as keyof ModelEffectConfig
        if (property in config) {
          controller.setValue(config[property])
        }
      })
    }
  }, [config])

  if (!visible) {
    return null
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: '20px',
        right: '1080px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '8px',
        padding: '10px'
      }}
    />
  )
}

export default ModelEffectGUI
