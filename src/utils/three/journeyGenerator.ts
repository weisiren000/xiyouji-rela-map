import { Vector3, Color } from 'three'
import type { EventData } from '@/types/events'

/**
 * 西游记取经路径点接口
 */
export interface JourneyPoint {
  id: string
  index: number // 0-80，代表第几难
  position: Vector3
  radius: number
  color: string
  emissiveIntensity: number
  difficulty: string // 难度名称（可选）

  // 真实的81难事件数据
  eventData?: EventData

  userData: {
    spiralAngle: number
    distanceFromCenter: number
    progressRatio: number // 0-1，表示取经进度
  }
}

/**
 * 西游记取经路径配置
 */
export interface JourneyConfig {
  pointCount: number // 固定为81
  maxRadius: number // 起始外圈半径
  minRadius: number // 结束内圈半径
  totalTurns: number // 螺旋总圈数
  waveHeight: number // Y轴波动幅度
  waveFrequency: number // Y轴波动频率
  pointSize: number // 点的基础大小
  emissiveIntensity: number // 发光强度

  // 银河系悬臂参数
  armTightness: number // 悬臂紧密度 (控制对数螺旋的紧密程度)
  armIndex: number // 悬臂索引 (0-3, 选择哪条悬臂)

  // 球体外观控制
  globalSize: number // 全局大小倍数
  opacity: number // 透明度
  metalness: number // 金属度
  roughness: number // 粗糙度

  // 动画控制
  animationSpeed: number // 动画速度
  floatAmplitude: number // 浮动幅度
  pulseIntensity: number // 脉冲强度
  sizeVariation: number // 大小变化幅度
}

/**
 * 默认的西游记取经路径配置
 */
export const DEFAULT_JOURNEY_CONFIG: JourneyConfig = {
  pointCount: 81,
  maxRadius: 50,
  minRadius: 3,
  totalTurns: 4,
  waveHeight: 0,
  waveFrequency: 0.8,
  pointSize: 0.3,
  emissiveIntensity: 0.5,

  // 银河系悬臂参数
  armTightness: 8.0, // 悬臂紧密度 (控制对数螺旋的紧密程度)
  armIndex: 0, // 悬臂索引 (0-3, 选择哪条悬臂)

  // 球体外观控制
  globalSize: 1.3, // 全局大小倍数
  opacity: 1.0, // 透明度
  metalness: 0.3, // 金属度
  roughness: 1.0, // 粗糙度

  // 动画控制
  animationSpeed: 0.9, // 动画速度
  floatAmplitude: 0.4, // 浮动幅度
  pulseIntensity: 0.5, // 脉冲强度
  sizeVariation: 0.3, // 大小变化幅度
}

/**
 * 生成西游记九九八十一难的取经路径点
 * 使用银河系悬臂对数螺旋分布
 */
export function generateJourneyPoints(config: JourneyConfig = DEFAULT_JOURNEY_CONFIG): JourneyPoint[] {
  const {
    pointCount,
    maxRadius,
    minRadius,
    waveHeight,
    waveFrequency,
    pointSize,
    emissiveIntensity,
    armTightness,
    armIndex,
  } = config

  const points: JourneyPoint[] = []

  for (let i = 0; i < pointCount; i++) {
    // 计算进度比例 (0到1，从外到内)
    const progressRatio = i / (pointCount - 1)

    // 银河系悬臂对数螺旋：半径从外到内分布
    const radius = maxRadius - progressRatio * (maxRadius - minRadius)

    // 对数螺旋角度：模拟银河系悬臂效果
    const spiralAngle = Math.log(radius + 1) * armTightness + (armIndex * 2 * Math.PI / 4)

    // 计算3D位置
    const x = radius * Math.cos(spiralAngle)
    const z = radius * Math.sin(spiralAngle)
    const y = waveHeight * Math.sin(waveFrequency * spiralAngle)

    // 生成渐变颜色：从蓝色(起点)到金色(终点)
    const color = generateJourneyColor(progressRatio)

    // 计算发光强度：越接近终点越亮
    const currentEmissiveIntensity = emissiveIntensity * (0.3 + 0.7 * progressRatio)

    // 计算点的大小：重要节点稍大，添加更多变化
    const baseSize = pointSize * (0.8 + 0.4 * Math.sin(progressRatio * Math.PI))
    const sizeVariationFactor = 1 + (Math.sin(progressRatio * Math.PI * 4) * 0.3 + Math.cos(progressRatio * Math.PI * 6) * 0.2) * config.sizeVariation
    const currentRadius = baseSize * sizeVariationFactor

    const point: JourneyPoint = {
      id: `journey_${i}`,
      index: i,
      position: new Vector3(x, y, z),
      radius: currentRadius,
      color: color,
      emissiveIntensity: currentEmissiveIntensity,
      difficulty: `第${i + 1}难`, // 可以后续扩展为具体的难度名称
      userData: {
        spiralAngle,
        distanceFromCenter: radius,
        progressRatio,
      },
    }

    points.push(point)
  }

  return points
}

