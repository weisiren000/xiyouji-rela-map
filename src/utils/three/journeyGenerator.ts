import { Vector3, Color } from 'three'

/**
 * 西游记取经路径点接口 - 增强版，包含事件数据
 */
export interface JourneyPoint {
  id: string
  index: number // 0-80，代表第几难
  position: Vector3
  radius: number
  color: string
  emissiveIntensity: number
  // 事件数据
  eventData?: EventData | null
  difficulty: string // 难度名称
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
  roughness: 0.2, // 粗糙度

  // 动画控制
  animationSpeed: 0.9, // 动画速度
  floatAmplitude: 0.4, // 浮动幅度
  pulseIntensity: 0.5, // 脉冲强度
  sizeVariation: 0.3, // 大小变化幅度
}

/**
 * 生成西游记九九八十一难的取经路径点
 * 使用银河系悬臂对数螺旋分布
 * 可以选择性地包含真实的事件数据
 */
export function generateJourneyPoints(
  config: JourneyConfig = DEFAULT_JOURNEY_CONFIG,
  eventsData?: EventData[]
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

    // 获取对应的事件数据
    const eventData = eventsData?.find(event => event.nanci === i + 1)
    
    // 生成渐变颜色：从蓝色(起点)到金色(终点)
    // 如果有事件数据，可以根据事件类型调整颜色
    const color = generateJourneyColor(progressRatio, eventData)

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
      difficulty: eventData?.nanming || `第${i + 1}难`, // 使用真实的难名或默认名称
      userData: {
        spiralAngle,
        distanceFromCenter: radius,
        progressRatio,
      },
      eventData, // 包含完整的事件数据
    }

    points.push(point)
  }

  return points
}

/**
 * 生成取经路径的渐变颜色
 * 从蓝色(起点)渐变到金色(终点)
 * 可以根据事件数据调整颜色
 */
function generateJourneyColor(progressRatio: number, eventData?: EventData): string {
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

  // 如果有事件数据，可以根据内容调整颜色强度
  if (eventData) {
    // 根据文化内涵或象征意义调整颜色深浅
    const hasDeepMeaning = eventData.wenhuaneihan.length > 10 || eventData.xiangzhengyi.length > 10
    if (hasDeepMeaning) {
      // 有深层文化内涵的事件使用更亮的颜色
      resultColor.multiplyScalar(1.2)
    }
  }

  return `#${resultColor.getHexString()}`
}

/**
 * 获取特定难度的详细信息
 * 整合真实的西游记事件数据
 */
export function getJourneyDifficultyInfo(index: number, eventData?: EventData): {
  name: string
  description: string
  location: string
  type: 'demon' | 'natural' | 'divine' | 'human'
  characters: string[]
  culturalMeaning: string
  symbolism: string
} {
  if (eventData) {
    // 使用真实的事件数据
    return {
      name: eventData.nanming,
      description: eventData.shijianmiaoshu,
      location: eventData.didian,
      type: determineEventType(eventData),
      characters: eventData.zhuyaorenwu.split('、').filter(name => name.trim()),
      culturalMeaning: eventData.wenhuaneihan,
      symbolism: eventData.xiangzhengyi,
    }
  }

  // 回退到基础信息
  return {
    name: `第${index + 1}难`,
    description: `西游记取经路上的第${index + 1}个磨难`,
    location: '未知地点',
    type: index % 4 === 0 ? 'demon' :
          index % 4 === 1 ? 'natural' :
          index % 4 === 2 ? 'divine' : 'human',
    characters: [],
    culturalMeaning: '',
    symbolism: '',
  }
}

/**
 * 根据事件内容判断事件类型
 */
function determineEventType(eventData: EventData): 'demon' | 'natural' | 'divine' | 'human' {
  const description = eventData.shijianmiaoshu.toLowerCase()
  const characters = eventData.zhuyaorenwu.toLowerCase()
  
  // 妖魔类：包含妖、怪、精、魔等
  if (description.includes('妖') || description.includes('怪') || 
      description.includes('精') || description.includes('魔') ||
      characters.includes('妖') || characters.includes('怪')) {
    return 'demon'
  }
  
  // 神仙类：包含佛、神、仙、菩萨等
  if (description.includes('佛') || description.includes('神') || 
      description.includes('仙') || description.includes('菩萨') ||
      characters.includes('佛') || characters.includes('观音') ||
      characters.includes('如来')) {
    return 'divine'
  }
  
  // 自然类：包含山、水、河、天气等
  if (description.includes('山') || description.includes('河') || 
      description.includes('水') || description.includes('风') ||
      description.includes('雨') || description.includes('火')) {
    return 'natural'
  }
  
  // 默认为人类
  return 'human'
}

/**
 * 异步生成带有事件数据的西游记取经路径点
 */
export async function generateJourneyPointsWithEvents(
  config: JourneyConfig = DEFAULT_JOURNEY_CONFIG
): Promise<JourneyPoint[]> {
  try {
    // 首先获取所有事件数据
    const response = await fetch('http://localhost:3003/api/events')
    let eventsData: EventData[] = []
    
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        eventsData = result.data
        console.log(`📚 成功获取 ${eventsData.length} 个事件数据`)
      }
    } else {
      console.warn('⚠️ 无法获取事件数据，使用默认名称')
    }

    // 生成基础的路径点
    const basePoints = generateJourneyPoints(config)
    
    // 为每个点添加事件数据
    const pointsWithEvents = basePoints.map((point, index) => {
      const eventData = eventsData.find(event => event.nanci === index + 1)
      
      return {
        ...point,
        eventData,
        difficulty: eventData ? eventData.nanming : `第${index + 1}难`,
      }
    })

    console.log(`✅ 成功生成 ${pointsWithEvents.length} 个带事件数据的路径点`)
    return pointsWithEvents
    
  } catch (error) {
    console.error('❌ 生成带事件数据的路径点失败:', error)
    // 回退到基础生成器
    const basePoints = generateJourneyPoints(config)
    return basePoints.map((point, index) => ({
      ...point,
      eventData: null,
      difficulty: `第${index + 1}难`,
    }))
  }
}

/**
 * 事件数据接口（临时定义，避免导入错误）
 */
interface EventData {
  id: number
  nanci: number
  nanming: string
  zhuyaorenwu: string
  didian: string
  shijianmiaoshu: string
  xiangzhengyi: string
  wenhuaneihan: string
}
