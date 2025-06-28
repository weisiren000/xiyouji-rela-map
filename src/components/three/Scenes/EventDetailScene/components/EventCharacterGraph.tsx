import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3, BufferAttribute, BufferGeometry } from 'three'
import { EventData } from '@/types/events'
import { EventCharacter, getEventCharacterGraphCached } from '@/services/eventCharacterService'
import { useEventCharacterInteraction } from '@/hooks/useEventCharacterInteraction'
import { useGalaxyStore } from '@/stores/useGalaxyStore'

interface EventCharacterGraphProps {
  event: EventData
  visible?: boolean
  resetTrigger?: number
  onDragStatusChange?: (status: string) => void
  onControlsEnabledChange?: (enabled: boolean) => void
}

/**
 * 事件角色关系图谱组件
 * 显示事件中主要人物的3D球体，围绕中心事件点分布
 */
export const EventCharacterGraph: React.FC<EventCharacterGraphProps> = ({
  event,
  visible = true,
  resetTrigger = 0,
  onDragStatusChange,
  onControlsEnabledChange
}) => {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])
  const [characters, setCharacters] = useState<EventCharacter[]>([])
  const [loading, setLoading] = useState(true)

  // 存储实时球体位置（包含浮动效果）
  const realTimePositions = useRef<Vector3[]>([])

  // 获取配置参数
  const { eventCharacterGraphConfig } = useGalaxyStore()

  // 集成交互功能
  const {
    resetTemporaryPositions,
    getCharacterPosition,
    isHovered,
    isDragging,
    isLongPressing
  } = useEventCharacterInteraction(
    characters,
    meshRef,
    (index: number, position: Vector3) => {
      // 处理角色位置更新
      console.log(`🎯 更新角色 ${characters[index]?.name} 位置:`, position)
    },
    onDragStatusChange,
    onControlsEnabledChange
  )

  // 处理重置触发
  useEffect(() => {
    if (resetTrigger > 0) {
      resetTemporaryPositions()
      console.log('🔄 重置角色关系图谱位置')
    }
  }, [resetTrigger, resetTemporaryPositions])

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
      // 获取当前位置（可能是拖拽后的临时位置）
      const currentPosition = getCharacterPosition(i)
      tempObject.position.copy(currentPosition)

      // 添加轻微的浮动效果（拖拽时减弱）
      const floatIntensity = isDragging(i) ? eventCharacterGraphConfig.floatIntensity * 0.3 : eventCharacterGraphConfig.floatIntensity
      tempObject.position.y += Math.sin(time * eventCharacterGraphConfig.floatSpeed + i * 0.5) * floatIntensity

      // 存储实时位置（包含浮动效果）
      if (!realTimePositions.current[i]) {
        realTimePositions.current[i] = new Vector3()
      }
      realTimePositions.current[i].copy(tempObject.position)

      // 添加缓慢旋转
      tempObject.rotation.y = time * eventCharacterGraphConfig.rotationSpeed + i * 0.2
      tempObject.rotation.x = Math.sin(time * 0.5 + i * 0.3) * eventCharacterGraphConfig.rotationAmplitude

      // 设置大小（带脉冲效果和交互状态）
      let baseSize = character.size * eventCharacterGraphConfig.baseSize // 使用配置的基础大小

      // 交互状态影响大小
      if (isDragging(i)) {
        baseSize *= eventCharacterGraphConfig.dragSizeMultiplier // 拖拽时放大
      } else if (isLongPressing(i)) {
        baseSize *= eventCharacterGraphConfig.longPressSizeMultiplier // 长按时放大
      } else if (isHovered(i)) {
        baseSize *= eventCharacterGraphConfig.hoverSizeMultiplier // 悬浮时放大
      }

      const pulseScale = 1 + Math.sin(time * eventCharacterGraphConfig.pulseSpeed + i * 0.7) * eventCharacterGraphConfig.pulseIntensity
      tempObject.scale.setScalar(baseSize * pulseScale)

      tempObject.updateMatrix()

      // 更新实例矩阵
      if (meshRef.current) {
        meshRef.current.setMatrixAt(i, tempObject.matrix)

        // 设置颜色（交互状态影响颜色）
        if (meshRef.current.instanceColor) {
          let color = new Color(character.color)

          // 交互状态影响颜色
          if (isDragging(i)) {
            color = new Color('#FFD700').multiplyScalar(eventCharacterGraphConfig.dragGoldMultiplier) // 拖拽时显示金色高亮
          } else if (isLongPressing(i)) {
            color = color.clone().lerp(new Color('#FFD700'), eventCharacterGraphConfig.longPressGoldLerp) // 长按时偏金色
          } else if (isHovered(i)) {
            color = color.clone().multiplyScalar(eventCharacterGraphConfig.hoverColorMultiplier) // 悬浮时稍亮
          }

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

  // 获取实时球体位置（包含浮动效果）
  const getRealTimePosition = useCallback((index: number): Vector3 => {
    if (realTimePositions.current[index]) {
      return realTimePositions.current[index]
    }
    // 如果还没有实时位置，返回基础位置
    return getCharacterPosition(index)
  }, [getCharacterPosition])

  // 如果没有角色数据，不渲染
  if (loading || characters.length === 0) {
    return null
  }

  return (
    <group visible={visible}>
      {/* 角色球体 */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, characters.length]}>
        <sphereGeometry args={[1, eventCharacterGraphConfig.sphereSegments, eventCharacterGraphConfig.sphereRings]} />
        <meshStandardMaterial
          transparent
          opacity={eventCharacterGraphConfig.opacity}
          metalness={eventCharacterGraphConfig.metalness}
          roughness={eventCharacterGraphConfig.roughness}
        />
      </instancedMesh>

      {/* 连接线（从中心到各个角色） */}
      {characters.map((character, index) => {
        const currentPosition = getRealTimePosition(index)
        return (
          <ConnectionLine
            key={character.id}
            start={[0, 0, 0]}
            end={[currentPosition.x, currentPosition.y, currentPosition.z]}
            color={character.color}
            opacity={isDragging(index) ? eventCharacterGraphConfig.lineOpacityDrag : eventCharacterGraphConfig.lineOpacity} // 拖拽时连接线更明显
          />
        )
      })}

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
  const geometryRef = useRef<BufferGeometry>(null)

  // 使用 useEffect 来实时更新线条位置
  useEffect(() => {
    if (geometryRef.current) {
      const positions = new Float32Array([
        start[0], start[1], start[2],
        end[0], end[1], end[2]
      ])

      geometryRef.current.setAttribute('position', new BufferAttribute(positions, 3))
      geometryRef.current.attributes.position.needsUpdate = true
    }
  }, [start, end])

  return (
    <line>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([
            start[0], start[1], start[2],
            end[0], end[1], end[2]
          ])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        linewidth={2} // WebGL限制，大多数浏览器只支持1px
      />
    </line>
  )
}

// 角色标签组件已移除，暂时不需要

export default EventCharacterGraph
