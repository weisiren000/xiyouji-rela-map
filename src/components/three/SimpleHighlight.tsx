import React from 'react'
import { Vector3 } from 'three'

/**
 * 超级简化的高亮效果组件
 * 用于调试 - 最小化的实现，避免复杂的动画和材质操作
 */

interface SimpleHighlightProps {
  position: Vector3 | null
  size: number
  color: string
  visible: boolean
}

export const SimpleHighlight: React.FC<SimpleHighlightProps> = ({
  position,
  size,
  color,
  visible
}) => {
  // 如果不可见或没有位置，不渲染
  if (!visible || !position) {
    return null
  }

  console.log('🔆 渲染简单高亮效果:', {
    position: position ? [position.x.toFixed(2), position.y.toFixed(2), position.z.toFixed(2)] : null,
    size,
    color
  })

  return (
    <mesh position={position}>
      <sphereGeometry args={[size * 2.0, 16, 16]} />
      <meshBasicMaterial
        color="#ffff00"
        transparent={true}
        opacity={0.8}
        wireframe={false}
      />
    </mesh>
  )
}

/**
 * 稍微复杂一点的高亮效果 - 如果简单版本工作正常
 */
export const SimpleHighlightWithGlow: React.FC<SimpleHighlightProps> = ({
  position,
  size,
  color,
  visible
}) => {
  if (!visible || !position) {
    return null
  }

  console.log('✨ 渲染发光高亮效果:', { position, size, color })

  return (
    <mesh position={position}>
      <sphereGeometry args={[size * 1.3, 16, 16]} />
      <meshStandardMaterial
        color={color}
        transparent={true}
        opacity={0.3}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.1}
        roughness={0.3}
      />
    </mesh>
  )
}
