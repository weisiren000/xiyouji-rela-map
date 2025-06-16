import React, { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Galaxy, StarField, CentralSun } from '@components/three/Galaxy'
import { CharacterDataPanel } from '@components/ui/CharacterDataPanel'
import { CharacterControlPanel } from '@components/ui/CharacterControlPanel'

import { useGalaxyStore } from '@stores/useGalaxyStore'
import { usePerformanceMonitor, getDevicePerformanceLevel, PERFORMANCE_CONFIGS } from '@/hooks/usePerformanceMonitor'
import { initializeWebGPUSystem, getRecommendedSettings } from '@/utils/webgpu'
import '@/types/webgpu' // 导入WebGPU类型定义

// 导入WebGPU渲染器 - 使用examples/jsm路径（Three.js 0.160.1）
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js'
import WebGPU from 'three/examples/jsm/capabilities/WebGPU.js'

// 扩展React Three Fiber以支持WebGPU
extend({ WebGPURenderer })

/**
 * 详细的WebGPU支持检测
 */
const checkWebGPUSupport = async () => {
  console.log('🔍 开始WebGPU支持检测...')

  // 检查navigator.gpu
  if (!navigator.gpu) {
    console.error('❌ navigator.gpu不存在 - 浏览器不支持WebGPU')
    return false
  }

  console.log('✅ navigator.gpu存在')

  try {
    // 尝试获取适配器
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      console.error('❌ WebGPU适配器获取失败')
      return false
    }

    console.log('✅ WebGPU适配器获取成功:', adapter)

    // 尝试获取设备
    const device = await adapter.requestDevice()
    if (!device) {
      console.error('❌ WebGPU设备获取失败')
      return false
    }

    console.log('✅ WebGPU设备获取成功:', device)
    return true
  } catch (error) {
    console.error('❌ WebGPU支持检测失败:', error)
    return false
  }
}



/**
 * 相机控制组件
 */
