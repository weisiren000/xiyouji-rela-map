import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { InstancedMesh, Object3D, MeshStandardMaterial, SphereGeometry, Raycaster, Vector2, Mesh } from 'three'
import { JourneyPoint } from '@utils/three/journeyGenerator'
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { useCharacterInfoStore } from '@stores/useCharacterInfoStore'
import { CharacterType } from '@/types/character'

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
 * 显示九九八十一难的3D可视化，包含完整的交互功能
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
  const pulseShellRef = useRef<Mesh>(null)
  const outerShellRef = useRef<Mesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])
  const startTime = useRef(Date.now())
  
  // 交互状态
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<JourneyPoint | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<JourneyPoint | null>(null)
  
  // 射线检测相关
  const raycaster = useMemo(() => new Raycaster(), [])
  const mouse = useMemo(() => new Vector2(), [])
  
  // Three.js 相关对象
  const { camera, gl } = useThree()
  
  // 状态管理
  const { setAnimating } = useGalaxyStore()
  const { setHoveredCharacter, setShowInfoCard } = useCharacterInfoStore()
  
  // 创建基础材质
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: '#ffd700',
      emissive: '#ff6600',
      emissiveIntensity,
      metalness,
      roughness,
      transparent: true,
      opacity,
    })
  }, [emissiveIntensity, metalness, roughness, opacity])

  // 创建脉冲外壳材质
  const pulseShellMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: '#ffaa00',
      emissive: '#ff4400',
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.3,
      transparent: true,
      opacity: 0.4,
    })
  }, [])

  const outerShellMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: '#ff8800',
      emissive: '#ff2200',
      emissiveIntensity: 1.2,
      metalness: 0.05,
      roughness: 0.2,
      transparent: true,
      opacity: 0.2,
    })
  }, [])

  // 更新鼠标位置
  const updateMousePosition = (event: MouseEvent | PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    mouse.x = (x / rect.width) * 2 - 1
    mouse.y = -(y / rect.height) * 2 + 1
  }

  // 处理鼠标移动 - 悬浮检测
  const handlePointerMove = (event: PointerEvent) => {
    if (event.buttons > 0 || !meshRef.current || points.length === 0) return
    
    updateMousePosition(event)
    raycaster.setFromCamera(mouse, camera)
    
    const intersects = raycaster.intersectObject(meshRef.current)
    
    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId
      if (instanceId !== undefined && instanceId !== hoveredIndex) {
        const point = points[instanceId]
        setHoveredIndex(instanceId)
        setHoveredPoint(point)
        
        // 设置角色信息用于显示悬浮卡片
        if (point.eventData) {
          setHoveredCharacter({
            id: `journey-${point.index}`,
            name: point.eventData.nanming,
            pinyin: '',
            aliases: [],
            type: CharacterType.EVENT,
            faction: '取经路径',
            rank: point.index + 1,
            level: {
              id: `difficulty-${point.index}`,
              name: `第${point.index + 1}难`,
              tier: point.index + 1
            },
            description: point.eventData.shijianmiaoshu,
            visual: {
              color: '#ffd700',
              size: point.radius,
              emissiveIntensity: 0.8,
            },
            metadata: {
              source: 'events.db',
              lastModified: new Date().toISOString(),
              tags: ['九九八十一难', point.eventData.didian, point.eventData.xiangzhengyi],
              verified: true,
            },
            // 扩展事件数据
            eventInfo: {
              nanci: point.eventData.nanci,
              zhuyaorenwu: point.eventData.zhuyaorenwu,
              didian: point.eventData.didian,
              xiangzhengyi: point.eventData.xiangzhengyi,
              wenhuaneihan: point.eventData.wenhuaneihan,
            }
          } as any)
          setShowInfoCard(true)
        }
        
        gl.domElement.style.cursor = 'pointer'
      }
    } else if (hoveredIndex !== null) {
      setHoveredIndex(null)
      setHoveredPoint(null)
      setHoveredCharacter(null)
      setShowInfoCard(false)
      gl.domElement.style.cursor = 'default'
    }
  }

  // 处理点击 - 选中事件
  const handlePointerDown = (event: PointerEvent) => {
    if (!meshRef.current || points.length === 0) return
    
    updateMousePosition(event)
    raycaster.setFromCamera(mouse, camera)
    
    const intersects = raycaster.intersectObject(meshRef.current)
    
    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId
      if (instanceId !== undefined) {
        const point = points[instanceId]
        
        if (selectedIndex === instanceId) {
          // 取消选中
          setSelectedIndex(null)
          setSelectedPoint(null)
          setAnimating(true)
        } else {
          // 选中新点
          setSelectedIndex(instanceId)
          setSelectedPoint(point)
          setAnimating(false) // 暂停银河系旋转
          
          console.log(`🎯 选中第${point.index + 1}难:`, point.eventData?.nanming || point.difficulty)
          if (point.eventData) {
            console.log('📍 地点:', point.eventData.didian)
            console.log('👥 主要人物:', point.eventData.zhuyaorenwu)
            console.log('📖 事件描述:', point.eventData.shijianmiaoshu)
          }
        }
      }
    }
  }

  // 绑定事件监听器
  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerdown', handlePointerDown)
    
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [hoveredIndex, selectedIndex, points])

  // 更新实例矩阵
  useEffect(() => {
    if (!meshRef.current || points.length === 0) return

    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      
      tempObject.position.copy(point.position)
      tempObject.scale.setScalar(point.radius * globalSize)
      tempObject.updateMatrix()
      
      meshRef.current.setMatrixAt(i, tempObject.matrix)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [points, globalSize, tempObject])

  // 更新脉冲外壳位置
  useEffect(() => {
    if (hoveredPoint && pulseShellRef.current) {
      pulseShellRef.current.position.copy(hoveredPoint.position)
      pulseShellRef.current.visible = true
    } else if (pulseShellRef.current) {
      pulseShellRef.current.visible = false
    }

    if (selectedPoint && outerShellRef.current) {
      outerShellRef.current.position.copy(selectedPoint.position)
      outerShellRef.current.visible = true
    } else if (outerShellRef.current) {
      outerShellRef.current.visible = false
    }
  }, [hoveredPoint, selectedPoint])

  // 动画循环
  useFrame(() => {
    if (!meshRef.current || !visible) return

    const elapsed = (Date.now() - startTime.current) * 0.001 * animationSpeed
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      
      // 浮动动画
      const floatY = Math.sin(elapsed + i * 0.1) * 0.1
      tempObject.position.copy(point.position)
      tempObject.position.y += floatY
      
      // 脉冲大小变化
      let pulseScale = 1 + Math.sin(elapsed * 2 + i * 0.2) * 0.1
      
      // 悬浮和选中状态的特殊效果
      if (i === hoveredIndex) {
        pulseScale *= 1.3 // 悬浮时放大
      }
      if (i === selectedIndex) {
        pulseScale *= 1.5 // 选中时更大
      }
      
      tempObject.scale.setScalar(point.radius * globalSize * pulseScale)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true

    // 脉冲外壳动画
    if (pulseShellRef.current && pulseShellRef.current.visible) {
      const pulseScale = 1.5 + Math.sin(elapsed * 4) * 0.3
      pulseShellRef.current.scale.setScalar(pulseScale)
    }

    if (outerShellRef.current && outerShellRef.current.visible) {
      const outerScale = 2.0 + Math.sin(elapsed * 2) * 0.5
      outerShellRef.current.scale.setScalar(outerScale)
    }
  })

  if (!visible || points.length === 0) return null

  return (
    <group>
      {/* 主要的实例化球体 */}
      <instancedMesh 
        ref={meshRef} 
        args={[new SphereGeometry(1, 16, 12), material, points.length]}
      />
      
      {/* 悬浮时的脉冲外壳 */}
      <mesh 
        ref={pulseShellRef}
        visible={false}
      >
        <sphereGeometry args={[1.2, 16, 12]} />
        <primitive object={pulseShellMaterial} />
      </mesh>
      
      {/* 选中时的外层光环 */}
      <mesh 
        ref={outerShellRef}
        visible={false}
      >
        <sphereGeometry args={[1.5, 16, 12]} />
        <primitive object={outerShellMaterial} />
      </mesh>
    </group>
  )
}
