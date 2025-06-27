import { DataApi } from './dataApi'
import { EventData } from '@/types/events'
import { CharacterData } from '@/types/character'

/**
 * 事件角色关系服务
 * 用于解析事件中的主要人物并获取对应的角色数据
 */

export interface EventCharacter {
  id: string
  name: string
  role: string // protagonist, antagonist, supporting, etc.
  character?: CharacterData // 完整的角色数据（如果找到）
  position: [number, number, number] // 3D位置
  color: string
  size: number
  emissiveIntensity: number
}

/**
 * 解析事件中的主要人物字符串
 * 支持多种格式：
 * - "孙悟空、唐僧、猪八戒"
 * - "孙悟空,唐僧,猪八戒"
 * - "孙悟空 唐僧 猪八戒"
 */
export function parseEventCharacters(zhuyaorenwu: string): string[] {
  if (!zhuyaorenwu || zhuyaorenwu.trim() === '') {
    return []
  }

  // 清理字符串并分割
  const characters = zhuyaorenwu
    .replace(/[，,、]/g, ',') // 统一分隔符
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0)

  return characters
}

/**
 * 根据角色名称查找角色数据
 */
export async function findCharacterByName(name: string, allCharacters: CharacterData[]): Promise<CharacterData | null> {
  // 精确匹配名称
  let character = allCharacters.find(char => char.name === name)
  if (character) return character

  // 匹配别名
  character = allCharacters.find(char => 
    char.aliases && char.aliases.includes(name)
  )
  if (character) return character

  // 模糊匹配（包含关系）
  character = allCharacters.find(char => 
    char.name.includes(name) || name.includes(char.name)
  )
  if (character) return character

  return null
}

/**
 * 生成角色在关系图谱中的3D位置
 * 使用圆形布局，角色围绕中心事件点分布
 */
export function generateCharacterPositions(characterCount: number): [number, number, number][] {
  const positions: [number, number, number][] = []
  const radius = 8 // 距离中心的半径
  const heightVariation = 2 // Y轴变化范围

  for (let i = 0; i < characterCount; i++) {
    const angle = (i / characterCount) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = (Math.random() - 0.5) * heightVariation // 随机高度变化

    positions.push([x, y, z])
  }

  return positions
}

/**
 * 获取角色的默认颜色（基于角色类型）
 */
export function getCharacterColor(character?: CharacterData): string {
  if (!character) {
    return '#CCCCCC' // 默认灰色
  }

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

  return colorMap[character.category] || character.visual?.color || '#FFFFFF'
}

/**
 * 获取事件的角色关系图谱数据
 */
export async function getEventCharacterGraph(event: EventData): Promise<EventCharacter[]> {
  try {
    // 解析主要人物
    const characterNames = parseEventCharacters(event.zhuyaorenwu)
    
    if (characterNames.length === 0) {
      console.log('事件没有主要人物信息:', event.nanming)
      return []
    }

    // 获取所有角色数据
    const allCharacters = await DataApi.getCharacters()
    
    // 生成位置
    const positions = generateCharacterPositions(characterNames.length)
    
    // 创建事件角色数据
    const eventCharacters: EventCharacter[] = []
    
    for (let i = 0; i < characterNames.length; i++) {
      const name = characterNames[i]
      const character = await findCharacterByName(name, allCharacters)
      
      const eventCharacter: EventCharacter = {
        id: character?.id || `temp-${i}`,
        name: name,
        role: 'participant', // 默认角色
        character: character || undefined,
        position: positions[i],
        color: getCharacterColor(character),
        size: character?.visual?.size || 1.0,
        emissiveIntensity: character?.visual?.emissiveIntensity || 0.5
      }
      
      eventCharacters.push(eventCharacter)
    }

    console.log(`✅ 成功解析事件 "${event.nanming}" 的 ${eventCharacters.length} 个角色`)
    return eventCharacters
    
  } catch (error) {
    console.error('获取事件角色关系图谱失败:', error)
    return []
  }
}

/**
 * 缓存管理
 */
const characterCache = new Map<string, EventCharacter[]>()

/**
 * 获取事件角色关系图谱（带缓存）
 */
export async function getEventCharacterGraphCached(event: EventData): Promise<EventCharacter[]> {
  const cacheKey = `event-${event.id}-${event.nanci}`
  
  if (characterCache.has(cacheKey)) {
    return characterCache.get(cacheKey)!
  }
  
  const characters = await getEventCharacterGraph(event)
  characterCache.set(cacheKey, characters)
  
  return characters
}
