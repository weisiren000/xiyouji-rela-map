import * as THREE from 'three';
import type { StarFieldConfig, ParticleSystem, AnimationParams } from '@/types';
import { DEFAULT_STARFIELD_CONFIG } from '@/utils/config';
import { getRandomPosition, getRandomStarColor } from '@/utils/helpers';

/**
 * 星空场景组件
 * 负责创建和管理星空中的星星粒子系统
 */
export class StarField implements ParticleSystem {
  /** 星星几何体 */
  public geometry: THREE.BufferGeometry;
  /** 星星材质 */
  public material: THREE.PointsMaterial;
  /** 星星粒子系统 */
  public points: THREE.Points;
  /** 原始位置数据 */
  private originalPositions: Float32Array;
  /** 随机偏移量 */
  private offset: number;
  /** 配置 */
  private config: StarFieldConfig;

  /**
   * 创建星空场景
   * @param config 星空配置
   */
  constructor(config: Partial<StarFieldConfig> = {}) {
    this.config = { ...DEFAULT_STARFIELD_CONFIG, ...config };
    this.offset = Math.random() * 100;
    
    // 创建几何体
    this.geometry = new THREE.BufferGeometry();
    
    // 创建材质
    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: this.config.starSize,
      transparent: true,
      opacity: this.config.starOpacity,
      vertexColors: true
    });
    
    // 创建顶点和颜色数据
    const positions: number[] = [];
    const colors: number[] = [];
    
    // 生成星星
    for (let i = 0; i < this.config.starCount; i++) {
      const position = getRandomPosition(this.config.spread);
      positions.push(position.x, position.y, position.z);
      
      const color = getRandomStarColor();
      colors.push(color.r, color.g, color.b);
    }
    
    // 设置几何体属性
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    // 创建粒子系统
    this.points = new THREE.Points(this.geometry, this.material);
    
    // 保存原始位置用于动画
    this.originalPositions = new Float32Array(positions);
  }

  /**
   * 更新星星动画
   * @param params 动画参数
   */
  public update(params: AnimationParams): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    
    // 星星闪烁效果
    for (let i = 0; i < positions.length; i += 3) {
      // 只改变Y坐标来模拟闪烁
      positions[i + 1] = this.originalPositions[i + 1] + 
        Math.sin(params.time * 0.001 + i * 0.01 + this.offset) * 2;
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
