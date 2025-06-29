import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Vector3, Vector2 } from 'three'
// import * as THREE from 'three' // 暂时注释，如需要可以恢复
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { DataApi } from '@/services/dataApi'

import { useGalaxyCharacterDrag } from '@/hooks/useGalaxyCharacterDrag'

import { BeautifulHighlight } from '../../../Effects/BeautifulHighlight'
import { useCharacterInfoStore } from '@/stores/useCharacterInfoStore'
import { bvhManager } from '@/utils/three/bvhUtils'

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
  category?: string  // 改为可选，因为可能从basic.category获取
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

    // 为InstancedMesh添加BVH支持
    if (meshRef.current && characters.length > 0) {
      bvhManager.computeInstancedBVH(
        meshRef.current,
        {
          maxDepth: 20,
          maxLeafTris: 5,
          verbose: false
        },
        `character_group_${color}_${characters.length}`
      )
      console.log(`🌳 为颜色组 ${color} 创建BVH (${characters.length} 个角色)`)
    }
  }, [characters, globalSize, aliasSize, color])

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
  roughness = 1.0,
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
  aliasSize = 0.8,

}) => {
  console.log('🚀 CharacterSpheresSimple 组件渲染，参数:', {
    visible,
    emissiveIntensity,
    colorIntensity,
    useOriginalColors
  })

  const { isAnimating } = useGalaxyStore()



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

  // 🔍 启用鼠标交互检测 - 转换为CharacterDataWithPosition类型
  const charactersWithPosition = useMemo(() => {
    return allCharacters.map(char => ({
      ...char,
      type: char.type as any, // 临时类型断言
      level: (char as any).level || { id: 'unknown', name: '未知', tier: 0 },
      description: (char as any).description || '',
      visual: (char as any).visual || { color: '#FFFFFF', size: 1.0, emissiveIntensity: 0.5 },
      metadata: (char as any).metadata || { source: 'api', lastModified: new Date().toISOString(), tags: [], verified: false }
    }))
  }, [allCharacters])

  // 🎯 拖拽状态管理
  const [dragStatus, setDragStatus] = useState<string>('')
  const [controlsEnabled, setControlsEnabled] = useState(true)

  // 🎯 使用拖拽交互系统
  const {
    interactionState: dragInteractionState,
    bindMouseEvents: bindDragEvents,
    resetTemporaryPositions
  } = useGalaxyCharacterDrag(
    charactersWithPosition,
    mainMeshRef,
    (index: number, position: Vector3) => {
      // 处理角色位置更新
      console.log(`🎯 角色位置更新: ${charactersWithPosition[index]?.name}`, position.toArray())
    },
    setDragStatus,
    setControlsEnabled
  )

  // 🌐 全局状态管理
  const { setHoveredCharacter, setMousePosition, clearHover } = useCharacterInfoStore()

  // 绑定拖拽事件
  useEffect(() => {
    const cleanup = bindDragEvents()
    return cleanup
  }, [bindDragEvents])

  // 🔄 同步拖拽交互状态到全局状态
  useEffect(() => {
    if (dragInteractionState.hoveredCharacter) {
      console.log('🖱️ 检测到悬浮:', dragInteractionState.hoveredCharacter.name)
      console.log('🌐 更新全局状态')
      // 转换CharacterDataWithPosition为CharacterData
      const characterData = {
        id: dragInteractionState.hoveredCharacter.id,
        name: dragInteractionState.hoveredCharacter.name,
        pinyin: dragInteractionState.hoveredCharacter.pinyin || '',
        type: dragInteractionState.hoveredCharacter.type,
        category: (dragInteractionState.hoveredCharacter as any).category || 'human',
        faction: dragInteractionState.hoveredCharacter.faction,
        rank: dragInteractionState.hoveredCharacter.rank,
        power: dragInteractionState.hoveredCharacter.power || 50,
        influence: dragInteractionState.hoveredCharacter.influence || 50,
        visual: dragInteractionState.hoveredCharacter.visual || {
          color: '#FFFFFF',
          size: 1.0,
          emissiveIntensity: 0.5
        },
        isAlias: dragInteractionState.hoveredCharacter.isAlias,
        originalCharacter: dragInteractionState.hoveredCharacter.originalCharacter
      }
      setHoveredCharacter(characterData)
      if (dragInteractionState.mousePosition) {
        setMousePosition(new Vector2(dragInteractionState.mousePosition.x, dragInteractionState.mousePosition.y))
      }
    } else {
      console.log('🚫 清除悬浮状态')
      clearHover()
    }
  }, [dragInteractionState.hoveredCharacter, dragInteractionState.mousePosition, setHoveredCharacter, setMousePosition, clearHover])

  // mesh引用回调 - 将第一个mesh设为主要交互对象
  const handleMeshRef = (color: string, mesh: InstancedMesh | null) => {
    if (mesh && !mainMeshRef.current) {
      // 使用类型断言来绕过只读限制
      ;(mainMeshRef as React.MutableRefObject<InstancedMesh | null>).current = mesh
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
   * 为别名生成3D位置 - 球形随机分布算法
   */
  const generateAliasPosition = (alias: any): Vector3 => {
    const { rank } = alias

    // 别名使用稍大的分布半径 (40-80的半径范围)
    const normalizedRank = Math.max(0, Math.min(1, (150 - rank) / 150))
    const baseRadius = 40 + normalizedRank * 40

    // 在球体内均匀随机分布 - 使用球坐标系
    const phi = Math.random() * Math.PI * 2 // 方位角 0-2π
    const cosTheta = Math.random() * 2 - 1 // cos(极角) -1到1
    const u = Math.random() // 径向随机因子

    // 球坐标转换为笛卡尔坐标
    const theta = Math.acos(cosTheta)
    const r = baseRadius * Math.cbrt(u) * radiusMultiplier // 立方根确保球内均匀分布

    const x = r * Math.sin(theta) * Math.cos(phi)
    const y = r * Math.sin(theta) * Math.sin(phi) * heightMultiplier
    const z = r * Math.cos(theta)

    // 别名添加更大的随机扰动
    const randomOffset = randomSpread * 2.5
    const offsetX = (Math.random() - 0.5) * randomOffset
    const offsetY = (Math.random() - 0.5) * randomOffset
    const offsetZ = (Math.random() - 0.5) * randomOffset

    return new Vector3(
      x + offsetX,
      y + offsetY,
      z + offsetZ
    )
  }

  /**
   * 为角色生成3D位置 - 球形随机分布算法
   */
  const generateCharacterPosition = (character: any): Vector3 => {
    const { rank } = character

    // 基础分布半径，根据等级调整 (30-70的半径范围)
    const normalizedRank = Math.max(0, Math.min(1, (150 - rank) / 150))
    const baseRadius = 30 + normalizedRank * 40

    // 在球体内均匀随机分布 - 使用球坐标系
    const phi = Math.random() * Math.PI * 2 // 方位角 0-2π
    const cosTheta = Math.random() * 2 - 1 // cos(极角) -1到1
    const u = Math.random() // 径向随机因子

    // 球坐标转换为笛卡尔坐标
    const theta = Math.acos(cosTheta)
    const r = baseRadius * Math.cbrt(u) * radiusMultiplier // 立方根确保球内均匀分布

    const x = r * Math.sin(theta) * Math.cos(phi)
    const y = r * Math.sin(theta) * Math.sin(phi) * heightMultiplier
    const z = r * Math.cos(theta)

    // 添加随机扰动增加自然感
    const randomOffset = randomSpread * 2
    const offsetX = (Math.random() - 0.5) * randomOffset
    const offsetY = (Math.random() - 0.5) * randomOffset
    const offsetZ = (Math.random() - 0.5) * randomOffset

    return new Vector3(
      x + offsetX,
      y + offsetY,
      z + offsetZ
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

      {/* 🔍 隐藏的交互检测mesh - 支持BVH优化 */}
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

            // 为交互检测mesh添加BVH支持
            if (allCharacters.length > 0) {
              bvhManager.computeInstancedBVH(
                mesh,
                {
                  maxDepth: 25,
                  maxLeafTris: 3,
                  verbose: false
                },
                `interaction_mesh_${allCharacters.length}`
              )
              console.log(`🌳 为交互检测mesh创建BVH (${allCharacters.length} 个角色)`)
            }
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
      {interactionState.hoveredCharacter && (
        <BeautifulHighlight
          position={
            (interactionState as any).worldPosition ||
            interactionState.hoveredCharacter.position ||
            new Vector3(0, 0, 0)
          }
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
