import React, { useEffect, useRef } from 'react'
import { GUI } from 'lil-gui'
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { JourneyConfig } from '@utils/three/journeyGenerator'

interface SpiralControlsProps {
  visible?: boolean
}

/**
 * 螺旋线控制GUI面板
 * 功能：
 * - 实时调试螺旋线形态参数
 * - 分组管理不同类型的参数
 * - 支持显示/隐藏
 * - 保存/加载预设
 */
export const SpiralControls: React.FC<SpiralControlsProps> = ({
  visible = true
}) => {
  const guiRef = useRef<GUI | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { journeyConfig, updateJourneyConfig } = useGalaxyStore()

  useEffect(() => {
    if (!containerRef.current || !visible) return

    // 创建GUI实例
    const gui = new GUI({
      container: containerRef.current,
      title: 'Spiral Controls',
      width: 245
    })
    
    guiRef.current = gui

    // 创建配置对象的副本用于GUI绑定
    const guiConfig = { ...journeyConfig }

    // 螺旋形态文件夹
    const spiralFolder = gui.addFolder('螺旋形态')
    spiralFolder.add(guiConfig, 'maxRadius', 10, 100, 1).name('外圈半径').onChange((value: number) => {
      updateJourneyConfig({ maxRadius: value })
    })
    spiralFolder.add(guiConfig, 'minRadius', 1, 20, 0.5).name('内圈半径').onChange((value: number) => {
      updateJourneyConfig({ minRadius: value })
    })
    spiralFolder.add(guiConfig, 'totalTurns', 1, 8, 0.1).name('螺旋圈数').onChange((value: number) => {
      updateJourneyConfig({ totalTurns: value })
    })

    // 银河系悬臂参数
    spiralFolder.add(guiConfig, 'armTightness', 0.5, 8.0, 0.1).name('悬臂紧密度').onChange((value: number) => {
      updateJourneyConfig({ armTightness: value })
    })
    spiralFolder.add(guiConfig, 'armIndex', 0, 3, 1).name('悬臂选择').onChange((value: number) => {
      updateJourneyConfig({ armIndex: value })
    })

    // Y轴波动文件夹
    const waveFolder = gui.addFolder('Y轴波动')
    waveFolder.add(guiConfig, 'waveHeight', 0, 10, 0.1).name('波动幅度').onChange((value: number) => {
      updateJourneyConfig({ waveHeight: value })
    })
    waveFolder.add(guiConfig, 'waveFrequency', 0.1, 2.0, 0.1).name('波动频率').onChange((value: number) => {
      updateJourneyConfig({ waveFrequency: value })
    })

    // 点外观文件夹
    const pointFolder = gui.addFolder('点外观')
    pointFolder.add(guiConfig, 'pointSize', 0.1, 3.0, 0.1).name('基础大小').onChange((value: number) => {
      updateJourneyConfig({ pointSize: value })
    })
    pointFolder.add(guiConfig, 'globalSize', 0.1, 3.0, 0.1).name('全局缩放').onChange((value: number) => {
      updateJourneyConfig({ globalSize: value })
    })
    pointFolder.add(guiConfig, 'emissiveIntensity', 0.0, 2.0, 0.1).name('发光强度').onChange((value: number) => {
      updateJourneyConfig({ emissiveIntensity: value })
    })

    // 球体材质文件夹
    const materialFolder = gui.addFolder('球体材质')
    materialFolder.add(guiConfig, 'opacity', 0.0, 1.0, 0.1).name('透明度').onChange((value: number) => {
      updateJourneyConfig({ opacity: value })
    })
    materialFolder.add(guiConfig, 'metalness', 0.0, 1.0, 0.1).name('金属度').onChange((value: number) => {
      updateJourneyConfig({ metalness: value })
    })
    materialFolder.add(guiConfig, 'roughness', 0.0, 1.0, 0.1).name('粗糙度').onChange((value: number) => {
      updateJourneyConfig({ roughness: value })
    })

    // 动画效果文件夹
    const animationFolder = gui.addFolder('动画效果')
    animationFolder.add(guiConfig, 'animationSpeed', 0.1, 3.0, 0.1).name('动画速度').onChange((value: number) => {
      updateJourneyConfig({ animationSpeed: value })
    })
    animationFolder.add(guiConfig, 'floatAmplitude', 0.0, 1.0, 0.1).name('浮动幅度').onChange((value: number) => {
      updateJourneyConfig({ floatAmplitude: value })
    })
    animationFolder.add(guiConfig, 'pulseIntensity', 0.0, 0.5, 0.05).name('脉冲强度').onChange((value: number) => {
      updateJourneyConfig({ pulseIntensity: value })
    })
    animationFolder.add(guiConfig, 'sizeVariation', 0.0, 1.0, 0.1).name('大小变化').onChange((value: number) => {
      updateJourneyConfig({ sizeVariation: value })
    })

    // 预设管理
    const presetActions = {
      '保存预设': () => {
        const presetName = prompt('请输入预设名称:')
        if (presetName) {
          localStorage.setItem(`spiral-preset-${presetName}`, JSON.stringify(guiConfig))
          console.log(`✅ 螺旋线预设 "${presetName}" 已保存`)
        }
      },
      '加载预设': () => {
        const presetName = prompt('请输入要加载的预设名称:')
        if (presetName) {
          const saved = localStorage.getItem(`spiral-preset-${presetName}`)
          if (saved) {
            const loadedConfig = JSON.parse(saved)
            updateJourneyConfig(loadedConfig)
            console.log(`✅ 螺旋线预设 "${presetName}" 已加载`)
          } else {
            alert(`预设 "${presetName}" 不存在`)
          }
        }
      },
      '重置默认': () => {
        const defaultConfig: JourneyConfig = {
          pointCount: 81,
          maxRadius: 50,
          minRadius: 5,
          totalTurns: 3.5,
          waveHeight: 3,
          waveFrequency: 0.8,
          pointSize: 0.8,
          emissiveIntensity: 0.6,
          armTightness: 3.0,
          armIndex: 0,
          globalSize: 1.2,
          opacity: 1.0,
          metalness: 0.3,
          roughness: 0.2,
          animationSpeed: 1.0,
          floatAmplitude: 0.3,
          pulseIntensity: 0.1,
          sizeVariation: 0.4,
        }
        updateJourneyConfig(defaultConfig)
        console.log('✅ 螺旋线已重置为默认配置')
      },
      '经典螺旋': () => {
        updateJourneyConfig({
          maxRadius: 60,
          minRadius: 3,
          totalTurns: 4.0,
          waveHeight: 2,
          waveFrequency: 1.0,
          pointSize: 1.0,
          emissiveIntensity: 0.8,
          armTightness: 3.5,
          armIndex: 0,
          globalSize: 1.0,
          animationSpeed: 1.2,
          floatAmplitude: 0.4,
          pulseIntensity: 0.15,
          sizeVariation: 0.6,
        })
        console.log('✅ 已应用经典螺旋预设')
      },
      '紧密螺旋': () => {
        updateJourneyConfig({
          maxRadius: 40,
          minRadius: 8,
          totalTurns: 6.0,
          waveHeight: 1,
          waveFrequency: 1.5,
          pointSize: 0.6,
          emissiveIntensity: 1.0,
          armTightness: 5.0,
          armIndex: 1,
          globalSize: 0.8,
          animationSpeed: 1.5,
          floatAmplitude: 0.2,
          pulseIntensity: 0.2,
          sizeVariation: 0.3,
        })
        console.log('✅ 已应用紧密螺旋预设')
      },
      '平缓螺旋': () => {
        updateJourneyConfig({
          maxRadius: 80,
          minRadius: 2,
          totalTurns: 2.5,
          waveHeight: 5,
          waveFrequency: 0.5,
          pointSize: 1.2,
          emissiveIntensity: 0.4,
          armTightness: 2.0,
          armIndex: 2,
          globalSize: 1.5,
          animationSpeed: 0.8,
          floatAmplitude: 0.6,
          pulseIntensity: 0.05,
          sizeVariation: 0.8,
        })
        console.log('✅ 已应用平缓螺旋预设')
      },
      '动感球体': () => {
        updateJourneyConfig({
          maxRadius: 55,
          minRadius: 4,
          totalTurns: 3.8,
          waveHeight: 3.5,
          waveFrequency: 0.9,
          pointSize: 0.9,
          emissiveIntensity: 1.2,
          armTightness: 4.0,
          armIndex: 3,
          globalSize: 1.3,
          animationSpeed: 2.0,
          floatAmplitude: 0.8,
          pulseIntensity: 0.3,
          sizeVariation: 1.0,
        })
        console.log('✅ 已应用动感球体预设')
      },
      '银河悬臂': () => {
        updateJourneyConfig({
          maxRadius: 70,
          minRadius: 8,
          totalTurns: 2.0,
          waveHeight: 4,
          waveFrequency: 0.6,
          pointSize: 1.0,
          emissiveIntensity: 0.9,
          armTightness: 3.2,
          armIndex: 0,
          globalSize: 1.1,
          animationSpeed: 1.0,
          floatAmplitude: 0.5,
          pulseIntensity: 0.2,
          sizeVariation: 0.7,
        })
        console.log('✅ 已应用银河悬臂预设')
      }
    }

    const presetFolder = gui.addFolder('预设管理')
    presetFolder.add(presetActions, '重置默认')
    presetFolder.add(presetActions, '经典螺旋')
    presetFolder.add(presetActions, '紧密螺旋')
    presetFolder.add(presetActions, '平缓螺旋')
    presetFolder.add(presetActions, '动感球体')
    presetFolder.add(presetActions, '银河悬臂')
    presetFolder.add(presetActions, '保存预设')
    presetFolder.add(presetActions, '加载预设')

    // 默认收起整个GUI面板，只显示标题栏
    gui.close()

    // 也收起所有内部文件夹（当用户展开面板时保持收起状态）
    spiralFolder.close()
    waveFolder.close()
    pointFolder.close()
    materialFolder.close()
    animationFolder.close()
    presetFolder.close()

    // 清理函数
    return () => {
      if (guiRef.current) {
        guiRef.current.destroy()
        guiRef.current = null
      }
    }
  }, [visible, updateJourneyConfig])

  // 当配置改变时更新GUI显示
  useEffect(() => {
    if (guiRef.current) {
      // 更新GUI控制器的值
      guiRef.current.controllersRecursive().forEach(controller => {
        const property = controller.property as keyof JourneyConfig
        if (property in journeyConfig) {
          controller.setValue(journeyConfig[property])
        }
      })
    }
  }, [journeyConfig])

  if (!visible) {
    return null
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: '54px',
        right: '0px',
        // zIndex: 1000,
        // background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '8px',
        padding: '10px',
        // backdropFilter: 'blur(10px)',
        // border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    />
  )
}

export default SpiralControls
