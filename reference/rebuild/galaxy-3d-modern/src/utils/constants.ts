import { GalaxyConfig, CameraConfig, SceneConfig, LightConfig } from '../types/galaxy';

// 默认银河系配置
export const DEFAULT_GALAXY_CONFIG: GalaxyConfig = {
  center: {
    radius: 8,
    cubeCount: 2000,
    cubeSize: 0.6,
    color: '#ffcc00',
    emissiveColor: '#ffaa00',
    emissiveIntensity: 0.8,
  },
  
  spiralArms: {
    armCount: 4,
    cubesPerArm: 1500,
    cubeSize: 0.5,
    maxDistance: 80,
    minDistance: 10,
    hueRange: [0.7, 0.9], // 蓝色到紫色
    verticalSpread: 4,
  },
  
  halo: {
    starCount: 1000,
    starSize: 0.2,
    minRadius: 80,
    maxRadius: 120,
    color: '#ffffff',
    emissiveIntensity: 0.3,
  },
  
  animation: {
    rotationSpeed: 0.002,
    floatingSpeed: 0.5,
    floatingAmplitude: 0.5,
  },
};

// 相机配置
export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  position: [0, 40, 80],
  fov: 60,
  near: 0.1,
  far: 1000,
};

// 场景配置
export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  background: '#000022',
  fog: {
    color: '#000022',
    near: 100,
    far: 300,
  },
};

// 光源配置
export const DEFAULT_LIGHT_CONFIG: LightConfig = {
  ambient: {
    color: '#333366',
    intensity: 1,
  },
  directional: {
    color: '#ffffff',
    intensity: 1,
    position: [5, 10, 7],
  },
  center: {
    color: '#ffcc00',
    intensity: 2,
    distance: 50,
  },
};

// UI文本常量
export const UI_TEXTS = {
  title: '三维银河系像素方块可视化',
  subtitle: '使用立方体像素展示银河系结构，包含中心密集区域和四条旋臂',
  loading: '正在生成银河系...',
  controls: [
    '鼠标拖拽 = 旋转视角',
    '鼠标滚轮 = 缩放',
    '右键拖拽 = 平移',
  ],
  infoPanel: {
    title: '银河系结构',
    items: [
      '• 中央核球：密集的黄色恒星群',
      '• 四条旋臂：蓝紫色立方体代表恒星系统',
      '• 星系晕：外围的稀疏恒星',
    ],
  },
  stats: {
    cubeCount: '8,000',
    galaxyRadius: '80,000 光年',
  },
  toggleButton: {
    pause: '暂停运动',
    resume: '开始运动',
  },
};

// 数学常量
export const MATH_CONSTANTS = {
  PI: Math.PI,
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI / 0.5,
};

// 性能配置
export const PERFORMANCE_CONFIG = {
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance' as WebGLPowerPreference,
};

// 控制器配置
export const CONTROLS_CONFIG = {
  enableDamping: true,
  dampingFactor: 0.05,
  rotateSpeed: 0.5,
  zoomSpeed: 1.0,
  panSpeed: 1.0,
  maxDistance: 200,
  minDistance: 10,
};
