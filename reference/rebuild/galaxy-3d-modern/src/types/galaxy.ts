import * as THREE from 'three';

// 银河系组件的基础类型定义
export interface GalaxyConfig {
  // 中央核球配置
  center: {
    radius: number;
    cubeCount: number;
    cubeSize: number;
    color: string;
    emissiveColor: string;
    emissiveIntensity: number;
  };
  
  // 螺旋臂配置
  spiralArms: {
    armCount: number;
    cubesPerArm: number;
    cubeSize: number;
    maxDistance: number;
    minDistance: number;
    hueRange: [number, number];
    verticalSpread: number;
  };
  
  // 星系晕配置
  halo: {
    starCount: number;
    starSize: number;
    minRadius: number;
    maxRadius: number;
    color: string;
    emissiveIntensity: number;
  };
  
  // 动画配置
  animation: {
    rotationSpeed: number;
    floatingSpeed: number;
    floatingAmplitude: number;
  };
}

// 螺旋臂立方体数据
export interface SpiralCubeData {
  mesh: THREE.Mesh;
  originalY: number;
  timeOffset: number;
  armIndex: number;
}

// 相机控制配置
export interface CameraConfig {
  position: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

// 场景配置
export interface SceneConfig {
  background: string;
  fog: {
    color: string;
    near: number;
    far: number;
  };
}

// 光源配置
export interface LightConfig {
  ambient: {
    color: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  center: {
    color: string;
    intensity: number;
    distance: number;
  };
}

// UI状态
export interface UIState {
  isLoading: boolean;
  progress: number;
  isAnimating: boolean;
  cubeCount: number;
  galaxyRadius: string;
}

// 组件Props类型
export interface GalaxyProps {
  config: GalaxyConfig;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export interface HeaderProps {
  title: string;
  subtitle: string;
}

export interface ControlsProps {
  instructions: string[];
}

export interface InfoPanelProps {
  title: string;
  items: string[];
}

export interface StatsProps {
  cubeCount: number;
  galaxyRadius: string;
}

export interface ToggleButtonProps {
  isAnimating: boolean;
  onToggle: () => void;
}

export interface LoadingProps {
  progress: number;
  isVisible: boolean;
}
