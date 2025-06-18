import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, MeshStandardMaterial, Vector3, Color, DoubleSide } from 'three'

interface CharacterHighlightProps {
  position: Vector3 | null
  size: number
  color: string
  visible: boolean
}

/**
 * 角色悬浮高亮效果组件
 * 在悬浮的角色周围显示描边泛光效果
 */
export const CharacterHighlight: React.FC<CharacterHighlightProps> = ({
  position,
  size,
  color,
  visible
}) => {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshStandardMaterial>(null)
  const pulsePhase = useRef(0)

  // 更新位置
  useEffect(() => {
    if (meshRef.current && position) {
      meshRef.current.position.copy(position)
    }
  }, [position])

  // 动画循环 - 脉冲效果
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current || !visible || !position) return

    try {
      const time = state.clock.elapsedTime
      pulsePhase.current = time * 3 // 脉冲速度

      // 脉冲缩放效果
      const pulseScale = 1.0 + Math.sin(pulsePhase.current) * 0.2
      const finalScale = size * pulseScale * 1.3 // 比原球体稍大

      // 安全地设置缩放
      if (isFinite(finalScale) && finalScale > 0) {
        meshRef.current.scale.setScalar(finalScale)
      }

      // 脉冲透明度效果
      const pulseOpacity = Math.max(0.1, Math.min(1.0, 0.3 + Math.sin(pulsePhase.current) * 0.2))
      materialRef.current.opacity = pulseOpacity

      // 脉冲发光强度 - 现在使用正确的MeshStandardMaterial
      const emissiveIntensity = Math.max(0.1, Math.min(2.0, 0.5 + Math.sin(pulsePhase.current) * 0.3))

      // 安全地设置发光颜色和强度
      if (materialRef.current.emissive && typeof materialRef.current.emissiveIntensity === 'number') {
        materialRef.current.emissive.setHex(new Color(color).getHex())
        materialRef.current.emissiveIntensity = emissiveIntensity
      }
    } catch (error) {
      console.error('CharacterHighlight animation error:', error)
      // 发生错误时重置到安全状态
      if (meshRef.current) {
        meshRef.current.scale.setScalar(size * 1.3)
      }
      if (materialRef.current) {
        materialRef.current.opacity = 0.3
        if (materialRef.current.emissiveIntensity !== undefined) {
          materialRef.current.emissiveIntensity = 0.5
        }
      }
    }
  })

  if (!visible || !position) return null

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        transparent={true}
        opacity={0.3}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.1}
        roughness={0.3}
        side={DoubleSide}
      />
    </mesh>
  )
}