/**
 * 生成带有真实事件数据的西游记取经路径点
 * 使用银河系悬臂对数螺旋分布，并集成81难真实数据
 */
export function generateJourneyPointsWithEvents(
  config: JourneyConfig = DEFAULT_JOURNEY_CONFIG,
  eventsData: EventData[] = []
): JourneyPoint[] {
  const {
    pointCount,
    maxRadius,
    minRadius,
    waveHeight,
    waveFrequency,
    pointSize,
    emissiveIntensity,
    armTightness,
    armIndex,
  } = config

  const points: JourneyPoint[] = []

  for (let i = 0; i < pointCount; i++) {
    // 计算进度比例 (0到1，从外到内)
    const progressRatio = i / (pointCount - 1)

    // 银河系悬臂对数螺旋：半径从外到内分布
    const radius = maxRadius - progressRatio * (maxRadius - minRadius)

    // 对数螺旋角度：模拟银河系悬臂效果
    const spiralAngle = Math.log(radius + 1) * armTightness + (armIndex * 2 * Math.PI / 4)

    // 计算3D位置
    const x = radius * Math.cos(spiralAngle)
    const z = radius * Math.sin(spiralAngle)
    const y = waveHeight * Math.sin(waveFrequency * spiralAngle)

    // 生成渐变颜色：从蓝色(起点)到金色(终点)
    const color = generateJourneyColor(progressRatio)

    // 计算发光强度：越接近终点越亮
    const currentEmissiveIntensity = emissiveIntensity * (0.3 + 0.7 * progressRatio)

    // 计算点的大小：重要节点稍大，添加更多变化
    const baseSize = pointSize * (0.8 + 0.4 * Math.sin(progressRatio * Math.PI))
    const sizeVariationFactor = 1 + (Math.sin(progressRatio * Math.PI * 4) * 0.3 + Math.cos(progressRatio * Math.PI * 6) * 0.2) * config.sizeVariation
    const currentRadius = baseSize * sizeVariationFactor

    // 查找对应的事件数据 (i+1 对应难次)
    const eventData = eventsData.find(event => event.nanci === i + 1)

    // 使用真实数据或默认值
    const difficulty = eventData ? eventData.nanming : `第${i + 1}难`

    const point: JourneyPoint = {
      id: `journey_${i}`,
      index: i,
      position: new Vector3(x, y, z),
      radius: currentRadius,
      color: color,
      emissiveIntensity: currentEmissiveIntensity,
      difficulty: difficulty,
      eventData: eventData, // 添加真实事件数据
      userData: {
        spiralAngle,
        distanceFromCenter: radius,
        progressRatio,
      },
    }

    points.push(point)
  }

  return points
}

/**
 * 生成取经路径的渐变颜色
 * 从蓝色(起点)渐变到金色(终点)
 */
function generateJourneyColor(progressRatio: number): string {
  // 起点颜色：深蓝色 #1e40af
  const startColor = new Color(0x1e40af)

  // 中点颜色：紫色 #7c3aed
  const midColor = new Color(0x7c3aed)

  // 终点颜色：金色 #f59e0b
  const endColor = new Color(0xf59e0b)

  let resultColor: Color

  if (progressRatio < 0.5) {
    // 前半段：蓝色到紫色
    const localRatio = progressRatio * 2
    resultColor = startColor.clone().lerp(midColor, localRatio)
  } else {
    // 后半段：紫色到金色
    const localRatio = (progressRatio - 0.5) * 2
    resultColor = midColor.clone().lerp(endColor, localRatio)
  }

  return `#${resultColor.getHexString()}`
}

/**
 * 获取特定难度的详细信息
 * 可以扩展为包含具体的西游记故事情节
 */
export function getJourneyDifficultyInfo(index: number): {
  name: string
  description: string
  location: string
  type: 'demon' | 'natural' | 'divine' | 'human'
} {
  // 这里可以扩展为完整的81难数据
  // 目前返回基础信息
  return {
    name: `第${index + 1}难`,
    description: `西游记取经路上的第${index + 1}个磨难`,
    location: '未知地点',
    type: index % 4 === 0 ? 'demon' :
          index % 4 === 1 ? 'natural' :
          index % 4 === 2 ? 'divine' : 'human'
  }
}
