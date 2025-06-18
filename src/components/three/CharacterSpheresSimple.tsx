import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { DataApi } from '@/services/dataApi'
import { useCharacterInteraction } from '@/hooks/useCharacterInteraction'
import { BeautifulHighlight, MinimalHighlight, GlowRingHighlight } from './BeautifulHighlight'
import { useCharacterInfoStore } from '@/stores/useCharacterInfoStore'

/**
 * 角色数据点组件 - 使用全局状态管理
 * 功能：
 * - 3D角色球体渲染
 * - 鼠标悬浮高亮效果
 * - 交互状态同步到全局状态
 * - UI显示由App层面的组件负责
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

interface CharacterSpheresSimpleProps {
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

export const CharacterSpheresSimple: React.FC<CharacterSpheresSimpleProps> = ({
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

  // 🔍 启用鼠标交互检测
  const { interactionState, bindMouseEvents } = useCharacterInteraction(allCharacters, meshRef)

  // 🌐 全局状态管理
  const { setHoveredCharacter, setMousePosition, clearHover } = useCharacterInfoStore()

  // 正确绑定鼠标事件
  useEffect(() => {
    const cleanup = bindMouseEvents()
    return cleanup
  }, [bindMouseEvents])

  // 🔄 同步交互状态到全局状态
  useEffect(() => {
    if (interactionState.hoveredCharacter) {
      console.log('🖱️ 检测到悬浮:', interactionState.hoveredCharacter.name)
      console.log('🌐 更新全局状态')
      setHoveredCharacter(interactionState.hoveredCharacter)
      setMousePosition(interactionState.mousePosition)
    } else {
      console.log('🚫 清除悬浮状态')
      clearHover()
    }
  }, [interactionState.hoveredCharacter, interactionState.mousePosition, setHoveredCharacter, setMousePosition, clearHover])

  /**
   * 从后端API加载完整数据（角色+别名）
   */
  const loadCharacterData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 开始加载角色数据...')
      
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
   */
  const generateAliasPosition = (alias: any): Vector3 => {
    const { rank, power, influence, category } = alias

    const normalizedRank = Math.max(0, Math.min(1, (150 - rank) / 150))
    const baseRadius = galaxyConfig.galaxyRadius * (0.6 + normalizedRank * 0.8) * radiusMultiplier

    const categoryAngles = {
      'protagonist': Math.PI / 6,
      'deity': Math.PI * 2 / 3 + Math.PI / 6,
      'demon': Math.PI * 4 / 3 + Math.PI / 6,
      'dragon': Math.PI / 2 + Math.PI / 6,
      'buddhist': Math.PI + Math.PI / 6,
      'celestial': Math.PI / 4 + Math.PI / 6,
      'underworld': Math.PI * 3 / 2 + Math.PI / 6,
      'human': Math.PI * 5 / 4 + Math.PI / 6
    }

    const baseAngle = categoryAngles[category as keyof typeof categoryAngles] || Math.PI / 6
    const angleOffset = (Math.random() - 0.5) * (influence / 100) * Math.PI / 2
    const angle = baseAngle + angleOffset
    const armAngle = angle + baseRadius * galaxyConfig.armTightness / galaxyConfig.galaxyRadius
    const height = (power - 50) / 50 * 4 * heightMultiplier
    const radiusVariation = (Math.random() - 0.5) * randomSpread * 1.5
    const finalRadius = baseRadius + radiusVariation

    return new Vector3(
      Math.cos(armAngle) * finalRadius,
      height + (Math.random() - 0.5) * 1.0,
      Math.sin(armAngle) * finalRadius
    )
  }

  /**
   * 为角色生成3D位置
   */
  const generateCharacterPosition = (character: any): Vector3 => {
    const { rank, power, influence, category } = character

    const normalizedRank = Math.max(0, Math.min(1, (150 - rank) / 150))
    const baseRadius = galaxyConfig.galaxyRadius * (0.2 + normalizedRank * 0.6) * radiusMultiplier

    const categoryAngles = {
      'protagonist': 0,
      'deity': Math.PI * 2 / 3,
      'demon': Math.PI * 4 / 3,
      'dragon': Math.PI / 2,
      'buddhist': Math.PI,
      'celestial': Math.PI / 4,
      'underworld': Math.PI * 3 / 2,
      'human': Math.PI * 5 / 4
    }

    const baseAngle = categoryAngles[category as keyof typeof categoryAngles] || 0
    const angleOffset = (Math.random() - 0.5) * (influence / 100) * Math.PI / 4
    const angle = baseAngle + angleOffset
    const armAngle = angle + baseRadius * galaxyConfig.armTightness / galaxyConfig.galaxyRadius
    const height = (power - 50) / 50 * 3 * heightMultiplier
    const radiusVariation = (Math.random() - 0.5) * randomSpread
    const finalRadius = baseRadius + radiusVariation

    return new Vector3(
      Math.cos(armAngle) * finalRadius,
      height + (Math.random() - 0.5) * 0.5,
      Math.sin(armAngle) * finalRadius
    )
  }

  /**
   * 更新InstancedMesh，支持所有渲染参数
   */
  const updateInstancedMesh = () => {
    if (!meshRef.current || allCharacters.length === 0) return

    try {
      allCharacters.forEach((character, i) => {
        if (!character.position) {
          console.warn(`⚠️ 角色 ${character.name} 没有位置信息`)
          return
        }

        const sizeMultiplier = character.isAlias ? aliasSize : 1.0

        tempObject.position.copy(character.position)
        tempObject.scale.setScalar(character.visual.size * globalSize * sizeMultiplier * 1.5)
        tempObject.updateMatrix()

        meshRef.current!.setMatrixAt(i, tempObject.matrix)

        // 调试前几个角色的位置
        if (i < 3) {
          console.log(`🎯 角色${i} ${character.name} 位置:`,
            character.position.x.toFixed(2),
            character.position.y.toFixed(2),
            character.position.z.toFixed(2)
          )
        }

        if (useOriginalColors) {
          tempColor.set(character.visual.color)
          const brightnessBoost = 1 + emissiveIntensity * 0.8
          tempColor.multiplyScalar(colorIntensity * brightnessBoost)
        } else {
          tempColor.set('#ffffff')
          tempColor.multiplyScalar(colorIntensity)
        }

        const finalOpacity = character.isAlias ? aliasOpacity : opacity
        tempColor.multiplyScalar(finalOpacity)
        meshRef.current!.setColorAt(i, tempColor)
      })

      meshRef.current.instanceMatrix.needsUpdate = true
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true
      }
    } catch (error) {
      console.error('❌ updateInstancedMesh 错误:', error)
    }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadCharacterData()
  }, [])

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

  // 动画循环 - 支持可控制的浮动效果
  useFrame((state) => {
    if (!meshRef.current || !isAnimating || allCharacters.length === 0) return

    try {
      const time = state.clock.elapsedTime
      allCharacters.forEach((character, i) => {
        if (!character.position) return

        const sizeMultiplier = character.isAlias ? aliasSize : 1.0

        tempObject.position.copy(character.position)
        tempObject.position.y += Math.sin(time * animationSpeed * 0.5 + i * 0.1) * floatAmplitude
        tempObject.scale.setScalar(character.visual.size * globalSize * sizeMultiplier * 0.8)
        tempObject.updateMatrix()

        meshRef.current!.setMatrixAt(i, tempObject.matrix)
      })

      meshRef.current.instanceMatrix.needsUpdate = true
    } catch (error) {
      console.error('❌ 动画循环错误:', error)
    }
  })

  // 如果不可见或没有数据，不渲染
  if (!visible || allCharacters.length === 0) return null

  console.log(`🎨 渲染简化版角色球体: ${allCharacters.length} 个`)

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

      {/* ✨ 第二步：添加漂亮的高亮效果 */}
      {interactionState.hoveredCharacter && interactionState.worldPosition && (
        <BeautifulHighlight
          position={interactionState.worldPosition}
          size={interactionState.hoveredCharacter.visual.size * globalSize}
          color={interactionState.hoveredCharacter.visual.color}
          visible={true}
        />
      )}
    </>
  )
}
