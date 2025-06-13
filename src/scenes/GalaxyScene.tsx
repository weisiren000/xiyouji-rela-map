import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Galaxy, StarField, CentralSun } from '@components/three/Galaxy'
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { usePerformanceMonitor, getDevicePerformanceLevel, PERFORMANCE_CONFIGS } from '@/hooks/usePerformanceMonitor'

/**
 * 相机控制组件
 */
const CameraController: React.FC = () => {
  const controlsRef = useRef<any>(null)
  const { cameraAutoRotate, cameraRotateSpeed } = useGalaxyStore()

  useFrame(() => {
    if (controlsRef.current && cameraAutoRotate) {
      controlsRef.current.autoRotate = true
      controlsRef.current.autoRotateSpeed = cameraRotateSpeed
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={10}
      maxDistance={200}
      autoRotate={cameraAutoRotate}
      autoRotateSpeed={cameraRotateSpeed}
    />
  )
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
    setPerformanceLevel
  } = useGalaxyStore()

  const { performanceLevel: detectedLevel } = usePerformanceMonitor()
  const config = PERFORMANCE_CONFIGS[performanceLevel]

  // 自动性能调节
  useEffect(() => {
    if (autoPerformance && detectedLevel !== performanceLevel) {
      setPerformanceLevel(detectedLevel)
    }
  }, [autoPerformance, detectedLevel, performanceLevel, setPerformanceLevel])

  // 初始化设备性能检测
  useEffect(() => {
    const deviceLevel = getDevicePerformanceLevel()
    if (autoPerformance) {
      setPerformanceLevel(deviceLevel)
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{
          position: [0, 45, 65],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: false,
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
          <Galaxy />
        </Suspense>

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
    </div>
  )
}
