import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3, Raycaster, Mesh, MeshBasicMaterial, SphereGeometry, Matrix4, Vector2 } from 'three'
import { JourneyPoint } from '@utils/three/journeyGenerator'
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { useEventInfoStore } from '@stores/useEventInfoStore'

interface JourneyPointsProps {
  points: JourneyPoint[]
  globalSize?: number
  opacity?: number
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
  animationSpeed?: number
  visible?: boolean
}

/**
 * 西游记取经路径点渲染组件
 * 使用InstancedMesh优化性能，支持81个点的高效渲染
 * 添加射线命中时的脉冲选中效果
 * 选中点时暂停银河系旋转
 */
export const JourneyPoints: React.FC<JourneyPointsProps> = ({
  points,
  globalSize = 1.0,
  opacity = 1.0,
  emissiveIntensity = 0.6,
  metalness = 0.2,
  roughness = 0.4,
  animationSpeed = 1.0,
  visible = true,
}) => {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])
  const startTime = useRef(Date.now())
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  // 脉冲外壳相关引用 - 添加两层外壳效果
  const pulseShellRef = useRef<Mesh>(null)
  const outerShellRef = useRef<Mesh>(null)
  const [hoveredPoint, setHoveredPoint] = useState<JourneyPoint | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<JourneyPoint | null>(null)
  
  // 射线检测相关
  const raycaster = useMemo(() => new Raycaster(), [])
  const mouse = useMemo(() => new Vector2(), [])
  
  // 获取Three.js相关对象
  const { camera, gl } = useThree()
  
  // 获取动画配置参数和控制方法
  const { journeyConfig, setAnimating } = useGalaxyStore()
  
  // 获取事件信息状态
  const { setHoveredEvent, setShowInfoCard, setMousePosition } = useEventInfoStore()

  // 更新鼠标位置的辅助函数 - 直接从select.html复制
  const updateMousePosition = (event: MouseEvent | PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    mouse.x = (x / rect.width) * 2 - 1
    mouse.y = -(y / rect.height) * 2 + 1

    // 同时更新事件信息store的鼠标位置
    setMousePosition(new Vector2(event.clientX, event.clientY))
  }

  // 处理鼠标移动 - 完全重新实现
  const handlePointerMove = (event: PointerEvent) => {
    // 如果有鼠标按钮被按下，不处理悬停
    if (event.buttons > 0) return
    
    // 如果没有实例网格或没有点，不处理
    if (!meshRef.current || points.length === 0) return
    
    // 更新鼠标位置
    updateMousePosition(event)
    
    // 设置射线
    raycaster.setFromCamera(mouse, camera)
    
    // 执行射线检测
    const intersects = raycaster.intersectObject(meshRef.current)
    
    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId
      
      if (instanceId !== undefined) {
        // 如果悬停的点不是当前选中的点，才显示悬停效果
        if (instanceId !== selectedIndex) {
          handlePointHover(instanceId)
        }
      }
    } else {
      // 如果没有相交，清除悬停状态
      if (hoveredIndex !== null && hoveredIndex !== selectedIndex) {
        clearHover()
      }
    }
  }
  
  // 处理点悬停
  const handlePointHover = (index: number) => {
    // 如果已经有选中的点，不改变悬停状态
    if (selectedIndex !== null) return

    setHoveredIndex(index)
    setHoveredPoint(points[index])

    // 当选中点时，暂停银河系旋转
    setAnimating(false)

    // 获取对应的事件数据
    const journeyPoint = points[index]
    if (journeyPoint.eventData) {
      // 如果有真实的事件数据，使用它
      setHoveredEvent(journeyPoint.eventData)
    } else {
      // 如果没有事件数据，创建一个临时的事件对象
      const tempEvent = {
        id: index + 1,
        nanci: index + 1,
        nanming: journeyPoint.difficulty || `第${index + 1}难`,
        zhuyaorenwu: '唐僧师徒',
        didian: '取经路上',
        shijianmiaoshu: `西游记第${index + 1}难的相关事件`,
        xiangzhengyi: '修行路上的考验与磨砺',
        wenhuaneihan: '体现了佛教文化中的修行理念',
        metadata: {
          source: '西游记',
          lastModified: new Date().toISOString(),
          verified: false
        }
      }
      setHoveredEvent(tempEvent)
    }

    setShowInfoCard(true)
  }
  
  // 处理点击选择 - 完全重新实现
  const handlePointerDown = (event: PointerEvent) => {
    // 更新鼠标位置
    updateMousePosition(event)
    
    // 设置射线
    raycaster.setFromCamera(mouse, camera)
    
    // 如果没有实例网格，不处理
    if (!meshRef.current) return
    
    // 执行射线检测
    const intersects = raycaster.intersectObject(meshRef.current)
    
    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId
      
      if (instanceId !== undefined) {
        // 如果点击的是当前选中的点，取消选择
        if (instanceId === selectedIndex) {
          setSelectedIndex(null)
          setSelectedPoint(null)
          setAnimating(true) // 恢复银河系旋转
        } else {
          // 否则选择新的点
          setSelectedIndex(instanceId)
          setSelectedPoint(points[instanceId])
          setAnimating(false) // 暂停银河系旋转
          
          // 创建一个简化的角色信息对象
          const journeyPoint = points[instanceId]
          const characterInfo: SimpleCharacterInfo = {
            id: journeyPoint.id || `journey-point-${instanceId}`,
            name: journeyPoint.difficulty || `第${instanceId + 1}难`,
            type: CharacterType.BUDDHIST,
            faction: '取经路上',
            rank: instanceId + 1,
            description: `西游记第${instanceId + 1}难: ${journeyPoint.difficulty || ''}`,
            visual: {
              color: journeyPoint.color,
              size: journeyPoint.radius,
              emissiveIntensity: journeyPoint.emissiveIntensity || 1.0
            },
            metadata: {
              source: '西游记',
              lastModified: new Date().toISOString(),
              tags: ['取经', '九九八十一难'],
              verified: true
            }
          }
          
          // 将简化的角色信息传递给store
          setHoveredCharacter(characterInfo as any)
          setShowInfoCard(true)
          
          // 清除悬停状态
          setHoveredIndex(null)
          setHoveredPoint(null)
        }
      }
    } else {
      // 如果点击了背景，取消选择
      setSelectedIndex(null)
      setSelectedPoint(null)
      
      // 如果没有悬停的点，清除信息卡片并恢复旋转
      if (hoveredIndex === null) {
        setShowInfoCard(false)
        setAnimating(true)
      }
    }
  }
  
  // 清除悬停状态
  const clearHover = () => {
    // 如果有选中的点，不清除信息卡片
    if (selectedIndex !== null) return

    setHoveredIndex(null)
    setHoveredPoint(null)
    setHoveredEvent(null)
    setShowInfoCard(false)

    // 当取消选中点时，恢复银河系旋转
    setAnimating(true)
  }

  // 添加事件监听器
  useEffect(() => {
    const canvas = gl.domElement
    
    // 添加事件监听器 - 完全按照select.html实现
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerdown', handlePointerDown)
    
    return () => {
      // 移除事件监听器
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [camera, gl, points, setAnimating, setShowInfoCard, setHoveredEvent, hoveredIndex, selectedIndex])

  // 动画更新
  useFrame(() => {
    if (!meshRef.current || points.length === 0 || !visible) return

    const currentTime = Date.now()
    const deltaTime = currentTime - startTime.current
    
    // 不再在useFrame中处理射线检测，完全由事件监听器处理

    points.forEach((point, i) => {
      // 浮动效果 - 使用配置的浮动幅度
      const floatOffset = Math.sin(deltaTime * 0.001 * animationSpeed + point.userData.spiralAngle) * journeyConfig.floatAmplitude

      // 更新位置
      tempObject.position.copy(point.position)
      tempObject.position.y += floatOffset

      // 脉冲效果 - 仅对非悬停和非选中点应用
      let pulseScale = 1.0
      if (i !== selectedIndex && i !== hoveredIndex) {
        // 只有非选中点和非悬浮点才应用脉冲效果
        pulseScale = 1 + Math.sin(deltaTime * 0.002 * animationSpeed + point.userData.progressRatio * Math.PI) * journeyConfig.pulseIntensity
      }

      // 大小变化 - 添加更复杂的大小变化，但仅对非悬停和非选中点
      let sizeVariation = 1.0
      if (i !== selectedIndex && i !== hoveredIndex) {
        // 只有非选中点和非悬浮点才应用大小变化
        sizeVariation = 1 + (
          Math.sin(deltaTime * 0.0015 * animationSpeed + point.userData.spiralAngle * 2) * 0.3 +
          Math.cos(deltaTime * 0.001 * animationSpeed + point.userData.progressRatio * Math.PI * 3) * 0.2
        ) * journeyConfig.sizeVariation
      }

      // 如果是被悬停或选中的点，增加其大小但不脉冲
      if (i === hoveredIndex) {
        // 悬浮点使用固定放大倍数，不再有动画变化
        sizeVariation = 1.5
      } else if (i === selectedIndex) {
        // 选中点使用固定放大倍数，不再有动画变化
        sizeVariation = 1.8
      }

      const finalScale = point.radius * globalSize * pulseScale * sizeVariation
      tempObject.scale.setScalar(finalScale)

      tempObject.updateMatrix()
      
      // 安全地设置矩阵和颜色
      if (meshRef.current) {
        meshRef.current.setMatrixAt(i, tempObject.matrix)
        
        // 更新点的颜色
        if (meshRef.current.instanceColor) {
          if (i === selectedIndex) {
            // 选中的点使用白色高亮
            const highlightColor = new Color(0xffffff)
            meshRef.current.setColorAt(i, highlightColor)
          } else if (i === hoveredIndex) {
            // 悬停的点使用蓝色高亮
            const hoverColor = new Color(0x00aaff)
            meshRef.current.setColorAt(i, hoverColor)
          } else {
            // 恢复原始颜色
            const originalColor = new Color(point.color)
            meshRef.current.setColorAt(i, originalColor)
          }
        }
      }
    })

    // 更新脉冲外壳效果 - 为选中或悬停的点
    const activePoint = selectedPoint || hoveredPoint
    if (activePoint) {
      // 获取当前活动点的位置
      const floatOffset = Math.sin(deltaTime * 0.001 * animationSpeed + activePoint.userData.spiralAngle) * journeyConfig.floatAmplitude;
      
      // 更新内层外壳
      if (pulseShellRef.current) {
        // 更新外壳位置
        pulseShellRef.current.position.copy(activePoint.position);
        pulseShellRef.current.position.y += floatOffset;
        
        // 脉冲外壳动画效果 - 保持脉冲动画效果
        const pulseShellScale = 1.5 + Math.sin(deltaTime * 0.004 * animationSpeed) * 0.3;
        
        const baseSize = activePoint.radius * globalSize * 1.3;
        pulseShellRef.current.scale.setScalar(baseSize * pulseShellScale);
        
        // 更新外壳透明度 - 呼吸效果
        const material = pulseShellRef.current.material as MeshBasicMaterial;
        
        // 选中的点使用白色，悬停的点使用蓝色
        if (selectedPoint) {
          material.color.set(0xffffff);
          material.opacity = 0.5 + Math.sin(deltaTime * 0.003 * animationSpeed) * 0.2;
        } else {
          material.color.set(0x00aaff);
          material.opacity = 0.4 + Math.sin(deltaTime * 0.003 * animationSpeed) * 0.2;
        }
      }
      
      // 更新外层外壳
      if (outerShellRef.current) {
        // 更新外壳位置
        outerShellRef.current.position.copy(activePoint.position);
        outerShellRef.current.position.y += floatOffset;
        
        // 外层外壳动画效果 - 保持脉冲动画效果
        const outerShellScale = 2.2 + Math.sin(deltaTime * 0.002 * animationSpeed) * 0.5;
        
        const outerBaseSize = activePoint.radius * globalSize * 1.5;
        outerShellRef.current.scale.setScalar(outerBaseSize * outerShellScale);
        
        // 更新外壳透明度 - 呼吸效果
        const material = outerShellRef.current.material as MeshBasicMaterial;
        
        // 选中的点使用白色，悬停的点使用蓝色
        if (selectedPoint) {
          material.color.set(0xffffff);
          material.opacity = 0.3 + Math.cos(deltaTime * 0.002 * animationSpeed) * 0.1;
        } else {
          material.color.set(0x00aaff);
          material.opacity = 0.2 + Math.cos(deltaTime * 0.002 * animationSpeed) * 0.1;
        }
        
        // 旋转外层外壳，增加动态效果
        outerShellRef.current.rotation.y += 0.005;
        outerShellRef.current.rotation.x += 0.002;
      }
    }

    // 确保meshRef.current存在
    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true
      }
    }
  })

  // 确保组件卸载时恢复银河系旋转
  useEffect(() => {
    return () => {
      setAnimating(true)
    }
  }, [setAnimating])

  if (points.length === 0 || !visible) return null

  return (
    <>
      {/* 主要的点实例 */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, points.length]}
        frustumCulled={true}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          metalness={metalness}
          roughness={roughness}
          emissive="#ffffff"
          emissiveIntensity={emissiveIntensity}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </instancedMesh>
      
      {/* 活动点的内层脉冲外壳效果 */}
      {(hoveredPoint || selectedPoint) && (
        <mesh
          ref={pulseShellRef}
          position={(selectedPoint || hoveredPoint)!.position.clone()}
          visible={!!(selectedPoint || hoveredPoint)}
        >
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial
            color={selectedPoint ? "#ffffff" : "#00aaff"}
            transparent={true}
            opacity={0.4}
            wireframe={false}
          />
        </mesh>
      )}
      
      {/* 活动点的外层脉冲外壳效果 */}
      {(hoveredPoint || selectedPoint) && (
        <mesh
          ref={outerShellRef}
          position={(selectedPoint || hoveredPoint)!.position.clone()}
          visible={!!(selectedPoint || hoveredPoint)}
        >
          <sphereGeometry args={[1, 20, 20]} />
          <meshBasicMaterial
            color={selectedPoint ? "#ffffff" : "#00aaff"}
            transparent={true}
            opacity={0.15}
            wireframe={false}
          />
        </mesh>
      )}
    </>
  )
}
