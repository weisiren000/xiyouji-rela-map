import React, { useState, useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector2, Vector3, Raycaster, InstancedMesh } from 'three'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { CharacterData } from '@/types/character'
import { configureBVHRaycaster, bvhManager } from '@/utils/three/bvhUtils'
import { bvhProfiler } from '@/utils/performance/BVHProfiler'

// 扩展CharacterData以包含位置信息
interface CharacterDataWithPosition extends CharacterData {
  position?: Vector3
  isAlias?: boolean
  originalCharacter?: string
}

interface InteractionState {
  hoveredIndex: number | null
  hoveredCharacter: CharacterDataWithPosition | null
  mousePosition: Vector2
  worldPosition: Vector3 | null
}

/**
 * 角色交互Hook - 处理鼠标悬浮检测和交互状态
 */
export const useCharacterInteraction = (
  characters: CharacterDataWithPosition[],
  meshRef: React.RefObject<InstancedMesh>
) => {
  const { camera, gl } = useThree()
  const { enterDetailView } = useGalaxyStore()
  const raycaster = useRef(new Raycaster())
  const mouse = useRef(new Vector2())

  // 配置射线投射器以使用BVH优化
  const initializeBVHRaycaster = useCallback(() => {
    configureBVHRaycaster(raycaster.current)
    console.log('🚀 BVH射线投射器已配置')
  }, [])

  // 初始化BVH优化
  React.useEffect(() => {
    initializeBVHRaycaster()
  }, [initializeBVHRaycaster])
  
  const [interactionState, setInteractionState] = useState<InteractionState>({
    hoveredIndex: null,
    hoveredCharacter: null,
    mousePosition: new Vector2(),
    worldPosition: null
  })

  /**
   * 更新鼠标位置并进行射线检测
   */
  const updateMousePosition = useCallback((event: MouseEvent) => {
    if (!gl.domElement) return

    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // 更新屏幕坐标用于UI定位
    setInteractionState(prev => ({
      ...prev,
      mousePosition: new Vector2(event.clientX, event.clientY)
    }))
  }, [gl.domElement])

  /**
   * 处理点击事件 - 进入角色详情视图
   */
  const handleClick = useCallback((event: MouseEvent) => {
    if (!meshRef.current || !camera || characters.length === 0) {
      return
    }

    // 更新鼠标位置
    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // 执行射线检测
    raycaster.current.setFromCamera(mouse.current, camera)
    raycaster.current.params.Mesh = { threshold: 0.1 }
    raycaster.current.params.Points = { threshold: 0.1 }

    const intersects = raycaster.current.intersectObject(meshRef.current)

    if (intersects.length > 0) {
      const intersect = intersects[0]
      const instanceId = intersect.instanceId

      if (instanceId !== undefined && instanceId < characters.length) {
        const character = characters[instanceId]
        console.log('🎯 点击角色:', character.name, '进入详情视图')

        // 进入详情视图
        enterDetailView(character)
      }
    }
  }, [camera, gl.domElement, meshRef, characters, enterDetailView])

  /**
   * 执行射线检测 - 使用BVH优化
   */
  const performRaycast = useCallback(() => {
    if (!meshRef.current || !camera || characters.length === 0) {
      // console.log('🔍 射线检测跳过:', { mesh: !!meshRef.current, camera: !!camera, charactersCount: characters.length })
      setInteractionState(prev => {
        if (prev.hoveredIndex !== null) {
          return {
            ...prev,
            hoveredIndex: null,
            hoveredCharacter: null,
            worldPosition: null
          }
        }
        return prev
      })
      return
    }

    // 确保InstancedMesh有BVH
    if (!meshRef.current.geometry.boundsTree) {
      bvhManager.computeInstancedBVH(
        meshRef.current,
        { maxDepth: 20, maxLeafTris: 5 }, // 针对球体优化的参数
        `characters_${meshRef.current.uuid}`
      )
      console.log('🌳 为角色InstancedMesh创建BVH')
    }

    const startTime = performance.now()

    raycaster.current.setFromCamera(mouse.current, camera)
    // BVH优化的射线投射器会自动使用firstHitOnly模式
    const intersects = raycaster.current.intersectObject(meshRef.current)

    const raycastTime = performance.now() - startTime
    bvhProfiler.recordRaycast(raycastTime, intersects.length)

    if (intersects.length > 0) {
      const intersect = intersects[0]
      const instanceId = intersect.instanceId

      console.log('🎯 射线检测命中:', {
        instanceId,
        charactersLength: characters.length,
        intersectPoint: intersect.point,
        distance: intersect.distance
      })

      if (instanceId !== undefined && instanceId < characters.length) {
        const character = characters[instanceId]

        console.log('✅ 悬浮角色:', character.name, '位置:', character.position)

        // 使用角色的实际位置而不是射线交点
        const actualPosition = character.position || intersect.point.clone()

        // 使用函数式更新避免依赖当前状态
        setInteractionState(prev => {
          if (instanceId !== prev.hoveredIndex) {
            return {
              ...prev,
              hoveredIndex: instanceId,
              hoveredCharacter: character,
              worldPosition: actualPosition
            }
          }
          return prev
        })
      }
    } else {
      // 没有悬浮对象时清除状态
      setInteractionState(prev => {
        if (prev.hoveredIndex !== null) {
          console.log('🚫 清除悬浮状态')
          return {
            ...prev,
            hoveredIndex: null,
            hoveredCharacter: null,
            worldPosition: null
          }
        }
        return prev
      })
    }
  }, [camera, meshRef, characters]) // 移除interactionState.hoveredIndex依赖

  /**
   * 在每帧中执行射线检测 - 降低频率以提高性能
   */
  useFrame((state) => {
    // 每3帧检测一次，减少性能开销
    if (Math.floor(state.clock.elapsedTime * 60) % 3 === 0) {
      performRaycast()
    }
  })

  /**
   * 绑定鼠标事件
   */
  const bindMouseEvents = useCallback(() => {
    if (!gl.domElement) {
      console.warn('⚠️ gl.domElement 不可用，无法绑定鼠标事件')
      return () => {}
    }

    console.log('🖱️ 绑定鼠标事件到canvas')
    gl.domElement.addEventListener('mousemove', updateMousePosition)
    gl.domElement.addEventListener('click', handleClick)

    return () => {
      console.log('🖱️ 清理鼠标事件')
      gl.domElement.removeEventListener('mousemove', updateMousePosition)
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [gl.domElement, updateMousePosition, handleClick])

  return {
    interactionState,
    bindMouseEvents,
    isHovered: (index: number) => interactionState.hoveredIndex === index
  }
}
