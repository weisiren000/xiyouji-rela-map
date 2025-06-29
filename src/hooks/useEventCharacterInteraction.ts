import { useCallback, useRef, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector2, Vector3, Raycaster, InstancedMesh, Plane } from 'three'
import { EventCharacter } from '@/services/eventCharacterService'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { CharacterData, CharacterType } from '@/types/character'

interface DragState {
  isDragging: boolean
  draggedIndex: number | null
  dragStartPosition: Vector3 | null
  dragCurrentPosition: Vector3 | null
  dragStartTime: number
  dragStartMouse: Vector2
}

interface InteractionState {
  hoveredIndex: number | null
  selectedIndex: number | null
  longPressIndex: number | null
  longPressStartTime: number
  lastClickIndex: number | null
  lastClickTime: number
  mousePosition: Vector2
  dragState: DragState
}

const LONG_PRESS_DURATION = 300 // 300ms长按检测（降低阈值）
const DOUBLE_CLICK_DURATION = 300 // 300ms双击检测
// const DRAG_THRESHOLD = 3 // 3像素拖拽阈值（降低阈值）

/**
 * 基于射线投影计算拖拽位置
 * 这种方法确保拖拽移动完全基于用户的视角
 */
function calculateDragPositionByRayProjection(
  camera: any,
  canvas: HTMLCanvasElement,
  startMouse: Vector2,
  currentMouse: Vector2,
  startPosition: Vector3
): Vector3 {
  // 1. 创建垂直于相机视线的平面，通过起始位置
  const cameraDirection = new Vector3()
  camera.getWorldDirection(cameraDirection)
  const dragPlane = new Plane(cameraDirection, -cameraDirection.dot(startPosition))

  // 2. 计算起始鼠标位置的射线
  const startMouseNDC = new Vector2(
    (startMouse.x / canvas.clientWidth) * 2 - 1,
    -(startMouse.y / canvas.clientHeight) * 2 + 1
  )
  const startRaycaster = new Raycaster()
  startRaycaster.setFromCamera(startMouseNDC, camera)

  // 3. 计算当前鼠标位置的射线
  const currentMouseNDC = new Vector2(
    (currentMouse.x / canvas.clientWidth) * 2 - 1,
    -(currentMouse.y / canvas.clientHeight) * 2 + 1
  )
  const currentRaycaster = new Raycaster()
  currentRaycaster.setFromCamera(currentMouseNDC, camera)

  // 4. 计算射线与平面的交点
  const startIntersection = new Vector3()
  const currentIntersection = new Vector3()

  startRaycaster.ray.intersectPlane(dragPlane, startIntersection)
  currentRaycaster.ray.intersectPlane(dragPlane, currentIntersection)

  // 5. 计算移动向量并应用到起始位置
  const movement = currentIntersection.sub(startIntersection)
  const newPosition = startPosition.clone().add(movement)

  return newPosition
}

/**
 * 备用的视角平移拖拽方法
 * 基于相机视角的简化平移计算
 */
function calculateDragPositionByViewProjection(
  camera: any,
  canvas: HTMLCanvasElement,
  startMouse: Vector2,
  currentMouse: Vector2,
  startPosition: Vector3
): Vector3 {
  // 1. 计算鼠标移动距离
  const mouseDelta = new Vector2(
    currentMouse.x - startMouse.x,
    currentMouse.y - startMouse.y
  )

  // 2. 转换为NDC坐标
  const ndcDelta = new Vector2(
    (mouseDelta.x / canvas.clientWidth) * 2,
    -(mouseDelta.y / canvas.clientHeight) * 2  // Y轴翻转
  )

  // 3. 获取相机矩阵和距离
  const cameraDistance = camera.position.distanceTo(startPosition)
  const cameraMatrix = camera.matrixWorld.clone()

  // 4. 计算相机的右向量和上向量
  const cameraRight = new Vector3().setFromMatrixColumn(cameraMatrix, 0)
  const cameraUp = new Vector3().setFromMatrixColumn(cameraMatrix, 1)

  // 5. 根据视野角度计算移动比例
  const fov = camera.fov * Math.PI / 180
  const viewHeight = 2 * Math.tan(fov / 2) * cameraDistance
  const viewWidth = viewHeight * camera.aspect

  // 6. 计算3D移动向量
  const rightMovement = cameraRight.clone().multiplyScalar(ndcDelta.x * viewWidth * 0.5)
  const upMovement = cameraUp.clone().multiplyScalar(ndcDelta.y * viewHeight * 0.5)

  // 7. 应用移动
  const newPosition = startPosition.clone()
  newPosition.add(rightMovement)
  newPosition.add(upMovement)

  return newPosition
}

