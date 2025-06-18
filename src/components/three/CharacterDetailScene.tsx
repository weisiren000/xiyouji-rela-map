import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { StarField } from './Galaxy'

/**
 * 角色详情场景组件
 * 功能：
 * - 独立的3D场景，只显示选中的角色球体
 * - 保持星空背景
 * - 固定的最佳观察相机角度
 * - 隐藏其他所有角色
 */

/**
 * 单个角色球体组件
 */
const SingleCharacterSphere: React.FC = () => {
  const meshRef = useRef<InstancedMesh>(null)
  const { selectedCharacter, detailViewCameraPosition } = useGalaxyStore()
  
  // 临时对象用于设置实例变换
  const tempObject = useMemo(() => new Object3D(), [])
  
  // 如果没有选中角色，不渲染
  if (!selectedCharacter) {
    return null
  }

  // 角色视觉配置
  const character = selectedCharacter
  const color = new Color(character.visual.color)
  const size = character.visual.size || 1.0
  const emissiveIntensity = character.visual.emissiveIntensity || 0.2

  // 设置球体位置（居中显示）
  React.useEffect(() => {
    if (meshRef.current) {
      tempObject.position.set(0, 0, 0) // 居中显示
      tempObject.scale.setScalar(size)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(0, tempObject.matrix)
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  }, [character, size, tempObject])

  // 旋转动画
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      tempObject.position.set(0, 0, 0)
      tempObject.rotation.y = time * 0.5 // 缓慢旋转
      tempObject.scale.setScalar(size)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(0, tempObject.matrix)
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 1]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  )
}

/**
 * 详情场景相机控制
 */
const DetailSceneCamera: React.FC = () => {
  const { detailViewCameraPosition } = useGalaxyStore()
  
  return (
    <OrbitControls
      target={[0, 0, 0]} // 聚焦到角色球体中心
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      autoRotate={false}
    />
  )
}

/**
 * 角色详情3D场景组件
 */
export const CharacterDetailScene: React.FC = () => {
  const { selectedCharacter, detailViewCameraPosition } = useGalaxyStore()

  // 如果没有选中角色，显示空场景
  if (!selectedCharacter) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#000' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#666',
          fontSize: '18px'
        }}>
          未选择角色
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <Canvas
        camera={{
          position: [
            detailViewCameraPosition.x,
            detailViewCameraPosition.y,
            detailViewCameraPosition.z
          ],
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
        <ambientLight intensity={0.3} />
        
        {/* 主光源 */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
        />

        {/* 背景星空 - 保持与主场景一致 */}
        <StarField />

        {/* 选中的角色球体 */}
        <SingleCharacterSphere />

        {/* 相机控制 */}
        <DetailSceneCamera />
      </Canvas>
    </div>
  )
}

export default CharacterDetailScene
