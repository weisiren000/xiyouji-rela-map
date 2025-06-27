import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { EventData } from '@/types/events'
import { EventCharacter, getEventCharacterGraphCached } from '@/services/eventCharacterService'

interface EventCharacterGraphProps {
  event: EventData
  visible?: boolean
}

/**
 * 事件角色关系图谱组件
 * 显示事件中主要人物的3D球体，围绕中心事件点分布
 */
export const EventCharacterGraph: React.FC<EventCharacterGraphProps> = ({
  event,
  visible = true
}) => {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])
  const [characters, setCharacters] = useState<EventCharacter[]>([])
  const [loading, setLoading] = useState(true)

  // 加载角色数据
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setLoading(true)
        const eventCharacters = await getEventCharacterGraphCached(event)
        setCharacters(eventCharacters)
        console.log(`🎭 加载事件角色关系图谱: ${eventCharacters.length} 个角色`)
      } catch (error) {
        console.error('加载事件角色失败:', error)
        setCharacters([])
      } finally {
        setLoading(false)
      }
    }

    loadCharacters()
  }, [event])

  // 动画更新
  useFrame(() => {
    if (!meshRef.current || !visible || loading || characters.length === 0) return

    const time = Date.now() * 0.001

    characters.forEach((character, i) => {
      // 设置位置
      tempObject.position.set(...character.position)
      
      // 添加轻微的浮动效果
      tempObject.position.y += Math.sin(time * 2 + i * 0.5) * 0.3
      
      // 添加缓慢旋转
      tempObject.rotation.y = time * 0.3 + i * 0.2
      tempObject.rotation.x = Math.sin(time * 0.5 + i * 0.3) * 0.1
      
      // 设置大小（带脉冲效果）
      const baseSize = character.size * 0.8 // 比中心事件球体小一些
      const pulseScale = 1 + Math.sin(time * 3 + i * 0.7) * 0.1
      tempObject.scale.setScalar(baseSize * pulseScale)

      tempObject.updateMatrix()
      
      // 更新实例矩阵
      if (meshRef.current) {
        meshRef.current.setMatrixAt(i, tempObject.matrix)
        
        // 设置颜色
        if (meshRef.current.instanceColor) {
          const color = new Color(character.color)
          meshRef.current.setColorAt(i, color)
        }
      }
    })

    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true
      }
    }
  })

  // 如果没有角色数据，不渲染
  if (loading || characters.length === 0) {
    return null
  }

  return (
    <group visible={visible}>
      {/* 角色球体 */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, characters.length]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          transparent
          opacity={0.8}
          metalness={0.3}
          roughness={0.4}
        />
      </instancedMesh>

      {/* 连接线（从中心到各个角色） */}
      {characters.map((character, index) => (
        <ConnectionLine
          key={character.id}
          start={[0, 0, 0]}
          end={character.position}
          color={character.color}
          opacity={0.3}
        />
      ))}

      {/* 角色标签（可选，暂时注释掉避免性能问题） */}
      {/* {characters.map((character, index) => (
        <CharacterLabel
          key={character.id}
          position={character.position}
          name={character.name}
        />
      ))} */}
    </group>
  )
}

/**
 * 连接线组件
 * 从中心事件点连接到角色点
 */
interface ConnectionLineProps {
  start: [number, number, number]
  end: [number, number, number]
  color: string
  opacity?: number
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  start,
  end,
  color,
  opacity = 0.5
}) => {
  const points = useMemo(() => {
    return [new Vector3(...start), new Vector3(...end)]
  }, [start, end])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        linewidth={2}
      />
    </line>
  )
}

/**
 * 角色标签组件（暂时未使用）
 */
interface CharacterLabelProps {
  position: [number, number, number]
  name: string
}

const CharacterLabel: React.FC<CharacterLabelProps> = ({ position, name }) => {
  return (
    <mesh position={position}>
      <planeGeometry args={[2, 0.5]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      {/* 这里需要添加文本渲染，暂时简化 */}
    </mesh>
  )
}

export default EventCharacterGraph
