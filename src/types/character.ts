/**
 * 西游记角色数据类型定义
 */

export interface CharacterData {
  // 基础信息
  id: string                    // 角色ID (如: c0001)
  name: string                  // 角色名称
  pinyin?: string               // 拼音
  aliases?: string[]            // 别名列表

  // 分类信息
  type: CharacterType           // 角色类型
  faction: string               // 所属势力
  rank: number                  // 重要性排名 (1-150)
  level: CharacterLevel         // 等级信息
  power?: number                // 能力值
  influence?: number            // 影响力

  // 描述信息
  description: string           // 角色描述
  chapter?: string              // 出现章节
  abilities?: string[]          // 能力技能

  // 可视化属性
  visual: CharacterVisual       // 视觉配置

  // 关系信息
  relationships?: Relationship[] // 角色关系

  // 元数据
  metadata: CharacterMetadata   // 元数据
}

export interface CharacterLevel {
  id: string                    // 等级ID
  name: string                  // 等级名称
  tier: number                  // 等级数值
}

export interface CharacterVisual {
  color: string                 // 主要颜色
  size: number                  // 大小系数
  emissiveIntensity: number     // 发光强度
  position?: {                  // 3D位置 (可选，用于固定位置)
    x: number
    y: number
    z: number
  }
}

export interface Relationship {
  targetId: string              // 目标角色ID
  type: RelationshipType        // 关系类型
  strength: number              // 关系强度 (0-1)
  description?: string          // 关系描述
}

export interface CharacterMetadata {
  source: string                // 数据来源
  lastModified: string          // 最后修改时间
  tags: string[]                // 标签
  verified: boolean             // 是否已验证
}

// 枚举类型
export enum CharacterType {
  PROTAGONIST = 'protagonist',   // 主角团队
  DEITY = 'deity',              // 神仙
  DEMON = 'demon',              // 妖怪
  HUMAN = 'human',              // 人类
  DRAGON = 'dragon',            // 龙族
  CELESTIAL = 'celestial',      // 天庭
  BUDDHIST = 'buddhist',        // 佛教
  UNDERWORLD = 'underworld'     // 地府
}

export enum RelationshipType {
  MASTER_DISCIPLE = 'master_disciple',  // 师徒
  FAMILY = 'family',                    // 家族
  FRIEND = 'friend',                    // 朋友
  ENEMY = 'enemy',                      // 敌对
  COLLEAGUE = 'colleague',              // 同事
  SUPERIOR = 'superior',                // 上下级
  ALLIANCE = 'alliance'                 // 联盟
}

// 数据映射相关
export interface CharacterMapping {
  characterId: string           // 角色ID
  planetIndex: number           // 对应的星球索引
  position: {                   // 3D位置
    x: number
    y: number
    z: number
  }
  visual: {                     // 视觉属性
    color: string
    size: number
    emissiveIntensity: number
  }
}

// Dashboard相关
export interface DataLoadResult {
  success: boolean
  data: CharacterData[]
  errors: string[]
  stats: DataStats
}

export interface DataStats {
  totalCharacters: number
  charactersByType: Record<CharacterType, number>
  charactersByFaction: Record<string, number>
  relationshipCount: number
  lastUpdated: string
}

// 数据操作
export interface DataOperation {
  type: 'create' | 'update' | 'delete'
  characterId: string
  data?: Partial<CharacterData>
  timestamp: string
}

export interface DataFilter {
  type?: CharacterType[]
  faction?: string[]
  rankRange?: [number, number]
  searchText?: string
}

export interface DataSort {
  field: keyof CharacterData
  direction: 'asc' | 'desc'
}