/**
 * 事件角色关系图谱交互Hook
 * 功能：
 * - 长按检测和拖拽功能
 * - 双击进入角色局部视图
 * - 悬浮高亮效果
 * - 临时位置重置
 */
export const useEventCharacterInteraction = (
  characters: EventCharacter[],
  meshRef: React.RefObject<InstancedMesh>,
  onCharacterPositionUpdate?: (index: number, position: Vector3) => void,
  onDragStatusChange?: (status: string) => void,
  onControlsEnabledChange?: (enabled: boolean) => void
) => {
  const { camera, gl } = useThree()
  const { enterEmptyPageCharacterDetailView } = useGalaxyStore()
  const raycaster = useRef(new Raycaster())
  const mouse = useRef(new Vector2())
  
  const [interactionState, setInteractionState] = useState<InteractionState>({
    hoveredIndex: null,
    selectedIndex: null,
    longPressIndex: null,
    longPressStartTime: 0,
    lastClickIndex: null,
    lastClickTime: 0,
    mousePosition: new Vector2(),
    dragState: {
      isDragging: false,
      draggedIndex: null,
      dragStartPosition: null,
      dragCurrentPosition: null,
      dragStartTime: 0,
      dragStartMouse: new Vector2()
    }
  })

  // 临时位置存储（用于拖拽时的位置更新）
  const temporaryPositions = useRef<Map<number, Vector3>>(new Map())

  /**
   * 更新鼠标位置
   */
  const updateMousePosition = useCallback((event: PointerEvent) => {
    if (!gl.domElement) return

    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    setInteractionState(prev => ({
      ...prev,
      mousePosition: new Vector2(event.clientX, event.clientY)
    }))
  }, [gl.domElement])

  /**
   * 执行射线检测
   */
  const performRaycast = useCallback((): number | null => {
    if (!meshRef.current || !camera || characters.length === 0) return null

    raycaster.current.setFromCamera(mouse.current, camera)
    const intersects = raycaster.current.intersectObject(meshRef.current)

    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId
      if (instanceId !== undefined && instanceId < characters.length) {
        return instanceId
      }
    }
    return null
  }, [camera, meshRef, characters])

  /**
   * 处理指针按下事件
   */
  const handlePointerDown = useCallback((event: PointerEvent) => {
    updateMousePosition(event)
    const hitIndex = performRaycast()
    
    if (hitIndex !== null) {
      const currentTime = Date.now()
      
      setInteractionState(prev => {
        // 检测双击
        const isDoubleClick = 
          prev.lastClickIndex === hitIndex &&
          currentTime - prev.lastClickTime < DOUBLE_CLICK_DURATION

        if (isDoubleClick) {
          // 双击进入角色局部视图
          const character = characters[hitIndex]
          console.log('🎯 双击角色进入详情视图:', character.name)
          
          // 如果EventCharacter包含完整的CharacterData，直接使用
          if (character.character) {
            enterEmptyPageCharacterDetailView(character.character)
            return prev
          }

          // 否则创建一个临时的CharacterData对象
          const characterData: CharacterData = {
            id: character.id,
            name: character.name,
            pinyin: character.name,
            type: CharacterType.HUMAN, // 默认类型
            faction: '未知',
            rank: 0,
            level: {
              id: 'unknown',
              name: '未知',
              tier: 0
            },
            description: `来自事件关系图谱的角色: ${character.name}`,
            visual: {
              color: character.color,
              size: character.size,
              emissiveIntensity: character.emissiveIntensity
            },
            metadata: {
              source: 'event_character_graph',
              lastModified: new Date().toISOString(),
              tags: ['event_character'],
              verified: false
            }
          }
          
          enterEmptyPageCharacterDetailView(characterData)
          return prev
        }

        // 开始长按检测和可能的拖拽
        const characterName = characters[hitIndex]?.name
        console.log('👆 开始长按检测:', characterName)

        // 报告长按开始
        if (onDragStatusChange) {
          onDragStatusChange(`长按中: ${characterName} (300ms后可拖拽)`)
        }

        return {
          ...prev,
          selectedIndex: hitIndex,
          longPressIndex: hitIndex,
          longPressStartTime: currentTime,
          lastClickIndex: hitIndex,
          lastClickTime: currentTime,
          dragState: {
            ...prev.dragState,
            dragStartTime: currentTime,
            dragStartMouse: new Vector2(event.clientX, event.clientY)
          }
        }
      })
    }
  }, [updateMousePosition, performRaycast, characters, enterEmptyPageCharacterDetailView])

  /**
   * 处理指针移动事件
   */
  const handlePointerMove = useCallback((event: PointerEvent) => {
    updateMousePosition(event)
    
    setInteractionState(prev => {
      const currentTime = Date.now()
      const newState = { ...prev }

      // 如果正在长按，检查是否应该开始拖拽
      if (prev.longPressIndex !== null && !prev.dragState.isDragging) {
        const timeSinceLongPress = currentTime - prev.longPressStartTime
        // const mouseDelta = Math.sqrt(
        //   Math.pow(event.clientX - prev.dragState.dragStartMouse.x, 2) +
        //   Math.pow(event.clientY - prev.dragState.dragStartMouse.y, 2)
        // )

        // 如果长按时间足够，开始拖拽（不需要等待鼠标移动）
        if (timeSinceLongPress >= LONG_PRESS_DURATION) {
          const characterName = characters[prev.longPressIndex]?.name
          console.log('🖱️ 开始拖拽角色:', characterName)

          // 禁用相机控制
          if (onControlsEnabledChange) {
            onControlsEnabledChange(false)
            console.log('🔒 禁用相机控制 - 开始拖拽')
          }

          // 报告拖拽状态
          if (onDragStatusChange) {
            onDragStatusChange(`正在拖拽: ${characterName}`)
          }

          // 获取当前角色的实际位置（包括之前的拖拽位置）
          const character = characters[prev.longPressIndex]
          const tempPos = temporaryPositions.current.get(prev.longPressIndex)
          const startPosition = tempPos ? tempPos.clone() : new Vector3(...character.position)

          console.log('🎯 拖拽开始位置信息:', {
            character: characterName,
            hasTemporaryPosition: !!tempPos,
            originalPosition: character.position,
            startPosition: startPosition.toArray().map(v => v.toFixed(2))
          })

          newState.dragState = {
            ...prev.dragState,
            isDragging: true,
            draggedIndex: prev.longPressIndex,
            dragStartPosition: startPosition,
            dragCurrentPosition: startPosition.clone()
          }

          // 清除长按状态，避免重复触发
          newState.longPressIndex = null
        }
      }

      // 如果正在拖拽，更新拖拽位置
      if (prev.dragState.isDragging && prev.dragState.draggedIndex !== null) {
        const hitIndex = performRaycast()
        
        if (hitIndex !== null) {
          // 更新悬浮状态
          newState.hoveredIndex = hitIndex
        }

        // 计算新的拖拽位置（基于视角的射线投影）
        if (camera && prev.dragState.dragStartPosition) {
          let newPosition: Vector3

          try {
            // 方法1: 基于射线投影的精确拖拽
            newPosition = calculateDragPositionByRayProjection(
              camera,
              gl.domElement,
              prev.dragState.dragStartMouse,
              new Vector2(event.clientX, event.clientY),
              prev.dragState.dragStartPosition
            )
          } catch (error) {
            console.warn('射线投影拖拽失败，使用备用方法:', error)
            // 方法2: 备用的视角平移方法
            newPosition = calculateDragPositionByViewProjection(
              camera,
              gl.domElement,
              prev.dragState.dragStartMouse,
              new Vector2(event.clientX, event.clientY),
              prev.dragState.dragStartPosition
            )
          }

          // 限制拖拽范围
          const maxDistance = 10
          const centerDistance = newPosition.length()
          if (centerDistance > maxDistance) {
            newPosition.normalize().multiplyScalar(maxDistance)
          }

          newState.dragState.dragCurrentPosition = newPosition

          // 存储临时位置
          temporaryPositions.current.set(prev.dragState.draggedIndex, newPosition)

          // 通知父组件位置更新
          if (onCharacterPositionUpdate) {
            onCharacterPositionUpdate(prev.dragState.draggedIndex, newPosition)
          }

          console.log(`🎯 基于视角的拖拽更新:`, {
            character: characters[prev.dragState.draggedIndex]?.name,
            startPos: prev.dragState.dragStartPosition.toArray().map(v => v.toFixed(2)),
            newPos: newPosition.toArray().map(v => v.toFixed(2)),
            distance: prev.dragState.dragStartPosition.distanceTo(newPosition).toFixed(2)
          })
        }
      } else {
        // 正常的悬浮检测
        const hitIndex = performRaycast()
        newState.hoveredIndex = hitIndex
      }

      return newState
    })
  }, [updateMousePosition, performRaycast, camera, characters, onCharacterPositionUpdate])

  /**
   * 处理指针抬起事件
   */
  const handlePointerUp = useCallback(() => {
    setInteractionState(prev => {
      const newState = { ...prev }

      // 结束拖拽
      if (prev.dragState.isDragging) {
        const characterName = characters[prev.dragState.draggedIndex!]?.name
        const finalPosition = temporaryPositions.current.get(prev.dragState.draggedIndex!)

        console.log('🖱️ 结束拖拽角色:', characterName, {
          finalPosition: finalPosition?.toArray().map(v => v.toFixed(2)),
          hasTemporaryPosition: !!finalPosition
        })

        // 重新启用相机控制
        if (onControlsEnabledChange) {
          onControlsEnabledChange(true)
          console.log('🔓 启用相机控制 - 结束拖拽')
        }

        // 报告拖拽结束
        if (onDragStatusChange) {
          onDragStatusChange('')
        }
      }

      // 重置所有交互状态
      if (prev.longPressIndex !== null && !prev.dragState.isDragging) {
        // 如果是长按但没有拖拽，清除状态提示
        if (onDragStatusChange) {
          onDragStatusChange('')
        }
      }

      newState.longPressIndex = null
      newState.longPressStartTime = 0
      newState.dragState = {
        isDragging: false,
        draggedIndex: null,
        dragStartPosition: null,
        dragCurrentPosition: null,
        dragStartTime: 0,
        dragStartMouse: new Vector2()
      }

      return newState
    })
  }, [characters])

  /**
   * 重置临时位置
   */
  const resetTemporaryPositions = useCallback(() => {
    temporaryPositions.current.clear()
    console.log('🔄 重置所有角色临时位置')
  }, [])

  /**
   * 获取角色的当前位置（包括临时拖拽位置）
   */
  const getCharacterPosition = useCallback((index: number): Vector3 => {
    const tempPos = temporaryPositions.current.get(index)
    if (tempPos) {
      return tempPos
    }
    return new Vector3(...characters[index].position)
  }, [characters])

  // 绑定事件监听器
  useEffect(() => {
    const canvas = gl.domElement
    if (!canvas) return

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointerleave', handlePointerUp) // 鼠标离开也结束拖拽

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointerleave', handlePointerUp)
    }
  }, [gl.domElement, handlePointerDown, handlePointerMove, handlePointerUp])

  return {
    interactionState,
    resetTemporaryPositions,
    getCharacterPosition,
    isHovered: (index: number) => interactionState.hoveredIndex === index,
    isSelected: (index: number) => interactionState.selectedIndex === index,
    isDragging: (index: number) => interactionState.dragState.draggedIndex === index,
    isLongPressing: (index: number) => interactionState.longPressIndex === index
  }
}
