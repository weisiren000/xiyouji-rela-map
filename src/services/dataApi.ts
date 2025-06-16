/**
 * 数据API客户端
 * 负责与后端数据服务器通信
 */

import { CharacterData, DataStats } from '@/types/character'

// API配置
const API_BASE_URL = 'http://localhost:3002/api'

// API响应类型
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  cached?: boolean
  timestamp: string
}

interface CompleteDataResponse {
  characters: CharacterData[]
  aliases: CharacterData[]
  stats: DataStats
}

/**
 * 通用API请求函数
 */
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result: ApiResponse<T> = await response.json()

    if (!result.success) {
      throw new Error(result.error || '请求失败')
    }

    return result.data as T
  } catch (error) {
    console.error(`API请求失败 [${endpoint}]:`, error)
    throw error
  }
}

/**
 * 数据API类
 */
export class DataApi {
  /**
   * 获取所有角色数据
   */
  static async getCharacters(): Promise<CharacterData[]> {
    try {
      console.log('🔄 正在获取角色数据...')
      const characters = await apiRequest<CharacterData[]>('/characters')
      console.log(`✅ 成功获取 ${characters.length} 个角色`)
      return characters
    } catch (error) {
      console.error('❌ 获取角色数据失败:', error)
      throw new Error(`获取角色数据失败: ${error}`)
    }
  }

  /**
   * 获取所有别名数据
   */
  static async getAliases(): Promise<CharacterData[]> {
    try {
      console.log('🔄 正在获取别名数据...')
      const aliases = await apiRequest<CharacterData[]>('/aliases')
      console.log(`✅ 成功获取 ${aliases.length} 个别名`)
      return aliases
    } catch (error) {
      console.error('❌ 获取别名数据失败:', error)
      throw new Error(`获取别名数据失败: ${error}`)
    }
  }

  /**
   * 获取完整数据（角色+别名+统计）
   */
  static async getCompleteData(): Promise<CompleteDataResponse> {
    try {
      console.log('🔄 正在获取完整数据...')
      const data = await apiRequest<CompleteDataResponse>('/data/complete')
      console.log(`✅ 成功获取完整数据:`, {
        characters: data.characters.length,
        aliases: data.aliases.length,
        stats: data.stats
      })
      return data
    } catch (error) {
      console.error('❌ 获取完整数据失败:', error)
      throw new Error(`获取完整数据失败: ${error}`)
    }
  }

  /**
   * 获取数据统计
   */
  static async getStats(): Promise<DataStats> {
    try {
      console.log('🔄 正在获取数据统计...')
      const stats = await apiRequest<DataStats>('/stats')
      console.log('✅ 成功获取数据统计:', stats)
      return stats
    } catch (error) {
      console.error('❌ 获取数据统计失败:', error)
      throw new Error(`获取数据统计失败: ${error}`)
    }
  }

  /**
   * 刷新服务器缓存
   */
  static async refreshCache(): Promise<void> {
    try {
      console.log('🔄 正在刷新缓存...')
      await apiRequest<{ message: string }>('/cache/refresh', {
        method: 'POST'
      })
      console.log('✅ 缓存刷新成功')
    } catch (error) {
      console.error('❌ 刷新缓存失败:', error)
      throw new Error(`刷新缓存失败: ${error}`)
    }
  }

  /**
   * 检查服务器连接
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: 'HEAD',
        timeout: 5000
      } as any)
      return response.ok
    } catch (error) {
      console.warn('⚠️ 服务器连接检查失败:', error)
      return false
    }
  }

  /**
   * 获取服务器状态
   */
  static async getServerStatus(): Promise<{
    online: boolean
    timestamp?: string
    error?: string
  }> {
    try {
      const stats = await this.getStats()
      return {
        online: true,
        timestamp: stats.lastUpdated
      }
    } catch (error) {
      return {
        online: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }
}

/**
 * 数据转换工具
 */
export class DataTransformer {
  /**
   * 转换角色数据为银河系星球数据
   */
  static transformToGalaxyData(characters: CharacterData[]) {
    return characters.map((character, index) => ({
      id: character.id,
      name: character.name,
      position: this.calculatePosition(character, index, characters.length),
      color: character.visual.color,
      size: character.visual.size,
      emissiveIntensity: character.visual.emissiveIntensity,
      metadata: {
        rank: character.rank,
        type: character.type,
        faction: character.faction,
        power: character.power,
        influence: character.influence,
        description: character.description
      }
    }))
  }

  /**
   * 计算星球在银河系中的位置
   */
  private static calculatePosition(
    character: CharacterData, 
    index: number, 
    total: number
  ): { x: number; y: number; z: number } {
    // 基于重要性排名的螺旋分布
    const rank = character.rank
    const importance = 1 - (rank / 150) // 重要性系数
    
    // 距离中心的距离（重要角色靠近中心）
    const radius = 5 + (1 - importance) * 15
    
    // 螺旋角度
    const angle = (index / total) * Math.PI * 8 + (rank * 0.1)
    
    // 高度基于角色类型
    const heightMap: Record<string, number> = {
      'PROTAGONIST': 2,
      'DEITY': 4,
      'BUDDHIST': 3,
      'CELESTIAL': 3,
      'DEMON': -2,
      'UNDERWORLD': -4,
      'HUMAN': 0,
      'DRAGON': 1
    }
    const height = (heightMap[character.type] || 0) + (Math.random() - 0.5) * 2
    
    return {
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius
    }
  }

  /**
   * 生成角色关系连线数据
   */
  static generateRelationships(characters: CharacterData[]) {
    const relationships: Array<{
      from: string
      to: string
      type: string
      strength: number
      fromName: string
      toName: string
    }> = []
    const characterMap = new Map(characters.map(c => [c.id, c]))

    characters.forEach(character => {
      if (character.relationships) {
        character.relationships.forEach(rel => {
          const target = characterMap.get(rel.targetId)
          if (target) {
            relationships.push({
              from: character.id,
              to: rel.targetId,
              type: rel.type,
              strength: rel.strength,
              fromName: character.name,
              toName: target.name
            })
          }
        })
      }
    })

    return relationships
  }
}

/**
 * 数据缓存管理
 */
export class DataCache {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5分钟

  static set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  static clear(): void {
    this.cache.clear()
  }

  static has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key)
  }

  private static isExpired(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return true
    return Date.now() - cached.timestamp > this.CACHE_DURATION
  }
}
