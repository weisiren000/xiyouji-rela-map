import * as THREE from 'three';

/**
 * 星空场景配置接口
 */
export interface StarFieldConfig {
  /** 星星数量 */
  starCount: number;
  /** 星星大小 */
  starSize: number;
  /** 星星透明度 */
  starOpacity: number;
  /** 分布范围 */
  spread: number;
}

/**
 * 银河系配置接口
 */
export interface GalaxyConfig {
  /** 旋臂数量 */
  armCount: number;
  /** 每个旋臂的粒子数 */
  particlesPerArm: number;
  /** 核心大小 */
  coreSize: number;
  /** 旋转速度 */
  rotationSpeed: number;
}

/**
 * 场景配置接口
 */
export interface SceneConfig {
  /** 相机配置 */
  camera: {
    fov: number;
    near: number;
    far: number;
    position: THREE.Vector3;
  };
  /** 渲染器配置 */
  renderer: {
    antialias: boolean;
    pixelRatio: number;
  };
  /** 控制器配置 */
  controls: {
    enableDamping: boolean;
    dampingFactor: number;
  };
}

/**
 * 应用状态接口
 */
export interface AppState {
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否已初始化 */
  isInitialized: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 星星颜色类型
 */
export type StarColor = 'white' | 'blue' | 'yellow';

/**
 * 动画参数接口
 */
export interface AnimationParams {
  /** 时间 */
  time: number;
  /** 时间增量 */
  delta: number;
}

/**
 * 粒子系统接口
 */
export interface ParticleSystem {
  /** 几何体 */
  geometry: THREE.BufferGeometry;
  /** 材质 */
  material: THREE.PointsMaterial;
  /** 粒子对象 */
  points: THREE.Points;
  /** 更新方法 */
  update(params: AnimationParams): void;
  /** 销毁方法 */
  dispose(): void;
}
