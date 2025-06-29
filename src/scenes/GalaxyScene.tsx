import React, { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Galaxy, StarField, CentralSun } from '@components/three/Galaxy'
import { CharacterSpheresSimple } from '@components/three/Galaxy/components/CharacterSpheresSimple'
import { CharacterControlPanel } from '@components/controls/CharacterControlPanel'

import { useGalaxyStore } from '@stores/useGalaxyStore'
import { usePerformanceMonitor, PERFORMANCE_CONFIGS } from '@/hooks/usePerformanceMonitor'





/**
 * 自由探索相机控制组件
 * 模仿角色局部视图的自由交互效果
 */
const FreeExplorationCameraController: React.FC = () => {
  return (
    <OrbitControls
      // 自由探索模式：无自动旋转，完全由用户控制
      autoRotate={false}

      // 启用所有交互功能
      enablePan={true}
      enableZoom={true}
      enableRotate={true}

      // 阻尼效果，让交互更平滑
      enableDamping={true}
      dampingFactor={0.05}

      // 调整交互灵敏度，适合自由探索
      zoomSpeed={1.0}      // 提高缩放速度
      panSpeed={1.0}       // 提高平移速度
      rotateSpeed={0.5}    // 适中的旋转速度

      // 扩大距离范围，支持远近观察
      minDistance={0.5}    // 允许非常近距离观察角色
      maxDistance={500}    // 适中的最大距离，不要太远

      // 移除极角限制，允许全方位观察
      minPolarAngle={0}
      maxPolarAngle={Math.PI}

      // 目标点设置为场景中心
      target={[0, 0, 0]}
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
  // const [rendererInfo, setRendererInfo] = useState<string>('WebGL') // 暂时注释

  // 角色数据显示控制
  const [characterDataVisible, setCharacterDataVisible] = useState(true)
  const [characterDataOpacity, setCharacterDataOpacity] = useState(0.8)

  // 角色渲染控制参数
  const [characterGlobalSize, setCharacterGlobalSize] = useState(0.6)
  const [characterEmissiveIntensity, setCharacterEmissiveIntensity] = useState(0.7)
  const [characterMetalness, setCharacterMetalness] = useState(0.1)
  const [characterRoughness, setCharacterRoughness] = useState(0.3)
  const [characterAnimationSpeed, setCharacterAnimationSpeed] = useState(1.0)
  const [characterFloatAmplitude, setCharacterFloatAmplitude] = useState(0.1)
  const [characterRadiusMultiplier, setCharacterRadiusMultiplier] = useState(1.5)
  const [characterHeightMultiplier, setCharacterHeightMultiplier] = useState(1.2)
  const [characterRandomSpread, setCharacterRandomSpread] = useState(5.0)
  const [characterColorIntensity, setCharacterColorIntensity] = useState(1.0)
  const [characterUseOriginalColors, setCharacterUseOriginalColors] = useState(true)
  const [characterRegeneratePositions, setCharacterRegeneratePositions] = useState(false)

  // 别名控制参数
  const [showAliases, setShowAliases] = useState(true)
  const [aliasOpacity, setAliasOpacity] = useState(0.7)
  const [aliasSize, setAliasSize] = useState(0.8)

  const { performanceLevel: detectedLevel } = usePerformanceMonitor()
  const config = PERFORMANCE_CONFIGS[performanceLevel]

  // 重置角色控制参数为默认值
  const resetCharacterControlsToDefaults = () => {
    setCharacterGlobalSize(0.6)
    setCharacterEmissiveIntensity(0.7)
    setCharacterMetalness(0.1)
    setCharacterRoughness(0.3)
    setCharacterAnimationSpeed(1.0)
    setCharacterFloatAmplitude(0.1)
    setCharacterRadiusMultiplier(1.5)
    setCharacterHeightMultiplier(1.2)
    setCharacterRandomSpread(5.0)
    setCharacterColorIntensity(1.0)
    setCharacterUseOriginalColors(true)
    setShowAliases(true)
    setAliasOpacity(0.7)
    setAliasSize(0.8)
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

  // 初始化渲染器信息 - 暂时注释
  // useEffect(() => {
  //   setRendererInfo('WebGL')
  //   console.log('🔧 使用WebGL渲染器')
  // }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{
          position: [50, 30, 50], // 设置适合自由探索的初始位置
          fov: 75,                // 适中的视野角度
          near: 0.1,              // 允许非常近距离观察
          far: 1000,              // 适中的远距离
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance' as const
        }}
      >
        {/* 增强环境光，适合自由探索 */}
        <ambientLight intensity={0.3} />

        {/* 添加方向光，增强立体感 */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.5}
          color="#ffffff"
        />

        {/* 背景星空 */}
        <StarField />

        {/* 只显示角色数据点，移除银河系和中心太阳 */}
        <Suspense fallback={null}>
          {/* 直接渲染角色球体组件，不包含银河系结构 */}
          <CharacterSpheresSimple
            visible={characterDataVisible}
            opacity={characterDataOpacity}
            globalSize={characterGlobalSize}
            emissiveIntensity={characterEmissiveIntensity}
            metalness={characterMetalness}
            roughness={characterRoughness}
            animationSpeed={characterAnimationSpeed}
            floatAmplitude={characterFloatAmplitude}
            showAliases={showAliases}
            aliasOpacity={aliasOpacity}
            aliasSize={aliasSize}
            radiusMultiplier={characterRadiusMultiplier}
            heightMultiplier={characterHeightMultiplier}
            randomSpread={characterRandomSpread}
            colorIntensity={characterColorIntensity}
            useOriginalColors={characterUseOriginalColors}
            regeneratePositions={characterRegeneratePositions}
          />
        </Suspense>



        {/* 自由探索相机控制 */}
        <FreeExplorationCameraController />

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
        showAliases={showAliases}
        aliasOpacity={aliasOpacity}
        aliasSize={aliasSize}
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
        onShowAliasesChange={setShowAliases}
        onAliasOpacityChange={setAliasOpacity}
        onAliasSizeChange={setAliasSize}
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
