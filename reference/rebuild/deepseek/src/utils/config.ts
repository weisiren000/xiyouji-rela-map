import * as THREE from 'three';
import type { StarFieldConfig, GalaxyConfig, SceneConfig } from '@/types';

/**
 * 星空场景默认配置
 */
export const DEFAULT_STARFIELD_CONFIG: StarFieldConfig = {
  starCount: 10000,
  starSize: 0.7,
  starOpacity: 0.8,
  spread: 2000
};

/**
 * 银河系默认配置
 */
export const DEFAULT_GALAXY_CONFIG: GalaxyConfig = {
  armCount: 4,
  particlesPerArm: 1500,
  coreSize: 20,
  rotationSpeed: 0.0001
};

/**
 * 场景默认配置
 */
export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  camera: {
    fov: 75,
    near: 0.1,
    far: 2000,
    position: new THREE.Vector3(0, 0, 200)
  },
  renderer: {
    antialias: true,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
  },
  controls: {
    enableDamping: true,
    dampingFactor: 0.05
  }
};

/**
 * 颜色配置
 */
export const COLORS = {
  background: 0x000011,
  starWhite: 0xffffff,
  starBlue: new THREE.Color(0.8, 0.8, 1.0),
  starYellow: new THREE.Color(1.0, 1.0, 0.7),
  galaxyCore: 0xffff00,
  ambientLight: 0x333333
} as const;

/**
 * 动画配置
 */
export const ANIMATION_CONFIG = {
  twinkleSpeed: 0.001,
  twinkleAmplitude: 2,
  loadingDelay: 2000
} as const;

/**
 * 星星颜色概率配置
 */
export const STAR_COLOR_PROBABILITIES = {
  blue: 0.1,    // 10% 蓝色星星
  yellow: 0.1,  // 10% 黄色星星
  white: 0.8    // 80% 白色星星
} as const;
