import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { InstancedMesh, Object3D, Color } from 'three'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { StarField } from '../../Galaxy'

/**
 * 单个事件球体组件
 * 在详情视图中显示选中的事件点
 */
const SingleEventSphere: React.FC = () => {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])
  const { selectedEvent } = useGalaxyStore()

  // 根据难次生成颜色
  const getEventColor = (nanci: number) => {
    const progress = (nanci - 1) / 80 // 0-1之间
    if (progress < 0.33) {
      // 蓝色到紫色
      const r = Math.round(100 + progress * 3 * 155) / 255
      const g = Math.round(150 - progress * 3 * 100) / 255
      const b = 1
      return new Color(r, g, b)
    } else if (progress < 0.66) {
      // 紫色到粉色
      const localProgress = (progress - 0.33) / 0.33
      const r = 1
      const g = Math.round(50 + localProgress * 100) / 255
      const b = Math.round(255 - localProgress * 100) / 255
      return new Color(r, g, b)
    } else {
      // 粉色到金色
      const localProgress = (progress - 0.66) / 0.34
      const r = 1
      const g = Math.round(150 + localProgress * 105) / 255
      const b = Math.round(155 - localProgress * 155) / 255
      return new Color(r, g, b)
    }
  }

  useFrame(() => {
    if (!meshRef.current || !selectedEvent) return

    const time = Date.now() * 0.001

    // 设置球体位置（居中）
    tempObject.position.set(0, 0, 0)
    
    // 添加轻微的浮动效果
    tempObject.position.y += Math.sin(time * 2) * 0.2
    
    // 添加缓慢旋转
    tempObject.rotation.y = time * 0.5
    tempObject.rotation.x = Math.sin(time * 0.3) * 0.1
    
    // 设置大小（比正常大一些，因为是焦点）
    const baseSize = 2.0
    const pulseScale = 1 + Math.sin(time * 3) * 0.1
    tempObject.scale.setScalar(baseSize * pulseScale)

    tempObject.updateMatrix()
    meshRef.current.setMatrixAt(0, tempObject.matrix)

    // 设置颜色
    if (meshRef.current.instanceColor) {
      const color = getEventColor(selectedEvent.nanci)
      meshRef.current.setColorAt(0, color)
      meshRef.current.instanceColor.needsUpdate = true
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!selectedEvent) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 1]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        emissive={getEventColor(selectedEvent.nanci)}
        emissiveIntensity={0.3}
        metalness={0.2}
        roughness={0.4}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  )
}

/**
 * 详情场景相机控制组件
 */
const DetailSceneCamera: React.FC = () => {
  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={15}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      autoRotate={false}
      autoRotateSpeed={0.5}
    />
  )
}

/**
 * 事件详情场景组件
 * 功能：
 * - 独立的3D场景，只显示选中的事件球体
 * - 保持星空背景
 * - 固定的最佳观察相机角度
 * - 专门用于事件详情展示
 */
export const EventDetailScene: React.FC = () => {
  const { selectedEvent } = useGalaxyStore()

  if (!selectedEvent) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#000' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%', 
          color: '#fff' 
        }}>
          未选择事件
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <Canvas
        camera={{
          position: [0, 2, 8],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance' as const
        }}
      >
        {/* 环境光 */}
        <ambientLight intensity={0.2} />
        
        {/* 主光源 */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          color="#ffffff"
        />
        
        {/* 辅助光源 */}
        <pointLight
          position={[-5, 3, -5]}
          intensity={0.5}
          color="#4facfe"
        />

        {/* 背景星空 */}
        <StarField />

        {/* 选中的事件球体 */}
        <SingleEventSphere />

        {/* 相机控制 */}
        <DetailSceneCamera />
      </Canvas>
    </div>
  )
}

export default EventDetailScene
