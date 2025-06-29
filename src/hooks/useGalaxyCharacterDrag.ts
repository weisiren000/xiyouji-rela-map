import React, { useState, useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector2, Vector3, Raycaster, InstancedMesh, Camera } from 'three'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { CharacterData } from '@/types/character'

// 扩展CharacterData以包含位置信息
interface CharacterDataWithPosition extends CharacterData {
  position?: Vector3
  isAlias?: boolean
  originalCharacter?: string
}

interface DragState {
  isDragging: boolean
  draggedIndex: number
  dragStartTime: number
  dragStartMouse: Vector2
  dragStartPosition: Vector3
  dragCurrentPosition: Vector3 | null
}

interface InteractionState {
  hoveredIndex: number | null
  hoveredCharacter: CharacterDataWithPosition | null
  mousePosition: Vector2
  selectedIndex: number | null
  longPressIndex: number | null
  longPressStartTime: number
  lastClickIndex: number | null
  lastClickTime: number
  dragState: DragState
}

// 常量配置
const LONG_PRESS_DURATION = 300 // 300ms长按检测
const DOUBLE_CLICK_DURATION = 300 // 300ms双击检测

/**
 * 基于视角的拖拽位置计算（改进版）
 */
const calculateDragPositionByRayProjection = (
  camera: Camera,
  domElement: HTMLElement,
  startMouse: Vector2,
  currentMouse: Vector2,
  startPosition: Vector3
): Vector3 => {
  try {
    const rect = domElement.getBoundingClientRect()

    // 防止除零错误
    if (rect.width === 0 || rect.height === 0) {
      console.warn('⚠️ DOM元素尺寸为0，返回原始位置')
      return startPosition.clone()
    }

    // 计算鼠标移动的像素差值
    const deltaX = currentMouse.x - startMouse.x
    const deltaY = currentMouse.y - startMouse.y

    // 获取相机到起始位置的距离
    const distance = camera.position.distanceTo(startPosition)

    // 防止距离过小导致的异常
    if (distance < 0.1) {
      console.warn('⚠️ 相机距离过小，返回原始位置')
      return startPosition.clone()
    }

    // 计算相机的右向量和上向量
    const cameraRight = new Vector3()
    const cameraUp = new Vector3()

    camera.updateMatrixWorld() // 确保相机矩阵是最新的
    cameraRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize()
    cameraUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize()

    // 基于相机视角计算移动向量 - 调整灵敏度
    const moveScale = Math.min(distance * 0.002, 0.5) // 限制最大移动速度
    const moveVector = new Vector3()
      .addScaledVector(cameraRight, deltaX * moveScale)
      .addScaledVector(cameraUp, -deltaY * moveScale) // 注意Y轴方向

    const newPosition = startPosition.clone().add(moveVector)

    // 边界检查 - 防止位置过于极端
    const maxDistance = 100
    if (newPosition.length() > maxDistance) {
      newPosition.normalize().multiplyScalar(maxDistance)
    }

    return newPosition
  } catch (error) {
    console.error('❌ 拖拽位置计算错误:', error)
    return startPosition.clone()
  }
}

/**
 * 星谱界面角色拖拽交互Hook
 * 功能：
 * - 长按检测和拖拽功能
 * - 基于视角的拖拽移动
 * - 拖拽时禁用视角控制
 * - 悬浮高亮效果
 */
