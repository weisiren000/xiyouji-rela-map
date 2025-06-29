/**
 * 事件角色关系图谱配置类型定义
 */

export interface EventCharacterGraphConfig {
  // 球体基础属性
  baseSize: number              // 基础大小倍数 (默认: 0.8)
  opacity: number               // 透明度 (默认: 1.0)
  metalness: number             // 金属度 (默认: 0.3)
  roughness: number             // 粗糙度 (默认: 1.0)
  
  // 动画效果
  floatIntensity: number        // 浮动强度 (默认: 0.3)
  floatSpeed: number            // 浮动速度 (默认: 2.0)
  pulseIntensity: number        // 脉冲强度 (默认: 0.1)
  pulseSpeed: number            // 脉冲速度 (默认: 3.0)
  rotationSpeed: number         // 旋转速度 (默认: 0.3)
  rotationAmplitude: number     // 旋转幅度 (默认: 0.1)
  
  // 交互状态倍数
  hoverSizeMultiplier: number   // 悬浮时大小倍数 (默认: 1.1)
  longPressSizeMultiplier: number // 长按时大小倍数 (默认: 1.3)
  dragSizeMultiplier: number    // 拖拽时大小倍数 (默认: 1.5)
  
  // 交互状态颜色
  hoverColorMultiplier: number  // 悬浮时颜色倍数 (默认: 1.3)
  longPressGoldLerp: number     // 长按时金色混合度 (默认: 0.5)
  dragGoldMultiplier: number    // 拖拽时金色倍数 (默认: 2.0)
  
  // 连接线属性
  lineOpacity: number           // 连接线透明度 (默认: 0.3)
  lineOpacityDrag: number       // 拖拽时连接线透明度 (默认: 1.0)
  lineWidth: number             // 连接线宽度 (默认: 2)
  
  // 几何体属性
  sphereSegments: number        // 球体分段数 (默认: 32)
  sphereRings: number           // 球体环数 (默认: 32)
}

/**
 * 默认配置
 */
export const DEFAULT_EVENT_CHARACTER_GRAPH_CONFIG: EventCharacterGraphConfig = {
  // 球体基础属性
  baseSize: 0.8,
  opacity: 1.0,
  metalness: 0.3,
  roughness: 1.0,
  
  // 动画效果
  floatIntensity: 0.3,
  floatSpeed: 2.0,
  pulseIntensity: 0.1,
  pulseSpeed: 3.0,
  rotationSpeed: 0.3,
  rotationAmplitude: 0.1,
  
  // 交互状态倍数
  hoverSizeMultiplier: 1.1,
  longPressSizeMultiplier: 1.3,
  dragSizeMultiplier: 1.5,
  
  // 交互状态颜色
  hoverColorMultiplier: 1.3,
  longPressGoldLerp: 0.5,
  dragGoldMultiplier: 2.0,
  
  // 连接线属性
  lineOpacity: 0.3,
  lineOpacityDrag: 1.0,
  lineWidth: 2,
  
  // 几何体属性
  sphereSegments: 32,
  sphereRings: 32
}

/**
 * 预设配置
 */
export const EVENT_CHARACTER_GRAPH_PRESETS = {
  default: {
    name: '默认',
    config: DEFAULT_EVENT_CHARACTER_GRAPH_CONFIG
  },
  
  subtle: {
    name: '低调',
    config: {
      ...DEFAULT_EVENT_CHARACTER_GRAPH_CONFIG,
      floatIntensity: 0.1,
      pulseIntensity: 0.05,
      hoverSizeMultiplier: 1.05,
      longPressSizeMultiplier: 1.1,
      dragSizeMultiplier: 1.2,
      opacity: 0.6,
      lineOpacity: 0.2
    }
  },
  
  dynamic: {
    name: '动感',
    config: {
      ...DEFAULT_EVENT_CHARACTER_GRAPH_CONFIG,
      floatIntensity: 0.5,
      floatSpeed: 3.0,
      pulseIntensity: 0.2,
      pulseSpeed: 4.0,
      rotationSpeed: 0.5,
      hoverSizeMultiplier: 1.2,
      longPressSizeMultiplier: 1.4,
      dragSizeMultiplier: 1.8
    }
  },
  
  elegant: {
    name: '优雅',
    config: {
      ...DEFAULT_EVENT_CHARACTER_GRAPH_CONFIG,
      floatIntensity: 0.2,
      floatSpeed: 1.5,
      pulseIntensity: 0.08,
      pulseSpeed: 2.5,
      metalness: 0.5,
      roughness: 1.0,
      opacity: 0.9,
      lineOpacity: 0.4
    }
  },
  
  performance: {
    name: '性能优化',
    config: {
      ...DEFAULT_EVENT_CHARACTER_GRAPH_CONFIG,
      sphereSegments: 8,
      sphereRings: 8,
      floatIntensity: 0.2,
      pulseIntensity: 0.05,
      rotationSpeed: 0.2
    }
  }
}
