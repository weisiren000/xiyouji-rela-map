import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { useGalaxyStore } from '@stores/useGalaxyStore'

/**
 * 西游记角色数据点组件
 * 在现有银河系中添加真实角色数据，不影响原有星球系统
 */

interface CharacterData {
  id: string
  name: string
  pinyin: string
  type: string
  category: string
  faction: string
  rank: number
  power: number
  influence: number
  visual: {
    color: string
    size: number
    emissiveIntensity: number
  }
  position?: Vector3
}

interface CharacterSpheresProps {
  visible?: boolean
  opacity?: number
  globalSize?: number
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
  animationSpeed?: number
  floatAmplitude?: number
  radiusMultiplier?: number
  heightMultiplier?: number
  randomSpread?: number
  colorIntensity?: number
  useOriginalColors?: boolean
  regeneratePositions?: boolean
}

export const CharacterSpheres: React.FC<CharacterSpheresProps> = ({
  visible = true,
  opacity = 1.0,
  globalSize = 1.0,
  emissiveIntensity = 0.3,
  metalness = 0.1,
  roughness = 0.3,
  animationSpeed = 1.0,
  floatAmplitude = 0.1,
  radiusMultiplier = 1.0,
  heightMultiplier = 1.0,
  randomSpread = 2.0,
  colorIntensity = 1.0,
  useOriginalColors = true,
  regeneratePositions = false
}) => {
  const meshRef = useRef<InstancedMesh>(null)
  const { galaxyConfig, isAnimating } = useGalaxyStore()
  const tempObject = useMemo(() => new Object3D(), [])
  const tempColor = useMemo(() => new Color(), [])


  
  // 角色数据状态
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 从后端API加载角色数据
   */
  const loadCharacterData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:3002/api/characters')
      const result = await response.json()
      
      if (result.success) {
        const charactersWithPositions = result.data.map((char: any) => ({
          ...char,
          position: generateCharacterPosition(char)
        }))
        
        setCharacters(charactersWithPositions)
        console.log(`✅ 成功加载 ${charactersWithPositions.length} 个角色数据`)
        // 调试：输出前几个角色的位置信息
        charactersWithPositions.slice(0, 5).forEach((char: any, i: number) => {
          console.log(`角色${i+1} ${char.name}: 位置(${char.position.x.toFixed(2)}, ${char.position.y.toFixed(2)}, ${char.position.z.toFixed(2)})`)
        })
      } else {
        throw new Error(result.error || '加载角色数据失败')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
      console.error('❌ 加载角色数据失败:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 为角色生成3D位置
   * 基于角色属性在银河系中分布，支持控制参数调整
   */
  const generateCharacterPosition = (character: any): Vector3 => {
    const { rank, power, influence, category } = character

    // 基于排名决定距离中心的远近 (排名越高越靠近中心)
    const normalizedRank = Math.max(0, Math.min(1, (150 - rank) / 150))
    const baseRadius = galaxyConfig.galaxyRadius * (0.2 + normalizedRank * 0.6) * radiusMultiplier

    // 基于类别决定螺旋臂位置
    const categoryAngles = {
      'protagonist': 0,           // 主角团队在第一条臂
      'deity': Math.PI * 2 / 3,   // 神仙在第二条臂
      'demon': Math.PI * 4 / 3,   // 妖魔在第三条臂
      'dragon': Math.PI / 2,      // 龙族在中间位置
      'buddhist': Math.PI,        // 佛教在对面
      'celestial': Math.PI / 4,   // 天庭在其他位置
      'underworld': Math.PI * 3 / 2, // 地府在底部
      'human': Math.PI * 5 / 4    // 人类在其他位置
    }

    const baseAngle = categoryAngles[category as keyof typeof categoryAngles] || 0

    // 添加基于影响力的随机偏移
    const angleOffset = (Math.random() - 0.5) * (influence / 100) * Math.PI / 4
    const angle = baseAngle + angleOffset

    // 计算螺旋臂位置
    const armAngle = angle + baseRadius * galaxyConfig.armTightness / galaxyConfig.galaxyRadius

    // 基于能力值决定高度，应用高度倍数
    const height = (power - 50) / 50 * 3 * heightMultiplier

    // 添加可控制的随机性避免重叠
    const radiusVariation = (Math.random() - 0.5) * randomSpread
    const finalRadius = baseRadius + radiusVariation

    return new Vector3(
      Math.cos(armAngle) * finalRadius,
      height + (Math.random() - 0.5) * 0.5, // 轻微的高度随机
      Math.sin(armAngle) * finalRadius
    )
  }

  /**
   * 更新InstancedMesh，支持所有渲染参数
   */
  const updateInstancedMesh = () => {
    if (!meshRef.current || characters.length === 0) return

    characters.forEach((character, i) => {
      if (!character.position) return

      // 设置位置和缩放，应用全局大小倍数
      tempObject.position.copy(character.position)
      tempObject.scale.setScalar(character.visual.size * globalSize * 1.5) // 适中的尺寸
      tempObject.updateMatrix()

      // 应用变换矩阵
      meshRef.current!.setMatrixAt(i, tempObject.matrix)

      // 设置颜色，支持颜色强度和原始颜色控制
      if (useOriginalColors) {
        tempColor.set(character.visual.color)
        tempColor.multiplyScalar(colorIntensity)
      } else {
        // 使用统一的白色，通过发光强度控制亮度
        tempColor.set('#ffffff')
        tempColor.multiplyScalar(colorIntensity * 0.5)
      }

      // 应用透明度
      tempColor.multiplyScalar(opacity)
      meshRef.current!.setColorAt(i, tempColor)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadCharacterData()
  }, [])

  // 当角色数据或配置变化时更新渲染
  useEffect(() => {
    updateInstancedMesh()
  }, [characters, opacity, globalSize, colorIntensity, useOriginalColors, galaxyConfig])

  // 当分布参数变化时重新生成位置
  useEffect(() => {
    if (characters.length > 0) {
      const updatedCharacters = characters.map(char => ({
        ...char,
        position: generateCharacterPosition(char)
      }))
      setCharacters(updatedCharacters)
    }
  }, [radiusMultiplier, heightMultiplier, randomSpread, regeneratePositions])

  // 当动画参数变化时，不需要重新生成位置，只需要在动画循环中应用

  // 动画循环 - 支持可控制的浮动效果
  useFrame((state) => {
    if (!meshRef.current || !isAnimating || characters.length === 0) return

    // 可控制的上下浮动效果
    const time = state.clock.elapsedTime
    characters.forEach((character, i) => {
      if (!character.position) return

      tempObject.position.copy(character.position)
      // 应用动画速度和浮动幅度控制
      tempObject.position.y += Math.sin(time * animationSpeed * 0.5 + i * 0.1) * floatAmplitude
      tempObject.scale.setScalar(character.visual.size * globalSize * 0.8)
      tempObject.updateMatrix()

      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // 如果不可见或没有数据，不渲染
  if (!visible || characters.length === 0) return null

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, characters.length]}
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

      {/* 调试信息 */}
      {loading && console.log('🔄 正在加载角色数据...')}
      {error && console.error('❌ 角色数据加载错误:', error)}
      {characters.length > 0 && console.log(`✨ 渲染 ${characters.length} 个角色球体`)}
    </>
  )
}
