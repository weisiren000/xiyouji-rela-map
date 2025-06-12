import * as THREE from 'three';
import { MATH_CONSTANTS } from './constants';

/**
 * 生成球坐标系中的随机点
 * @param minRadius 最小半径
 * @param maxRadius 最大半径
 * @returns 笛卡尔坐标 [x, y, z]
 */
export function generateSpherePoint(minRadius: number, maxRadius: number): [number, number, number] {
  const phi = Math.random() * MATH_CONSTANTS.TWO_PI;
  const theta = Math.random() * MATH_CONSTANTS.PI;
  const radius = Math.random() * (maxRadius - minRadius) + minRadius;
  
  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(theta) * Math.sin(phi);
  
  return [x, y, z];
}

/**
 * 生成螺旋臂上的点
 * @param armIndex 螺旋臂索引 (0-3)
 * @param pointIndex 点在螺旋臂上的索引
 * @param totalPoints 螺旋臂总点数
 * @param minDistance 最小距离
 * @param maxDistance 最大距离
 * @param armCount 总螺旋臂数量
 * @returns 笛卡尔坐标 [x, y, z]
 */
export function generateSpiralArmPoint(
  armIndex: number,
  pointIndex: number,
  totalPoints: number,
  minDistance: number,
  maxDistance: number,
  armCount: number
): [number, number, number] {
  // 基础螺旋臂角度
  const baseAngle = (armIndex / armCount) * MATH_CONSTANTS.TWO_PI;
  
  // 使用对数螺旋线方程：r = a * e^(bθ)
  // 这里简化为线性增长加上螺旋角度
  const angle = baseAngle + (pointIndex / 100);
  const distance = minDistance + (pointIndex / totalPoints) * (maxDistance - minDistance);
  
  // 添加随机偏移使旋臂更自然
  const offset = (Math.random() - 0.5) * 5;
  const x = Math.cos(angle) * (distance + offset);
  const z = Math.sin(angle) * (distance + offset);
  const y = (Math.random() - 0.5) * 4;
  
  return [x, y, z];
}

/**
 * 生成随机颜色（HSL格式）
 * @param hueMin 色相最小值 (0-1)
 * @param hueMax 色相最大值 (0-1)
 * @param saturation 饱和度 (0-1)
 * @param lightness 亮度 (0-1)
 * @returns THREE.Color对象
 */
export function generateRandomColor(
  hueMin: number,
  hueMax: number,
  saturation: number = 0.8,
  lightness: number = 0.6
): THREE.Color {
  const hue = hueMin + Math.random() * (hueMax - hueMin);
  return new THREE.Color().setHSL(hue, saturation, lightness);
}

/**
 * 生成随机旋转
 * @returns [x, y, z] 旋转角度（弧度）
 */
export function generateRandomRotation(): [number, number, number] {
  return [
    Math.random() * MATH_CONSTANTS.PI,
    Math.random() * MATH_CONSTANTS.PI,
    Math.random() * MATH_CONSTANTS.PI,
  ];
}

/**
 * 计算两点之间的距离
 * @param point1 第一个点 [x, y, z]
 * @param point2 第二个点 [x, y, z]
 * @returns 距离
 */
export function calculateDistance(
  point1: [number, number, number],
  point2: [number, number, number]
): number {
  const [x1, y1, z1] = point1;
  const [x2, y2, z2] = point2;
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
}

/**
 * 将角度从度转换为弧度
 * @param degrees 角度（度）
 * @returns 弧度
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (MATH_CONSTANTS.PI / 180);
}

/**
 * 将弧度转换为角度
 * @param radians 弧度
 * @returns 角度（度）
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / MATH_CONSTANTS.PI);
}

/**
 * 线性插值
 * @param start 起始值
 * @param end 结束值
 * @param factor 插值因子 (0-1)
 * @returns 插值结果
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * 将值限制在指定范围内
 * @param value 值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 生成噪声值（简单的伪随机噪声）
 * @param x x坐标
 * @param y y坐标
 * @param z z坐标
 * @returns 噪声值 (-1 到 1)
 */
export function simpleNoise(x: number, y: number, z: number): number {
  // 简单的伪随机噪声函数
  const seed = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return (seed - Math.floor(seed)) * 2 - 1;
}
