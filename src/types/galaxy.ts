import { Vector3 } from 'three'

/**
 * 银河系配置参数
 */
export interface GalaxyConfig {
  /** 星球数量 */
  planetCount: number
  /** 银河系半径 */
  galaxyRadius: number
  /** 旋臂数量 */
  numArms: number
  /** 旋臂紧密度 */
  armTightness: number
  /** 旋臂宽度 */
  armWidth: number
  /** 波浪振幅 */
  waveAmplitude: number
  /** 波浪频率 */
  waveFrequency: number
  /** 最大发光强度 */
  maxEmissiveIntensity: number
}

/**
 * 星球数据
 */
export interface PlanetData {
  /** 唯一标识 */
  id: string
  /** 位置 */
  position: Vector3
  /** 半径 */
  radius: number
  /** 角度 */
  angle: number
  /** 距离中心的距离 */
  distanceFromCenter: number
  /** 颜色 */
  color: string
  /** 发光强度 */
  emissiveIntensity: number
  /** 用户数据（可以存储角色信息） */
  userData?: any
}

/**
 * 雾气配置
 */
export interface FogConfig {
  /** 不透明度 */
  opacity: number
  /** 粒子大小 */
  size: number
  /** 颜色 */
  color: string
}

/**
 * 辉光效果配置
 */
export interface BloomConfig {
  /** 阈值 */
  threshold: number
  /** 强度 */
  strength: number
  /** 半径 */
  radius: number
}

/**
 * 场景配置
 */
export interface SceneConfig {
  galaxy: GalaxyConfig
  fog: FogConfig
  bloom: BloomConfig
}
