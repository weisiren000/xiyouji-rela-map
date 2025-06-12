import * as THREE from 'three'

/**
 * 应用配置接口
 */
export interface AppConfig {
  paused: boolean
  activePaletteIndex: number
  currentFormation: number
  numFormations: number
  densityFactor: number
}

/**
 * 颜色主题类型
 */
export type ColorPalette = THREE.Color[]

/**
 * 网络形态类型
 */
export enum NetworkFormation {
  QUANTUM_CORTEX = 0,
  HYPERDIMENSIONAL_MESH = 1,
  NEURAL_VORTEX = 2,
  SYNAPTIC_CLOUD = 3
}

/**
 * 节点类型
 */
export enum NodeType {
  CORE = 0,
  LEAF = 1
}

/**
 * 节点连接接口
 */
export interface NodeConnection {
  node: NetworkNode
  strength: number
}

/**
 * 网络节点接口
 */
export interface NetworkNode {
  position: THREE.Vector3
  connections: NodeConnection[]
  level: number
  type: NodeType
  size: number
  distanceFromRoot: number
  // 可选属性，用于特定形态
  dimension?: number
  spiralIndex?: number
  spiralPosition?: number
  clusterRef?: NetworkNode
}

/**
 * 脉冲数据接口
 */
export interface PulseData {
  position: THREE.Vector3
  time: number
  color: THREE.Color
}

/**
 * 着色器制服变量接口
 */
export interface ShaderUniforms {
  [uniform: string]: { value: any }
  uTime: { value: number }
  uPulsePositions: { value: THREE.Vector3[] }
  uPulseTimes: { value: number[] }
  uPulseColors: { value: THREE.Color[] }
  uPulseSpeed: { value: number }
  uBaseNodeSize: { value: number }
  uActivePalette: { value: number }
}

/**
 * 渲染器配置接口
 */
export interface RendererConfig {
  antialias: boolean
  powerPreference: 'default' | 'high-performance' | 'low-power'
  pixelRatio: number
}

/**
 * 相机配置接口
 */
export interface CameraConfig {
  fov: number
  near: number
  far: number
  position: THREE.Vector3
}

/**
 * 控制器配置接口
 */
export interface ControlsConfig {
  enableDamping: boolean
  dampingFactor: number
  rotateSpeed: number
  minDistance: number
  maxDistance: number
  autoRotate: boolean
  autoRotateSpeed: number
  enablePan: boolean
}

/**
 * 后处理效果配置接口
 */
export interface PostProcessingConfig {
  bloom: {
    strength: number
    radius: number
    threshold: number
  }
  film: {
    noiseIntensity: number
    scanlinesIntensity: number
    scanlinesCount: number
    grayscale: boolean
  }
}

/**
 * UI面板配置接口
 */
export interface UIPanelConfig {
  visible: boolean
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  opacity: number
}

/**
 * 事件类型
 */
export enum EventType {
  FORMATION_CHANGE = 'formation-change',
  THEME_CHANGE = 'theme-change',
  DENSITY_CHANGE = 'density-change',
  PAUSE_TOGGLE = 'pause-toggle',
  CAMERA_RESET = 'camera-reset',
  PULSE_CREATE = 'pulse-create'
}

/**
 * 事件数据接口
 */
export interface EventData {
  type: EventType
  payload?: any
}

/**
 * 性能监控接口
 */
export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  drawCalls: number
  triangles: number
}
