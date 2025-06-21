import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Vector3, Vector2 } from 'three'
// import * as THREE from 'three' // 暂时注释，如需要可以恢复
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { DataApi } from '@/services/dataApi'
import { useCharacterInteraction } from '@/hooks/useCharacterInteraction'
import { BeautifulHighlight } from '../../../Effects/BeautifulHighlight'
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
  position?: Vector3
  isAlias?: boolean
  originalCharacter?: string
  // 支持完整JSON结构
  basic?: {
    name: string
    pinyin: string
    category: string
    type: string
  }
  attributes?: {
    rank: number
    power: number
    influence: number
  }
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

/**
 * 基于类型的颜色映射 (适配汉化后的数据库)
 */
const getCharacterColor = (category: string): string => {
  const colorMap = {
    // 中文分类映射
    '主角': '#FFD700',           // 金色
    '神仙': '#87CEEB',           // 天蓝色
    '妖魔': '#FF6347',           // 红色
    '龙族': '#00CED1',           // 青色
    '佛教': '#DDA0DD',           // 紫色
    '天庭': '#F0E68C',           // 卡其色
    '地府': '#696969',           // 灰色
    '人类': '#FFA500',           // 橙色
    '仙人': '#98FB98',           // 浅绿色
    '反派': '#DC143C',           // 深红色
    '别名': '#C0C0C0',           // 银色
    // 兼容英文分类映射
    'protagonist': '#FFD700',    // 金色
    'deity': '#87CEEB',          // 天蓝色
    'demon': '#FF6347',          // 红色
    'dragon': '#00CED1',         // 青色
    'buddhist': '#DDA0DD',       // 紫色
    'celestial': '#F0E68C',      // 卡其色
    'underworld': '#696969',     // 灰色
    'human': '#FFA500',          // 橙色
    'immortal': '#98FB98',       // 浅绿色
    'antagonist': '#DC143C',     // 深红色
    'alias': '#C0C0C0'           // 银色
  }
  return colorMap[category as keyof typeof colorMap] || '#FFFFFF'
}

/**
 * 基于排名的大小计算
 */
const getCharacterSize = (rank: number): number => {
  return Math.max(0.5, 2.0 - (rank / 150) * 1.5)
}

/**
 * 基于能力的发光强度计算
 * 暂时注释，如需要可以恢复
 */
// const getEmissiveIntensity = (power: number): number => {
//   return Math.max(0.1, Math.min(1.0, power / 100 * 0.8))
// }

/**
 * 单个颜色组的角色渲染组件
 */
interface CharacterGroupProps {
  characters: CharacterData[]
  color: string
  opacity: number
  globalSize: number
  emissiveIntensity: number
  metalness: number
  roughness: number
  colorIntensity: number
  aliasOpacity: number
  aliasSize: number
  isAnimating: boolean
  animationSpeed: number
  floatAmplitude: number
  onMeshRef?: (color: string, mesh: InstancedMesh | null) => void
}

