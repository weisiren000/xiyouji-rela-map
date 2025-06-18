import React, { useEffect, useRef } from 'react'
import { GUI } from 'lil-gui'
import { useGalaxyStore } from '@/stores/useGalaxyStore'

/**
 * 控制面板组件
 * 集成lil-gui调试面板
 */
export const ControlPanel: React.FC = () => {
  const guiRef = useRef<GUI | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const {
    galaxyConfig,
    fogConfig,
    bloomConfig,
    isAnimating,
    rotationSpeed,
    sunRotationSpeed,
    cameraAutoRotate,
    cameraRotateSpeed,
    cameraPositionX,
    cameraPositionY,
    cameraPositionZ,
    cameraRotationX,
    cameraRotationY,
    cameraRotationZ,
    cameraFov,
    cameraNear,
    cameraFar,
    cameraTargetX,
    cameraTargetY,
    cameraTargetZ,
    starFieldVisible,
    starFieldOpacity,
    starFieldSize,
    performanceLevel,
    autoPerformance,
    maxFPS,
    updateGalaxyConfig,
    updateFogConfig,
    updateBloomConfig,
    setAnimating,
    setRotationSpeed,
    setSunRotationSpeed,
    setCameraAutoRotate,
    setCameraRotateSpeed,
    setCameraPositionX,
    setCameraPositionY,
    setCameraPositionZ,
    setCameraRotationX,
    setCameraRotationY,
    setCameraRotationZ,
    setCameraFov,
    setCameraNear,
    setCameraFar,
    setCameraTargetX,
    setCameraTargetY,
    setCameraTargetZ,
    applyCameraPreset,
    saveCameraPreset,
    resetCameraToDefault,
    setStarFieldVisible,
    setStarFieldOpacity,
    setStarFieldSize,
    setPerformanceLevel,
    setAutoPerformance,
    setMaxFPS,
    triggerRegeneration,
  } = useGalaxyStore()

  useEffect(() => {
    if (!containerRef.current) return

    // 创建GUI实例
    const gui = new GUI({ container: containerRef.current })
    guiRef.current = gui

    // 设置整个GUI面板为收缩状态
    gui.close()

    // 性能控制 - 最重要的控制面板
    const performanceFolder = gui.addFolder('性能控制')
    performanceFolder.add({ autoPerformance }, 'autoPerformance')
      .name('自动性能调节')
      .onChange((value: boolean) => setAutoPerformance(value))

    performanceFolder.add({ performanceLevel }, 'performanceLevel', ['low', 'medium', 'high', 'ultra'])
      .name('性能等级')
      .onChange((value: string) => setPerformanceLevel(value as any))

    performanceFolder.add({ maxFPS }, 'maxFPS', 30, 120, 1)
      .name('目标FPS')
      .onChange((value: number) => setMaxFPS(value))

    // 银河系结构参数
    const galaxyFolder = gui.addFolder('银河系结构')
    galaxyFolder.add(galaxyConfig, 'planetCount', 1000, 20000, 100)
      .name('星球数量')
      .onChange((value: number) => {
        updateGalaxyConfig({ planetCount: value })
        triggerRegeneration()
      })

    galaxyFolder.add(galaxyConfig, 'galaxyRadius', 20, 100, 1)
      .name('银河系半径')
      .onChange((value: number) => {
        updateGalaxyConfig({ galaxyRadius: value })
        triggerRegeneration()
      })

    galaxyFolder.add(galaxyConfig, 'numArms', 2, 8, 1)
      .name('旋臂数量')
      .onChange((value: number) => {
        updateGalaxyConfig({ numArms: value })
        triggerRegeneration()
      })

    galaxyFolder.add(galaxyConfig, 'armTightness', 1, 20, 0.1)
      .name('旋臂紧密度')
      .onChange((value: number) => {
        updateGalaxyConfig({ armTightness: value })
        triggerRegeneration()
      })

    galaxyFolder.add(galaxyConfig, 'armWidth', 0.1, 5, 0.1)
      .name('旋臂宽度')
      .onChange((value: number) => {
        updateGalaxyConfig({ armWidth: value })
        triggerRegeneration()
      })

    galaxyFolder.add(galaxyConfig, 'maxEmissiveIntensity', 0, 1, 0.05)
      .name('星球发光强度')
      .onChange((value: number) => {
        updateGalaxyConfig({ maxEmissiveIntensity: value })
        // 注意：发光强度调整不需要重新生成银河系，只需要更新配置
        // PlanetCluster.tsx 会自动使用新的配置重新计算发光效果
      })

    // 波浪效果参数
    const waveFolder = gui.addFolder('波浪效果')
    waveFolder.add(galaxyConfig, 'waveAmplitude', 0, 5, 0.1)
      .name('波浪振幅')
      .onChange((value: number) => {
        updateGalaxyConfig({ waveAmplitude: value })
        triggerRegeneration()
      })

    waveFolder.add(galaxyConfig, 'waveFrequency', 0.1, 2, 0.1)
      .name('波浪频率')
      .onChange((value: number) => {
        updateGalaxyConfig({ waveFrequency: value })
        triggerRegeneration()
      })



    // 动画控制
    const animationFolder = gui.addFolder('动画控制')
    animationFolder.add({ isAnimating }, 'isAnimating')
      .name('启用动画')
      .onChange((value: boolean) => setAnimating(value))

    animationFolder.add({ rotationSpeed }, 'rotationSpeed', 0, 5, 0.1)
      .name('银河系旋转速度')
      .onChange((value: number) => setRotationSpeed(value))

    animationFolder.add({ sunRotationSpeed }, 'sunRotationSpeed', 0, 5, 0.1)
      .name('太阳旋转速度')
      .onChange((value: number) => setSunRotationSpeed(value))

    // 相机控制
    const cameraFolder = gui.addFolder('相机控制')

    // 自动旋转控制
    const autoRotateFolder = cameraFolder.addFolder('自动旋转')
    autoRotateFolder.add({ cameraAutoRotate }, 'cameraAutoRotate')
      .name('启用自动旋转')
      .onChange((value: boolean) => setCameraAutoRotate(value))

    autoRotateFolder.add({ cameraRotateSpeed }, 'cameraRotateSpeed', 0, 2, 0.1)
      .name('旋转速度')
      .onChange((value: number) => setCameraRotateSpeed(value))

    // 相机位置控制
    const positionFolder = cameraFolder.addFolder('位置控制')
    positionFolder.add({ cameraPositionX }, 'cameraPositionX', -200, 200, 1)
      .name('X轴位置')
      .onChange((value: number) => setCameraPositionX(value))

    positionFolder.add({ cameraPositionY }, 'cameraPositionY', -200, 200, 1)
      .name('Y轴位置')
      .onChange((value: number) => setCameraPositionY(value))

    positionFolder.add({ cameraPositionZ }, 'cameraPositionZ', -200, 200, 1)
      .name('Z轴位置')
      .onChange((value: number) => setCameraPositionZ(value))

    // 相机旋转控制
    const rotationFolder = cameraFolder.addFolder('旋转控制')
    rotationFolder.add({ cameraRotationX }, 'cameraRotationX', -Math.PI, Math.PI, 0.01)
      .name('X轴旋转 (弧度)')
      .onChange((value: number) => setCameraRotationX(value))

    rotationFolder.add({ cameraRotationY }, 'cameraRotationY', -Math.PI, Math.PI, 0.01)
      .name('Y轴旋转 (弧度)')
      .onChange((value: number) => setCameraRotationY(value))

    rotationFolder.add({ cameraRotationZ }, 'cameraRotationZ', -Math.PI, Math.PI, 0.01)
      .name('Z轴旋转 (弧度)')
      .onChange((value: number) => setCameraRotationZ(value))

    // 相机视野控制
    const fovFolder = cameraFolder.addFolder('视野控制')
    fovFolder.add({ cameraFov }, 'cameraFov', 10, 120, 1)
      .name('视野角度 (FOV)')
      .onChange((value: number) => setCameraFov(value))

    fovFolder.add({ cameraNear }, 'cameraNear', 0.01, 10, 0.01)
      .name('近裁剪面')
      .onChange((value: number) => setCameraNear(value))

    fovFolder.add({ cameraFar }, 'cameraFar', 100, 5000, 10)
      .name('远裁剪面')
      .onChange((value: number) => setCameraFar(value))

    // 相机目标点控制
    const targetFolder = cameraFolder.addFolder('目标点控制')
    targetFolder.add({ cameraTargetX }, 'cameraTargetX', -100, 100, 1)
      .name('目标X轴')
      .onChange((value: number) => setCameraTargetX(value))

    targetFolder.add({ cameraTargetY }, 'cameraTargetY', -100, 100, 1)
      .name('目标Y轴')
      .onChange((value: number) => setCameraTargetY(value))

    targetFolder.add({ cameraTargetZ }, 'cameraTargetZ', -100, 100, 1)
      .name('目标Z轴')
      .onChange((value: number) => setCameraTargetZ(value))

    // 相机预设控制
    const presetFolder = cameraFolder.addFolder('预设控制')
    const presetActions = {
      '默认视角': () => applyCameraPreset('default'),
      '俯视视角': () => applyCameraPreset('top-view'),
      '侧视视角': () => applyCameraPreset('side-view'),
      '近距离视角': () => applyCameraPreset('close-up'),
      '广角视角': () => applyCameraPreset('wide-angle'),
      '保存当前视角': () => {
        const name = prompt('请输入预设名称:')
        if (name) saveCameraPreset(name)
      },
      '重置为默认': () => resetCameraToDefault()
    }

    Object.entries(presetActions).forEach(([name, action]) => {
      presetFolder.add(presetActions, name as keyof typeof presetActions)
    })

    // 默认收拢相机子文件夹
    autoRotateFolder.close()
    positionFolder.close()
    rotationFolder.close()
    fovFolder.close()
    targetFolder.close()
    presetFolder.close()

    // 背景星空控制
    const starFieldFolder = gui.addFolder('背景星空')
    starFieldFolder.add({ starFieldVisible }, 'starFieldVisible')
      .name('显示星空')
      .onChange((value: boolean) => setStarFieldVisible(value))

    starFieldFolder.add({ starFieldOpacity }, 'starFieldOpacity', 0, 1, 0.01)
      .name('星空不透明度')
      .onChange((value: number) => setStarFieldOpacity(value))

    starFieldFolder.add({ starFieldSize }, 'starFieldSize', 0.1, 3, 0.1)
      .name('星星大小')
      .onChange((value: number) => setStarFieldSize(value))

    // 辉光效果 (Bloom) - 1:1复刻原始HTML
    const bloomFolder = gui.addFolder('辉光效果')
    bloomFolder.add(bloomConfig, 'threshold', 0, 1, 0.01)
      .name('辉光-阈值')
      .onChange((value: number) => updateBloomConfig({ threshold: value }))

    bloomFolder.add(bloomConfig, 'strength', 0, 3, 0.01)
      .name('辉光-强度')
      .onChange((value: number) => updateBloomConfig({ strength: value }))

    bloomFolder.add(bloomConfig, 'radius', 0, 1, 0.01)
      .name('辉光-半径')
      .onChange((value: number) => updateBloomConfig({ radius: value }))

    // 雾气效果 (Fog) - 1:1复刻原始HTML
    const fogFolder = gui.addFolder('雾气效果')
    fogFolder.add(fogConfig, 'opacity', 0, 1, 0.01)
      .name('雾气-不透明度')
      .onChange((value: number) => updateFogConfig({ opacity: value }))

    fogFolder.add(fogConfig, 'size', 1, 20, 1)
      .name('雾气-尺寸')
      .onChange((value: number) => updateFogConfig({ size: value }))

    // 重新生成按钮
    const regenerateFolder = gui.addFolder('重新生成')
    regenerateFolder.add({ regenerate: () => triggerRegeneration() }, 'regenerate')
      .name('重新生成银河系')

    // 默认收拢所有文件夹 - 用户可以根据需要手动展开
    // 明确关闭所有文件夹以确保收拢状态
    performanceFolder.close()
    galaxyFolder.close()
    waveFolder.close()
    animationFolder.close()
    cameraFolder.close()
    starFieldFolder.close()
    bloomFolder.close()
    fogFolder.close()
    regenerateFolder.close()

    return () => {
      gui.destroy()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
      }}
    />
  )
}

/**
 * 信息显示组件
 */
export const InfoDisplay: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        textShadow: '0 0 5px #fff',
        pointerEvents: 'none',
        zIndex: 1000,
        textAlign: 'center'
      }}
    >
      
    </div>
  )
}
