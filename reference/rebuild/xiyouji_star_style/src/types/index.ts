import * as THREE from 'three'

/**
 * 西游记角色类型定义
 */
export interface XiyoujiCharacter {
  /** 角色名称 */
  name: string
  /** 角色类型：0-主角, 1-神仙, 2-妖魔, 3-其他 */
  type: number
  /** 重要性权重 0-1 */
  importance: number
  /** 所属天体 */
  celestial: CelestialBodyType
  /** 别名列表 */
  aliases: string[]
}

/**
 * 角色关系定义
 */
export interface CharacterRelationship {
  /** 起始角色索引 */
  from: number
  /** 目标角色索引 */
  to: number
  /** 关系类型 */
  type: RelationshipType
  /** 关系强度 0-1 */
  strength: number
}

/**
 * 关系类型枚举
 */
export type RelationshipType = 
  | 'master_disciple'  // 师徒关系
  | 'fellow_disciple'  // 师兄弟关系
  | 'family'           // 家庭关系
  | 'enemy'            // 敌对关系
  | 'superior'         // 上下级关系
  | 'buddhist'         // 佛教关系

/**
 * 天体类型枚举
 */
export type CelestialBodyType = 
  | 'sun'      // 太阳中心
  | 'mercury'  // 水星-佛界
  | 'venus'    // 金星-观音净土
  | 'earth'    // 地球-取经团队
  | 'mars'     // 火星-妖魔世界
  | 'jupiter'  // 木星-妖王联盟
  | 'saturn'   // 土星-天庭众神
  | 'uranus'   // 天王星-道教仙人
  | 'neptune'  // 海王星-其他角色

/**
 * 天体配置
 */
export interface CelestialBodyConfig {
  /** 轨道半径 */
  radius: number
  /** 天体名称 */
  name: string
}

/**
 * 应用配置状态
 */
export interface AppConfig {
  /** 是否暂停动画 */
  paused: boolean
  /** 当前激活的调色板索引 */
  activePaletteIndex: number
  /** 当前布局索引 */
  currentFormation: number
  /** 布局总数 */
  numFormations: number
  /** 密度因子 */
  densityFactor: number
}

/**
 * 脉冲系统配置
 */
export interface PulseUniforms {
  uTime: { value: number }
  uPulsePositions: { value: THREE.Vector3[] }
  uPulseTimes: { value: number[] }
  uPulseColors: { value: THREE.Color[] }
  uPulseSpeed: { value: number }
  uBaseNodeSize: { value: number }
  uActivePalette: { value: number }
}

/**
 * 布局类型枚举
 */
export type FormationType = 
  | 'galaxy'     // 银河系螺旋
  | 'nineheavens' // 九重天分层
  | 'journey'    // 取经路线
  | 'factions'   // 势力阵营

/**
 * 主题调色板类型
 */
export type ThemePalette = THREE.Color[]

/**
 * 节点系统接口
 */
export interface INodeSystem {
  nodeCount: number
  updatePalette(paletteIndex: number): void
  updateDensity(densityFactor: number): void
  applyFormation(formationIndex: number): void
}
