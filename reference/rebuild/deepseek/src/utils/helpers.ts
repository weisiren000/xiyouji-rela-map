import * as THREE from 'three';
import type { StarColor } from '@/types';
import { COLORS, STAR_COLOR_PROBABILITIES } from './config';

/**
 * 生成随机星星颜色
 * @returns THREE.Color 星星颜色
 */
export function getRandomStarColor(): THREE.Color {
  const rand = Math.random();
  
  if (rand < STAR_COLOR_PROBABILITIES.blue) {
    return COLORS.starBlue.clone();
  } else if (rand < STAR_COLOR_PROBABILITIES.blue + STAR_COLOR_PROBABILITIES.yellow) {
    return COLORS.starYellow.clone();
  } else {
    return new THREE.Color(COLORS.starWhite);
  }
}

/**
 * 生成随机位置
 * @param spread 分布范围
 * @returns THREE.Vector3 随机位置
 */
export function getRandomPosition(spread: number): THREE.Vector3 {
  return new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(spread),
    THREE.MathUtils.randFloatSpread(spread),
    THREE.MathUtils.randFloatSpread(spread)
  );
}

/**
 * 创建银河系旋臂位置
 * @param armIndex 旋臂索引
 * @param particleIndex 粒子索引
 * @param totalArms 总旋臂数
 * @param particlesPerArm 每个旋臂的粒子数
 * @returns THREE.Vector3 旋臂位置
 */
export function getGalaxyArmPosition(
  armIndex: number,
  particleIndex: number,
  totalArms: number,
  particlesPerArm: number
): THREE.Vector3 {
  const angleOffset = (armIndex * Math.PI * 2) / totalArms;
  const radius = 30 + particleIndex * 0.1;
  const angle = angleOffset + (particleIndex * 0.02) + Math.sin(particleIndex * 0.05) * 0.5;
  
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius * 0.2;
  const z = Math.sin(angle) * radius;
  
  return new THREE.Vector3(x, y, z);
}

/**
 * 创建银河系旋臂颜色渐变
 * @param particleIndex 粒子索引
 * @param particlesPerArm 每个旋臂的粒子数
 * @returns THREE.Color 渐变颜色
 */
export function getGalaxyArmColor(particleIndex: number, particlesPerArm: number): THREE.Color {
  const t = particleIndex / particlesPerArm;
  const color = new THREE.Color();
  
  // 从中心黄色到边缘蓝色的渐变
  color.r = 1.0 * (1 - t) + 0.4 * t;
  color.g = 0.8 * (1 - t) + 0.6 * t;
  color.b = 0.2 * (1 - t) + 1.0 * t;
  
  return color;
}

/**
 * 处理窗口大小调整
 * @param camera 相机对象
 * @param renderer 渲染器对象
 */
export function handleResize(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * 显示/隐藏加载界面
 * @param show 是否显示
 */
export function toggleLoading(show: boolean): void {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    if (show) {
      loadingElement.classList.remove('hidden');
    } else {
      loadingElement.classList.add('hidden');
    }
  }
}

/**
 * 更新星星计数显示
 * @param count 星星数量
 */
export function updateStarCount(count: number): void {
  const starsCountElement = document.getElementById('stars-count');
  if (starsCountElement) {
    starsCountElement.textContent = `${count.toLocaleString()} 颗星星正在闪耀`;
  }
}

/**
 * 错误处理函数
 * @param error 错误对象
 * @param context 错误上下文
 */
export function handleError(error: Error, context: string): void {
  console.error(`[${context}] 错误:`, error);
  
  // 可以在这里添加错误上报逻辑
  // 或者显示用户友好的错误信息
}

/**
 * 性能监控函数
 * @param name 监控名称
 * @param fn 要监控的函数
 */
export function performanceMonitor<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`[性能监控] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}
