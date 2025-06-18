import React from 'react'
import { Vector3 } from 'three'

/**
 * 非常明显的高亮效果组件
 * 用于调试 - 确保用户能清楚看到效果
 */

interface VeryObviousHighlightProps {
  position: Vector3 | null
  size: number
  color: string
  visible: boolean
}

export const VeryObviousHighlight: React.FC<VeryObviousHighlightProps> = ({
  position,
  size,
  color,
  visible
}) => {
  // 如果不可见或没有位置，不渲染
  if (!visible || !position) {
    return null
  }

  console.log('🚨 渲染超明显高亮效果:', { 
    position: position ? [position.x.toFixed(2), position.y.toFixed(2), position.z.toFixed(2)] : null, 
    size, 
    color 
  })

  return (
    <group position={position}>
      {/* 大黄色球体 */}
      <mesh>
        <sphereGeometry args={[size * 3.0, 16, 16]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent={true}
          opacity={0.6}
        />
      </mesh>
      
      {/* 红色线框 */}
      <mesh>
        <sphereGeometry args={[size * 3.5, 8, 8]} />
        <meshBasicMaterial
          color="#ff0000"
          transparent={true}
          opacity={0.8}
          wireframe={true}
        />
      </mesh>
      
      {/* 绿色小球标记中心 */}
      <mesh>
        <sphereGeometry args={[size * 0.5, 8, 8]} />
        <meshBasicMaterial
          color="#00ff00"
          transparent={false}
        />
      </mesh>
    </group>
  )
}