const CameraController: React.FC = () => {
  const controlsRef = useRef<any>(null)
  const {
    cameraAutoRotate,
    cameraRotateSpeed,
    cameraTargetX,
    cameraTargetY,
    cameraTargetZ
  } = useGalaxyStore()

  useFrame(() => {
    if (controlsRef.current) {
      // 自动旋转控制
      if (cameraAutoRotate) {
        controlsRef.current.autoRotate = true
        controlsRef.current.autoRotateSpeed = cameraRotateSpeed
      } else {
        controlsRef.current.autoRotate = false
      }

      // 更新目标点
      controlsRef.current.target.set(cameraTargetX, cameraTargetY, cameraTargetZ)
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      target={[cameraTargetX, cameraTargetY, cameraTargetZ]}
      enableDamping
      dampingFactor={0.05}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={0.6}
      panSpeed={0.8}
      rotateSpeed={0.4}
      minDistance={10}
      maxDistance={500}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      autoRotate={cameraAutoRotate}
      autoRotateSpeed={cameraRotateSpeed}
    />
  )
}

/**
 * 动态相机组件
 * 处理相机位置、旋转和视野的实时更新
 */
const DynamicCamera: React.FC = () => {
  const { camera } = useThree()
  const {
    cameraPositionX,
    cameraPositionY,
    cameraPositionZ,
    cameraRotationX,
    cameraRotationY,
    cameraRotationZ,
    cameraFov,
    cameraNear,
    cameraFar
  } = useGalaxyStore()

  useFrame(() => {
    // 更新相机位置
    camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ)

    // 更新相机旋转
    camera.rotation.set(cameraRotationX, cameraRotationY, cameraRotationZ)

    // 更新相机视野参数
    if ('fov' in camera) {
      (camera as any).fov = cameraFov
      camera.near = cameraNear
      camera.far = cameraFar
      camera.updateProjectionMatrix()
    }
  })

  return null
}

/**
 * 银河系主场景
 * 1:1复刻原始HTML文件效果 + 性能优化
 */
export const GalaxyScene: React.FC = () => {
  const {
    bloomConfig,
    performanceLevel,
    autoPerformance,
    setPerformanceLevel,
    cameraPositionX,
    cameraPositionY,
    cameraPositionZ,
    cameraFov,
    cameraNear,
    cameraFar
  } = useGalaxyStore()

  // 渲染器状态管理
  const [rendererInfo, setRendererInfo] = useState<string>('WebGL')

  // 角色数据显示控制
  const [characterDataVisible, setCharacterDataVisible] = useState(true)
  const [characterDataOpacity, setCharacterDataOpacity] = useState(0.8)

  // 角色渲染控制参数
  const [characterGlobalSize, setCharacterGlobalSize] = useState(1.0)
  const [characterEmissiveIntensity, setCharacterEmissiveIntensity] = useState(0.3)
  const [characterMetalness, setCharacterMetalness] = useState(0.1)
  const [characterRoughness, setCharacterRoughness] = useState(0.3)
  const [characterAnimationSpeed, setCharacterAnimationSpeed] = useState(1.0)
  const [characterFloatAmplitude, setCharacterFloatAmplitude] = useState(0.1)
  const [characterRadiusMultiplier, setCharacterRadiusMultiplier] = useState(1.0)
  const [characterHeightMultiplier, setCharacterHeightMultiplier] = useState(1.0)
  const [characterRandomSpread, setCharacterRandomSpread] = useState(2.0)
  const [characterColorIntensity, setCharacterColorIntensity] = useState(1.0)
  const [characterUseOriginalColors, setCharacterUseOriginalColors] = useState(true)
  const [characterRegeneratePositions, setCharacterRegeneratePositions] = useState(false)

  const { performanceLevel: detectedLevel } = usePerformanceMonitor()
  const config = PERFORMANCE_CONFIGS[performanceLevel]

  // 重置角色控制参数为默认值
  const resetCharacterControlsToDefaults = () => {
    setCharacterGlobalSize(1.0)
    setCharacterEmissiveIntensity(0.3)
    setCharacterMetalness(0.1)
    setCharacterRoughness(0.3)
    setCharacterAnimationSpeed(1.0)
    setCharacterFloatAmplitude(0.1)
    setCharacterRadiusMultiplier(1.0)
    setCharacterHeightMultiplier(1.0)
    setCharacterRandomSpread(2.0)
    setCharacterColorIntensity(1.0)
    setCharacterUseOriginalColors(true)
  }

  // 重新生成角色位置
  const regenerateCharacterPositions = () => {
    setCharacterRegeneratePositions(prev => !prev) // 切换状态触发重新生成
  }

  // 自动性能调节
  useEffect(() => {
    if (autoPerformance && detectedLevel !== performanceLevel) {
      setPerformanceLevel(detectedLevel)
    }
  }, [autoPerformance, detectedLevel, performanceLevel, setPerformanceLevel])

  // 初始化WebGPU系统和性能检测
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // 初始化WebGPU系统
        const result = await initializeWebGPUSystem({
          enableAutoDetection: true,
          fallbackToWebGL: true,
          preferWebGPU: true,
          minPerformanceScore: 60,
          enableComputeShaders: true,
          enableAdvancedFeatures: true,
          logPerformanceStats: true
        })

        console.log('🚀 WebGPU系统初始化结果:', result)

        // 获取推荐设置
        const recommendedSettings = getRecommendedSettings()
        console.log('⚙️ 推荐设置:', recommendedSettings)

        // 根据推荐设置调整性能等级
        if (autoPerformance) {
          let newLevel: 'low' | 'medium' | 'high' | 'ultra' = 'medium'

          if (recommendedSettings.quality === 'ultra') {
            newLevel = 'ultra'
          } else if (recommendedSettings.quality === 'high') {
            newLevel = 'high'
          } else if (recommendedSettings.quality === 'medium') {
            newLevel = 'medium'
          } else {
            newLevel = 'low'
          }

          setPerformanceLevel(newLevel)
          console.log(`🎯 自动设置性能等级: ${newLevel} (基于${result.rendererType.toUpperCase()})`)
        }

      } catch (error) {
        console.error('❌ WebGPU系统初始化失败:', error)

        // 降级到基础性能检测
        const deviceLevel = getDevicePerformanceLevel()
        if (autoPerformance) {
          setPerformanceLevel(deviceLevel)
        }
        console.log('🔧 降级到基础渲染模式，性能等级:', deviceLevel)
      }
    }

    initializeSystem()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{
          position: [cameraPositionX, cameraPositionY, cameraPositionZ],
          fov: cameraFov,
          near: cameraNear,
          far: cameraFar,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance' as const
        }}
      >
        {/* 环境光 */}
        <ambientLight intensity={0.1} />

        {/* 背景星空 */}
        <StarField />

        {/* 中心太阳 */}
        <CentralSun />

        {/* 银河系 */}
        <Suspense fallback={null}>
          <Galaxy
            characterDataVisible={characterDataVisible}
            characterDataOpacity={characterDataOpacity}
            characterGlobalSize={characterGlobalSize}
            characterEmissiveIntensity={characterEmissiveIntensity}
            characterMetalness={characterMetalness}
            characterRoughness={characterRoughness}
            characterAnimationSpeed={characterAnimationSpeed}
            characterFloatAmplitude={characterFloatAmplitude}
            characterRadiusMultiplier={characterRadiusMultiplier}
            characterHeightMultiplier={characterHeightMultiplier}
            characterRandomSpread={characterRandomSpread}
            characterColorIntensity={characterColorIntensity}
            characterUseOriginalColors={characterUseOriginalColors}
            characterRegeneratePositions={characterRegeneratePositions}
          />
        </Suspense>

        {/* 动态相机控制 */}
        <DynamicCamera />

        {/* 相机控制 */}
        <CameraController />

        {/* 后期处理效果 - 根据性能等级条件渲染 */}
        {config.bloomEnabled && (
          <EffectComposer>
            <Bloom
              intensity={bloomConfig.strength}
              luminanceThreshold={bloomConfig.threshold}
              luminanceSmoothing={bloomConfig.radius}
            />
          </EffectComposer>
        )}
      </Canvas>

      {/* WebGPU详细状态显示 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '11px',
        zIndex: 1000,
        maxWidth: '300px',
        lineHeight: '1.4'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          🖥️ 渲染器状态
        </div>
        <div>类型: {rendererInfo}</div>
        <div>浏览器WebGPU: {typeof navigator !== 'undefined' && navigator.gpu ? '✅ 支持' : '❌ 不支持'}</div>
        <div style={{
          marginTop: '8px',
          fontSize: '10px',
          color: '#888',
          borderTop: '1px solid #333',
          paddingTop: '6px'
        }}>
          💡 如果显示WebGL，请检查浏览器WebGPU支持
        </div>
      </div>

      {/* 角色数据控制面板 */}
      <CharacterDataPanel
        visible={characterDataVisible}
        opacity={characterDataOpacity}
        onVisibilityChange={setCharacterDataVisible}
        onOpacityChange={setCharacterDataOpacity}
      />

      {/* 角色渲染控制面板 */}
      <CharacterControlPanel
        visible={characterDataVisible}
        opacity={characterDataOpacity}
        globalSize={characterGlobalSize}
        emissiveIntensity={characterEmissiveIntensity}
        metalness={characterMetalness}
        roughness={characterRoughness}
        animationSpeed={characterAnimationSpeed}
        floatAmplitude={characterFloatAmplitude}
        radiusMultiplier={characterRadiusMultiplier}
        heightMultiplier={characterHeightMultiplier}
        randomSpread={characterRandomSpread}
        colorIntensity={characterColorIntensity}
        useOriginalColors={characterUseOriginalColors}
        onVisibilityChange={setCharacterDataVisible}
        onOpacityChange={setCharacterDataOpacity}
        onGlobalSizeChange={setCharacterGlobalSize}
        onEmissiveIntensityChange={setCharacterEmissiveIntensity}
        onMetalnessChange={setCharacterMetalness}
        onRoughnessChange={setCharacterRoughness}
        onAnimationSpeedChange={setCharacterAnimationSpeed}
        onFloatAmplitudeChange={setCharacterFloatAmplitude}
        onRadiusMultiplierChange={setCharacterRadiusMultiplier}
        onHeightMultiplierChange={setCharacterHeightMultiplier}
        onRandomSpreadChange={setCharacterRandomSpread}
        onColorIntensityChange={setCharacterColorIntensity}
        onUseOriginalColorsChange={setCharacterUseOriginalColors}
        onResetToDefaults={resetCharacterControlsToDefaults}
        onRegeneratePositions={regenerateCharacterPositions}
      />
    </div>
  )
}
