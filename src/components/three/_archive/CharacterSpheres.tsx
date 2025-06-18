import React, { useRef, useMemo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { useCharacterInteraction } from '@/hooks/useCharacterInteraction'
import { useRenderMonitor, useRenderErrorDetection } from '@/hooks/useRenderMonitor'
import { SafeCharacterHighlightWrapper as CharacterHighlight } from './SafeCharacterHighlight'
import { CharacterInfoCard } from '@/components/ui/CharacterInfoCard'
import { DataApi } from '@/services/dataApi'

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
  isAlias?: boolean
  originalCharacter?: string
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
  showAliases?: boolean
  aliasOpacity?: number
  aliasSize?: number
}

export const CharacterSpheres: React.FC<CharacterSpheresProps> = ({
  visible = true,
  opacity = 1.0,
  globalSize = 0.6,
  emissiveIntensity = 0.7,
  metalness = 0.1,
  roughness = 0.3,
  animationSpeed = 1.0,
  floatAmplitude = 0.1,
  radiusMultiplier = 1.0,
  heightMultiplier = 1.0,
  randomSpread = 2.0,
  colorIntensity = 1.0,
  useOriginalColors = true,
  regeneratePositions = false,
  showAliases = true,
  aliasOpacity = 0.7,
  aliasSize = 0.8
}) => {
  const meshRef = useRef<InstancedMesh>(null)
  const { galaxyConfig, isAnimating } = useGalaxyStore()
  const tempObject = useMemo(() => new Object3D(), [])
  const tempColor = useMemo(() => new Color(), [])

  // 角色数据状态
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [aliases, setAliases] = useState<CharacterData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 合并角色和别名数据用于渲染
  const allCharacters = useMemo(() => {
    const result = [...characters]
    if (showAliases) {
      result.push(...aliases)
    }
    return result
  }, [characters, aliases, showAliases])

  // 🚨 紧急修复：暂时禁用鼠标交互功能
  // const { interactionState, bindMouseEvents } = useCharacterInteraction(allCharacters, meshRef)

  // 渲染性能监控
  const { hasRenderIssues, currentFps } = useRenderMonitor(true)
  const { hasFrequentErrors } = useRenderErrorDetection()

  // 临时的空交互状态
  const interactionState = {
    hoveredIndex: null,
    hoveredCharacter: null,
    mousePosition: { x: 0, y: 0 },
    worldPosition: null
  }
  const bindMouseEvents = () => () => {}

  /**
   * 从后端API加载完整数据（角色+别名）
   */
  const loadCharacterData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 使用DataApi服务加载完整数据（自动端口检测）
      const data = await DataApi.getCompleteData()
      const { characters: loadedCharacters, aliases: loadedAliases } = data

      // 处理角色数据
      const charactersWithPositions = loadedCharacters.map((char: any) => ({
        ...char,
        position: generateCharacterPosition(char),
        isAlias: false
      }))

      // 处理别名数据
      const aliasesWithPositions = loadedAliases.map((alias: any) => ({
        ...alias,
        position: generateAliasPosition(alias),
        isAlias: true
      }))

      setCharacters(charactersWithPositions)
      setAliases(aliasesWithPositions)

      console.log(`✅ 成功加载 ${charactersWithPositions.length} 个角色数据`)
      console.log(`✅ 成功加载 ${aliasesWithPositions.length} 个别名数据`)

      // 调试：输出前几个角色的位置信息
      charactersWithPositions.slice(0, 3).forEach((char: any, i: number) => {
        console.log(`角色${i+1} ${char.name}: 位置(${char.position.x.toFixed(2)}, ${char.position.y.toFixed(2)}, ${char.position.z.toFixed(2)})`)
      })

      // 调试：输出前几个别名的位置信息
      aliasesWithPositions.slice(0, 3).forEach((alias: any, i: number) => {
        console.log(`别名${i+1} ${alias.name}: 位置(${alias.position.x.toFixed(2)}, ${alias.position.y.toFixed(2)}, ${alias.position.z.toFixed(2)})`)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
      console.error('❌ 数据加载失败:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 为别名生成3D位置
   * 使用更分散的分布算法避免与主角色重叠
   */
  const generateAliasPosition = (alias: any): Vector3 => {
    const { rank, power, influence, category } = alias

    // 别名使用更大的分布半径，避免与主角色重叠
    const normalizedRank = Math.max(0, Math.min(1, (150 - rank) / 150))
    const baseRadius = galaxyConfig.galaxyRadius * (0.6 + normalizedRank * 0.8) * radiusMultiplier

    // 别名使用不同的角度偏移，形成外围分布
    const categoryAngles = {
      'protagonist': Math.PI / 6,      // 主角团队别名在外围
      'deity': Math.PI * 2 / 3 + Math.PI / 6,
      'demon': Math.PI * 4 / 3 + Math.PI / 6,
      'dragon': Math.PI / 2 + Math.PI / 6,
      'buddhist': Math.PI + Math.PI / 6,
      'celestial': Math.PI / 4 + Math.PI / 6,
      'underworld': Math.PI * 3 / 2 + Math.PI / 6,
      'human': Math.PI * 5 / 4 + Math.PI / 6
    }

    const baseAngle = categoryAngles[category as keyof typeof categoryAngles] || Math.PI / 6

    // 别名使用更大的随机偏移
    const angleOffset = (Math.random() - 0.5) * (influence / 100) * Math.PI / 2
    const angle = baseAngle + angleOffset

    // 计算螺旋臂位置
    const armAngle = angle + baseRadius * galaxyConfig.armTightness / galaxyConfig.galaxyRadius

    // 别名的高度分布更分散
    const height = (power - 50) / 50 * 4 * heightMultiplier

    // 别名使用更大的随机性
    const radiusVariation = (Math.random() - 0.5) * randomSpread * 1.5
    const finalRadius = baseRadius + radiusVariation

    return new Vector3(
      Math.cos(armAngle) * finalRadius,
      height + (Math.random() - 0.5) * 1.0, // 更大的高度随机
      Math.sin(armAngle) * finalRadius
    )
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
    if (!meshRef.current || allCharacters.length === 0) return

    allCharacters.forEach((character, i) => {
      if (!character.position) return

      // 根据是否为别名调整大小
      const sizeMultiplier = character.isAlias ? aliasSize : 1.0

      // 设置位置和缩放，应用全局大小倍数
      tempObject.position.copy(character.position)
      tempObject.scale.setScalar(character.visual.size * globalSize * sizeMultiplier * 1.5) // 适中的尺寸
      tempObject.updateMatrix()

      // 应用变换矩阵
      meshRef.current!.setMatrixAt(i, tempObject.matrix)

      // 设置颜色，支持颜色强度和原始颜色控制
      // 配合材质的白色发光效果，让颜色更亮来模拟发光颜色一致
      if (useOriginalColors) {
        tempColor.set(character.visual.color)
        // 增加颜色亮度来配合发光效果，让发光看起来像是角色的颜色
        const brightnessBoost = 1 + emissiveIntensity * 0.8
        tempColor.multiplyScalar(colorIntensity * brightnessBoost)
      } else {
        // 使用统一的白色
        tempColor.set('#ffffff')
        tempColor.multiplyScalar(colorIntensity)
      }

      // 根据是否为别名调整透明度
      const finalOpacity = character.isAlias ? aliasOpacity : opacity
      tempColor.multiplyScalar(finalOpacity)
      meshRef.current!.setColorAt(i, tempColor)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }

  // 组件挂载时加载数据和绑定鼠标事件
  useEffect(() => {
    loadCharacterData()
    const cleanup = bindMouseEvents()
    return cleanup
  }, [bindMouseEvents])

  // 当角色数据或配置变化时更新渲染
  useEffect(() => {
    updateInstancedMesh()
  }, [allCharacters, opacity, globalSize, emissiveIntensity, colorIntensity, useOriginalColors, galaxyConfig, aliasOpacity, aliasSize])

  // 当分布参数变化时重新生成位置
  useEffect(() => {
    if (characters.length > 0) {
      const updatedCharacters = characters.map(char => ({
        ...char,
        position: generateCharacterPosition(char)
      }))
      setCharacters(updatedCharacters)
    }

    if (aliases.length > 0) {
      const updatedAliases = aliases.map(alias => ({
        ...alias,
        position: generateAliasPosition(alias)
      }))
      setAliases(updatedAliases)
    }
  }, [radiusMultiplier, heightMultiplier, randomSpread, regeneratePositions])

  // 当动画参数变化时，不需要重新生成位置，只需要在动画循环中应用

  // 动画循环 - 支持可控制的浮动效果
  useFrame((state) => {
    if (!meshRef.current || !isAnimating || allCharacters.length === 0) return

    // 可控制的上下浮动效果
    const time = state.clock.elapsedTime
    allCharacters.forEach((character, i) => {
      if (!character.position) return

      // 根据是否为别名调整大小
      const sizeMultiplier = character.isAlias ? aliasSize : 1.0

      tempObject.position.copy(character.position)
      // 应用动画速度和浮动幅度控制
      tempObject.position.y += Math.sin(time * animationSpeed * 0.5 + i * 0.1) * floatAmplitude
      tempObject.scale.setScalar(character.visual.size * globalSize * sizeMultiplier * 0.8)
      tempObject.updateMatrix()

      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // 如果不可见或没有数据，不渲染
  if (!visible || allCharacters.length === 0) return null

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, allCharacters.length]}
        frustumCulled={true}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          metalness={metalness}
          roughness={roughness}
          emissive="#ffffff"
          emissiveIntensity={emissiveIntensity}
          transparent={opacity < 1 || aliasOpacity < 1}
          opacity={opacity}
        />
      </instancedMesh>

      {/* 🚨 紧急修复：暂时禁用所有交互效果 */}
      {/* 悬浮高亮效果 - 已禁用 */}
      {false && interactionState.hoveredCharacter &&
       interactionState.worldPosition &&
       !hasRenderIssues() &&
       !hasFrequentErrors && (
        <CharacterHighlight
          position={interactionState.worldPosition}
          size={1}
          color="#ffffff"
          visible={true}
        />
      )}

      {/* 信息卡片 - 已禁用 */}
      {false && interactionState.hoveredCharacter && createPortal(
        <div>Disabled</div>,
        document.body
      )}

      {/* 调试信息 */}
      {loading && console.log('🔄 正在加载数据...')}
      {error && console.error('❌ 数据加载错误:', error)}
      {allCharacters.length > 0 && console.log(`✨ 渲染 ${characters.length} 个角色 + ${aliases.length} 个别名 = ${allCharacters.length} 个球体`)}
      {hasRenderIssues() && console.warn(`⚠️ 渲染性能问题: ${currentFps} FPS`)}
      {hasFrequentErrors && console.error('🚨 检测到频繁渲染错误，高亮效果已禁用')}
    </>
  )
}
