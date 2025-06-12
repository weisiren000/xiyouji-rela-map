import * as THREE from 'three'
import { ColorPalette, AppConfig, NetworkFormation } from '@/types'

/**
 * 应用常量配置
 */
export const APP_CONSTANTS = {
  // 渲染器配置
  RENDERER: {
    ANTIALIAS: true,
    POWER_PREFERENCE: 'high-performance' as const,
    MAX_PIXEL_RATIO: 2,
    CLEAR_COLOR: 0x000000,
  },

  // 相机配置
  CAMERA: {
    FOV: 60,
    NEAR: 0.1,
    FAR: 1200,
    INITIAL_POSITION: new THREE.Vector3(0, 5, 22),
  },

  // 控制器配置
  CONTROLS: {
    ENABLE_DAMPING: true,
    DAMPING_FACTOR: 0.05,
    ROTATE_SPEED: 0.5,
    MIN_DISTANCE: 5,
    MAX_DISTANCE: 100,
    AUTO_ROTATE: true,
    AUTO_ROTATE_SPEED: 0.15,
    ENABLE_PAN: false,
  },

  // 后处理效果配置
  POST_PROCESSING: {
    BLOOM: {
      STRENGTH: 1.5,
      RADIUS: 0.4,
      THRESHOLD: 0.68,
    },
    FILM: {
      NOISE_INTENSITY: 0.35,
      SCANLINES_INTENSITY: 0.55,
      SCANLINES_COUNT: 2048,
      GRAYSCALE: false,
    },
  },

  // 脉冲配置
  PULSE: {
    MAX_COUNT: 3,
    SPEED: 15.0,
    DURATION: 3.0,
    THICKNESS: 2.0,
  },

  // 星空配置
  STARFIELD: {
    COUNT: 5000,
    MIN_RADIUS: 40,
    MAX_RADIUS: 120,
    SIZE: 0.15,
    OPACITY: 0.8,
  },

  // 雾效配置
  FOG: {
    COLOR: 0x000000,
    DENSITY: 0.0015,
  },

  // 网络生成配置
  NETWORK: {
    BASE_NODE_SIZE: 0.5,
    MAX_CONNECTIONS_PER_NODE: 5,
    CONNECTION_PROBABILITY: 0.3,
  },
} as const

/**
 * 颜色调色板
 */
export const COLOR_PALETTES: ColorPalette[] = [
  // 紫色系
  [
    new THREE.Color(0x4F46E5),
    new THREE.Color(0x7C3AED),
    new THREE.Color(0xC026D3),
    new THREE.Color(0xDB2777),
    new THREE.Color(0x8B5CF6),
  ],
  // 橙红系
  [
    new THREE.Color(0xF59E0B),
    new THREE.Color(0xF97316),
    new THREE.Color(0xDC2626),
    new THREE.Color(0x7F1D1D),
    new THREE.Color(0xFBBF24),
  ],
  // 粉蓝系
  [
    new THREE.Color(0xEC4899),
    new THREE.Color(0x8B5CF6),
    new THREE.Color(0x6366F1),
    new THREE.Color(0x3B82F6),
    new THREE.Color(0xA855F7),
  ],
  // 绿黄系
  [
    new THREE.Color(0x10B981),
    new THREE.Color(0xA3E635),
    new THREE.Color(0xFACC15),
    new THREE.Color(0xFB923C),
    new THREE.Color(0x4ADE80),
  ],
]

/**
 * 默认应用配置
 */
export const DEFAULT_CONFIG: AppConfig = {
  paused: false,
  activePaletteIndex: 1,
  currentFormation: NetworkFormation.QUANTUM_CORTEX,
  numFormations: 4,
  densityFactor: 1.0,
}

/**
 * 网络形态名称映射
 */
export const FORMATION_NAMES: Record<NetworkFormation, string> = {
  [NetworkFormation.QUANTUM_CORTEX]: '量子皮层',
  [NetworkFormation.HYPERDIMENSIONAL_MESH]: '超维网格',
  [NetworkFormation.NEURAL_VORTEX]: '神经漩涡',
  [NetworkFormation.SYNAPTIC_CLOUD]: '突触云',
}

/**
 * UI文本常量
 */
export const UI_TEXT = {
  TITLE: '交互式神经网络',
  SUBTITLE: '点击或拖拽创建能量脉冲穿过网络。拖拽旋转视角。',
  THEME_SELECTOR_TITLE: '视觉主题',
  DENSITY_LABEL: '密度',
  BUTTONS: {
    FORMATION: '形态',
    PAUSE: '暂停',
    PLAY: '播放',
    RESET_CAMERA: '重置相机',
  },
  LOADING: '加载神经网络...',
} as const

/**
 * 性能配置
 */
export const PERFORMANCE_CONFIG = {
  // 帧率目标
  TARGET_FPS: 60,
  
  // 性能监控间隔（毫秒）
  MONITOR_INTERVAL: 1000,
  
  // 自动降级阈值
  AUTO_DOWNGRADE: {
    MIN_FPS: 30,
    CONSECUTIVE_FRAMES: 60,
  },
  
  // LOD（细节层次）配置
  LOD: {
    HIGH_DETAIL_DISTANCE: 20,
    MEDIUM_DETAIL_DISTANCE: 50,
    LOW_DETAIL_DISTANCE: 100,
  },
} as const

/**
 * 调试配置
 */
export const DEBUG_CONFIG = {
  ENABLED: typeof import.meta !== 'undefined' ? import.meta.env?.DEV ?? false : false,
  SHOW_STATS: false,
  SHOW_HELPERS: false,
  LOG_PERFORMANCE: false,
  WIREFRAME_MODE: false,
} as const