export const useGalaxyCharacterDrag = (
  characters: CharacterDataWithPosition[],
  meshRef: React.RefObject<InstancedMesh>,
  onCharacterPositionUpdate?: (index: number, position: Vector3) => void,
  onDragStatusChange?: (status: string) => void,
  onControlsEnabledChange?: (enabled: boolean) => void
) => {
  const { camera, gl } = useThree()
  const { enterMainPageDetailView } = useGalaxyStore()
  const raycaster = useRef(new Raycaster())
  const mouse = useRef(new Vector2())
  
  // 临时位置存储
  const temporaryPositions = useRef(new Map<number, Vector3>())
  
  const [interactionState, setInteractionState] = useState<InteractionState>({
    hoveredIndex: null,
    hoveredCharacter: null,
    mousePosition: new Vector2(),
    selectedIndex: null,
    longPressIndex: null,
    longPressStartTime: 0,
    lastClickIndex: null,
    lastClickTime: 0,
    dragState: {
      isDragging: false,
      draggedIndex: -1,
      dragStartTime: 0,
      dragStartMouse: new Vector2(),
      dragStartPosition: new Vector3(),
      dragCurrentPosition: null
    }
  })

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
   * 获取角色的当前位置（考虑临时拖拽位置）
   */
  const getCharacterPosition = useCallback((index: number): Vector3 | null => {
    if (index < 0 || index >= characters.length) return null
    
    // 优先返回临时拖拽位置
    const tempPosition = temporaryPositions.current.get(index)
    if (tempPosition) {
      return tempPosition.clone()
    }
    
    // 否则返回原始位置
    return characters[index]?.position?.clone() || null
  }, [characters])

  /**
   * 重置临时位置
   */
  const resetTemporaryPositions = useCallback(() => {
    temporaryPositions.current.clear()
    console.log('🔄 重置所有临时拖拽位置')
  }, [])

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
          // 双击进入角色详情视图
          const character = characters[hitIndex]
          console.log('🎯 双击角色进入详情视图:', character.name)
          enterMainPageDetailView(character)
          return prev
        }

        // 开始长按检测
        const characterName = characters[hitIndex]?.name
        console.log('👆 开始长按检测:', characterName)

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
  }, [updateMousePosition, performRaycast, characters, enterMainPageDetailView, onDragStatusChange])

  /**
   * 处理指针移动事件
   */
  const handlePointerMove = useCallback((event: PointerEvent) => {
    updateMousePosition(event)
    
    setInteractionState(prev => {
      const newState = { ...prev }
      const currentTime = Date.now()

      // 检查是否应该开始拖拽
      if (prev.longPressIndex !== null && 
          !prev.dragState.isDragging &&
          currentTime - prev.longPressStartTime >= LONG_PRESS_DURATION) {
        
        const character = characters[prev.longPressIndex]
        const startPosition = getCharacterPosition(prev.longPressIndex)
        
        if (character && startPosition) {
          console.log('🎯 开始拖拽角色:', character.name)
          
          // 禁用视角控制
          if (onControlsEnabledChange) {
            onControlsEnabledChange(false)
          }
          
          if (onDragStatusChange) {
            onDragStatusChange(`拖拽中: ${character.name}`)
          }

          newState.dragState = {
            isDragging: true,
            draggedIndex: prev.longPressIndex,
            dragStartTime: currentTime,
            dragStartMouse: prev.dragState.dragStartMouse,
            dragStartPosition: startPosition,
            dragCurrentPosition: startPosition.clone()
          }
          newState.longPressIndex = null
        }
      }

      // 处理拖拽移动
      if (prev.dragState.isDragging && camera && prev.dragState.dragStartPosition && gl.domElement) {
        try {
          const currentMouse = new Vector2(event.clientX, event.clientY)
          const startMouse = prev.dragState.dragStartMouse
          const startPos = prev.dragState.dragStartPosition

          console.log(`🎯 拖拽计算输入:`, {
            character: characters[prev.dragState.draggedIndex]?.name,
            startMouse: [startMouse.x, startMouse.y],
            currentMouse: [currentMouse.x, currentMouse.y],
            startPos: startPos.toArray().map(v => v.toFixed(2)),
            cameraPos: camera.position.toArray().map(v => v.toFixed(2))
          })

          const newPosition = calculateDragPositionByRayProjection(
            camera,
            gl.domElement,
            startMouse,
            currentMouse,
            startPos
          )

          // 验证新位置是否有效
          if (!newPosition || isNaN(newPosition.x) || isNaN(newPosition.y) || isNaN(newPosition.z)) {
            console.warn('⚠️ 计算出的位置无效，跳过更新')
            return newState
          }

          // 限制拖拽范围
          const maxDistance = 100
          const centerDistance = newPosition.length()
          if (centerDistance > maxDistance) {
            newPosition.normalize().multiplyScalar(maxDistance)
          }

          newState.dragState.dragCurrentPosition = newPosition

          // 通知父组件位置更新
          if (onCharacterPositionUpdate) {
            onCharacterPositionUpdate(prev.dragState.draggedIndex, newPosition)
          }

          console.log(`✅ 拖拽更新成功:`, {
            character: characters[prev.dragState.draggedIndex]?.name,
            newPos: newPosition.toArray().map(v => v.toFixed(2)),
            distance: startPos.distanceTo(newPosition).toFixed(2)
          })
        } catch (error) {
          console.error('❌ 拖拽位置计算失败:', error)
          // 发生错误时停止拖拽
          if (onDragStatusChange) {
            onDragStatusChange('拖拽错误，已停止')
          }
          if (onControlsEnabledChange) {
            onControlsEnabledChange(true)
          }
          newState.dragState.isDragging = false
        }
      } else {
        // 正常的悬浮检测
        const hitIndex = performRaycast()
        newState.hoveredIndex = hitIndex
        newState.hoveredCharacter = hitIndex !== null ? characters[hitIndex] : null
      }

      return newState
    })
  }, [updateMousePosition, performRaycast, camera, characters, getCharacterPosition, onCharacterPositionUpdate, onControlsEnabledChange, onDragStatusChange, gl.domElement])

  /**
   * 处理指针释放事件
   */
  const handlePointerUp = useCallback(() => {
    setInteractionState(prev => {
      if (prev.dragState.isDragging) {
        console.log('🎯 结束拖拽')
        
        // 重新启用视角控制
        if (onControlsEnabledChange) {
          onControlsEnabledChange(true)
        }
        
        if (onDragStatusChange) {
          onDragStatusChange('拖拽结束')
        }
      }

      return {
        ...prev,
        longPressIndex: null,
        dragState: {
          isDragging: false,
          draggedIndex: -1,
          dragStartTime: 0,
          dragStartMouse: new Vector2(),
          dragStartPosition: new Vector3(),
          dragCurrentPosition: null
        }
      }
    })
  }, [onControlsEnabledChange, onDragStatusChange])

  /**
   * 绑定鼠标事件
   */
  const bindMouseEvents = useCallback(() => {
    if (!gl.domElement) {
      console.warn('⚠️ gl.domElement 不可用，无法绑定鼠标事件')
      return () => {}
    }

    console.log('🖱️ 绑定星谱拖拽事件到canvas')
    gl.domElement.addEventListener('pointerdown', handlePointerDown)
    gl.domElement.addEventListener('pointermove', handlePointerMove)
    gl.domElement.addEventListener('pointerup', handlePointerUp)
    gl.domElement.addEventListener('pointercancel', handlePointerUp)

    return () => {
      console.log('🖱️ 清理星谱拖拽事件')
      gl.domElement.removeEventListener('pointerdown', handlePointerDown)
      gl.domElement.removeEventListener('pointermove', handlePointerMove)
      gl.domElement.removeEventListener('pointerup', handlePointerUp)
      gl.domElement.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [gl.domElement, handlePointerDown, handlePointerMove, handlePointerUp])

  return {
    interactionState,
    bindMouseEvents,
    getCharacterPosition,
    resetTemporaryPositions,
    isHovered: (index: number) => interactionState.hoveredIndex === index,
    isDragging: () => interactionState.dragState.isDragging,
    isLongPressing: (index: number) => interactionState.longPressIndex === index
  }
}