const CharacterGroup: React.FC<CharacterGroupProps> = ({
  characters,
  color,
  opacity,
  globalSize,
  emissiveIntensity,
  metalness,
  roughness,
  // colorIntensity, // 暂时注释
  aliasOpacity,
  aliasSize,
  isAnimating,
  animationSpeed,
  floatAmplitude,
  onMeshRef
}) => {
  const meshRef = useRef<InstancedMesh>(null)
  // const { galaxyConfig } = useGalaxyStore() // 暂时注释
  const tempObject = useMemo(() => new Object3D(), [])
  // const tempColor = useMemo(() => new Color(), []) // 暂时注释

  // 计算发光颜色 - 暂时注释，如需要可以恢复
  // const glowColor = useMemo(() => {
  //   tempColor.set(color)
  //   const glowBoost = 1 + emissiveIntensity * 2.5
  //   tempColor.multiplyScalar(colorIntensity * glowBoost)

  //   // 确保颜色不会过度饱和
  //   const maxComponent = Math.max(tempColor.r, tempColor.g, tempColor.b)
  //   if (maxComponent > 1) {
  //     const scale = Math.min(maxComponent, 3) / maxComponent
  //     tempColor.multiplyScalar(scale)
  //   }

  //   return `rgb(${Math.round(tempColor.r * 255)}, ${Math.round(tempColor.g * 255)}, ${Math.round(tempColor.b * 255)})`
  // }, [color, emissiveIntensity, colorIntensity])

  // 更新实例矩阵
  const updateInstancedMesh = () => {
    if (!meshRef.current || characters.length === 0) return

    characters.forEach((character, i) => {
      if (!character.position) return

      const sizeMultiplier = character.isAlias ? aliasSize : 1.0
      const rank = character.attributes?.rank || character.rank || 999
      const characterSize = getCharacterSize(rank)

      tempObject.position.copy(character.position)
      tempObject.scale.setScalar(characterSize * globalSize * sizeMultiplier * 1.5)
      tempObject.updateMatrix()

      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  }

  // 初始化和更新
  useEffect(() => {
    updateInstancedMesh()
  }, [characters, globalSize, aliasSize])

  // 动画循环
  useFrame((state) => {
    if (!meshRef.current || characters.length === 0 || !isAnimating) return

    const time = state.clock.elapsedTime
    characters.forEach((character, i) => {
      if (!character.position) return

      const sizeMultiplier = character.isAlias ? aliasSize : 1.0
      const rank = character.attributes?.rank || character.rank || 999
      const characterSize = getCharacterSize(rank)

      tempObject.position.copy(character.position)
      tempObject.position.y += Math.sin(time * animationSpeed * 0.5 + i * 0.1) * floatAmplitude
      tempObject.scale.setScalar(characterSize * globalSize * sizeMultiplier * 0.8)
      tempObject.updateMatrix()

      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (characters.length === 0) return null

  console.log(`🎨 渲染颜色组 ${color}: ${characters.length} 个角色`)

  return (
    <instancedMesh
      ref={(mesh) => {
        if (mesh) {
          (meshRef as any).current = mesh
          onMeshRef?.(color, mesh)
        } else {
          onMeshRef?.(color, null)
        }
      }}
      args={[undefined, undefined, characters.length]}
      frustumCulled={true}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        metalness={metalness}
        roughness={roughness}
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        transparent={opacity < 1 || aliasOpacity < 1}
        opacity={opacity}
      />
    </instancedMesh>
  )
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
  console.log('🚀 CharacterSpheresSimple 组件渲染，参数:', {
    visible,
    emissiveIntensity,
    colorIntensity,
    useOriginalColors
  })

  const { galaxyConfig, isAnimating } = useGalaxyStore()



  // 角色数据状态
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [aliases, setAliases] = useState<CharacterData[]>([])
  // const [loading, setLoading] = useState(false) // 暂时注释
  // const [error, setError] = useState<string | null>(null) // 暂时注释

  // 合并角色和别名数据用于渲染
  const allCharacters = useMemo(() => {
    const result = [...characters]
    if (showAliases) {
      result.push(...aliases)
    }
    return result
  }, [characters, aliases, showAliases])

  // 🎨 按颜色分组角色数据 - 多InstancedMesh方案
  const characterGroups = useMemo(() => {
    const groups: { [key: string]: { characters: CharacterData[], color: string } } = {}

    allCharacters.forEach(character => {
      const category = character.basic?.category || character.category || 'human'
      const color = getCharacterColor(category)

      if (!groups[color]) {
        groups[color] = { characters: [], color }
      }
      groups[color].characters.push(character)
    })

    console.log('🎨 角色颜色分组:', Object.keys(groups).map(color => ({
      color,
      count: groups[color].characters.length,
      categories: [...new Set(groups[color].characters.map(c => c.basic?.category || c.category))]
    })))

    return groups
  }, [allCharacters])

  // 🔍 恢复原来的交互系统 - 使用第一个mesh作为主要交互对象
  const mainMeshRef = useRef<InstancedMesh>(null)

  // 🔍 启用鼠标交互检测
  const { interactionState, bindMouseEvents } = useCharacterInteraction(allCharacters, mainMeshRef)

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
      if (interactionState.mousePosition) {
        setMousePosition(new Vector2(interactionState.mousePosition.x, interactionState.mousePosition.y))
      }
    } else {
      console.log('🚫 清除悬浮状态')
      clearHover()
    }
  }, [interactionState.hoveredCharacter, interactionState.mousePosition, setHoveredCharacter, setMousePosition, clearHover])

  // mesh引用回调 - 将第一个mesh设为主要交互对象
  const handleMeshRef = (color: string, mesh: InstancedMesh | null) => {
    if (mesh && !mainMeshRef.current) {
      mainMeshRef.current = mesh
      console.log(`🔗 设置主要交互mesh: ${color}`)
    }
  }

  // 简单的交互检测 - 临时实现，点击任意角色球体进入局部视图
  // const handleCharacterClick = (character: any) => {
  //   console.log('🖱️ 点击角色:', character.name)
  //   // 触发局部视图
  //   setHoveredCharacter(character)
  //   // 这里可以添加进入局部视图的逻辑
  // }

  /**
   * 从后端API加载完整数据（角色+别名）
   */
  const loadCharacterData = async () => {
    try {
      // setLoading(true) // 暂时注释
      // setError(null) // 暂时注释

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
      // setError(errorMessage) // 暂时注释
      console.error('❌ 数据加载失败:', errorMessage)
    } finally {
      // setLoading(false) // 暂时注释
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
      // 中文分类映射
      '主角': Math.PI / 6,
      '神仙': Math.PI * 2 / 3 + Math.PI / 6,
      '妖魔': Math.PI * 4 / 3 + Math.PI / 6,
      '龙族': Math.PI / 2 + Math.PI / 6,
      '佛教': Math.PI + Math.PI / 6,
      '天庭': Math.PI / 4 + Math.PI / 6,
      '地府': Math.PI * 3 / 2 + Math.PI / 6,
      '人类': Math.PI * 5 / 4 + Math.PI / 6,
      '仙人': Math.PI / 3 + Math.PI / 6,
      '反派': Math.PI * 7 / 4 + Math.PI / 6,
      '别名': Math.PI / 8 + Math.PI / 6,
      // 兼容英文分类映射
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
      // 中文分类映射
      '主角': 0,
      '神仙': Math.PI * 2 / 3,
      '妖魔': Math.PI * 4 / 3,
      '龙族': Math.PI / 2,
      '佛教': Math.PI,
      '天庭': Math.PI / 4,
      '地府': Math.PI * 3 / 2,
      '人类': Math.PI * 5 / 4,
      '仙人': Math.PI / 3,
      '反派': Math.PI * 7 / 4,
      '别名': Math.PI / 8,
      // 兼容英文分类映射
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

  // 旧的updateInstancedMesh函数已移除，现在使用多InstancedMesh方案

  // 组件挂载时加载数据
  useEffect(() => {
    loadCharacterData()
  }, [])



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

  // 如果不可见或没有数据，不渲染
  if (!visible || allCharacters.length === 0) return null

  console.log(`🎨 渲染简化版角色球体: ${allCharacters.length} 个`)



  return (
    <>
      {/* 🎨 多InstancedMesh方案：按颜色分组渲染 */}
      {Object.entries(characterGroups).map(([color, group]) => (
        <CharacterGroup
          key={color}
          characters={group.characters}
          color={color}
          opacity={opacity}
          globalSize={globalSize}
          emissiveIntensity={emissiveIntensity}
          metalness={metalness}
          roughness={roughness}
          colorIntensity={colorIntensity}
          aliasOpacity={aliasOpacity}
          aliasSize={aliasSize}
          isAnimating={isAnimating}
          animationSpeed={animationSpeed}
          floatAmplitude={floatAmplitude}
          onMeshRef={handleMeshRef}
        />
      ))}

      {/* 🔍 隐藏的交互检测mesh */}
      <instancedMesh
        ref={(mesh) => {
          if (mesh) {
            (mainMeshRef as any).current = mesh
            // 更新所有角色的位置矩阵
            const tempObject = new Object3D()
            allCharacters.forEach((character, i) => {
              if (!character.position) return
              const sizeMultiplier = character.isAlias ? aliasSize : 1.0
              const rank = character.attributes?.rank || character.rank || 999
              const characterSize = getCharacterSize(rank)
              tempObject.position.copy(character.position)
              tempObject.scale.setScalar(characterSize * globalSize * sizeMultiplier * 1.5)
              tempObject.updateMatrix()
              mesh.setMatrixAt(i, tempObject.matrix)
            })
            mesh.instanceMatrix.needsUpdate = true
          }
        }}
        args={[undefined, undefined, allCharacters.length]}
        visible={false}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </instancedMesh>

      {/* ✨ 高亮效果 - 恢复显示 */}
      {interactionState.hoveredCharacter && interactionState.worldPosition && (
        <BeautifulHighlight
          position={interactionState.worldPosition}
          size={1.0 * globalSize}
          color={getCharacterColor(
            (interactionState.hoveredCharacter as any).basic?.category ||
            (interactionState.hoveredCharacter as any).category ||
            'human'
          )}
          visible={true}
        />
      )}
    </>
  )
}
