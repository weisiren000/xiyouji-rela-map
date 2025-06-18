import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3, Color } from 'three'

/**
 * 漂亮的高亮效果组件
 * 优雅的脉冲发光效果，不会导致渲染问题
 */

interface BeautifulHighlightProps {
  position: Vector3 | null
  size: number
  color: string
  visible: boolean
}

export const BeautifulHighlight: React.FC<BeautifulHighlightProps> = ({
  position,
  size,
  color,
  visible
}) => {
  const meshRef = useRef<Mesh>(null)
  const pulsePhase = useRef(0)

  // 如果不可见或没有位置，不渲染
  if (!visible || !position) {
    return null
  }

  // 优雅的脉冲动画
  useFrame((state) => {
    if (!meshRef.current) return

    try {
      const time = state.clock.elapsedTime
      pulsePhase.current = time * 2 // 脉冲速度

      // 温和的缩放脉冲
      const pulseScale = 1.0 + Math.sin(pulsePhase.current) * 0.15
      const finalScale = size * 1.4 * pulseScale
      
      if (isFinite(finalScale) && finalScale > 0) {
        meshRef.current.scale.setScalar(finalScale)
      }

      // 温和的透明度脉冲
      const pulseOpacity = 0.3 + Math.sin(pulsePhase.current) * 0.2
      if (meshRef.current.material && 'opacity' in meshRef.current.material) {
        (meshRef.current.material as any).opacity = Math.max(0.1, Math.min(0.8, pulseOpacity))
      }
    } catch (error) {
      console.error('BeautifulHighlight animation error:', error)
    }
  })

  // 解析颜色并增加亮度
  const highlightColor = new Color(color).multiplyScalar(1.5)

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial
        color={highlightColor}
        transparent={true}
        opacity={0.4}
        emissive={highlightColor}
        emissiveIntensity={0.3}
        metalness={0.1}
        roughness={0.2}
        wireframe={false}
      />
    </mesh>
  )
}

/**
 * 简约版高亮效果 - 如果标准版有问题
 */
export const MinimalHighlight: React.FC<BeautifulHighlightProps> = ({
  position,
  size,
  color,
  visible
}) => {
  if (!visible || !position) {
    return null
  }

  return (
    <mesh position={position}>
      <sphereGeometry args={[size * 1.3, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent={true}
        opacity={0.4}
      />
    </mesh>
  )
}

/**
 * 发光环效果 - 更加优雅
 */
export const GlowRingHighlight: React.FC<BeautifulHighlightProps> = ({
  position,
  size,
  color,
  visible
}) => {
  const ringRef = useRef<Mesh>(null)

  if (!visible || !position) {
    return null
  }

  // 旋转动画
  useFrame((state) => {
    if (!ringRef.current) return
    
    try {
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.5
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    } catch (error) {
      console.error('GlowRingHighlight animation error:', error)
    }
  })

  const glowColor = new Color(color).multiplyScalar(2)

  return (
    <group position={position}>
      {/* 内层发光球 */}
      <mesh>
        <sphereGeometry args={[size * 1.2, 16, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent={true}
          opacity={0.2}
        />
      </mesh>
      
      {/* 旋转发光环 */}
      <mesh ref={ringRef}>
        <torusGeometry args={[size * 1.5, size * 0.1, 8, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent={true}
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}
