import * as THREE from 'three';
import type { GalaxyConfig, AnimationParams } from '@/types';
import { DEFAULT_GALAXY_CONFIG, COLORS } from '@/utils/config';
import { getGalaxyArmPosition, getGalaxyArmColor } from '@/utils/helpers';

/**
 * 银河系组件
 * 负责创建和管理银河系的核心和旋臂
 */
export class Galaxy {
  /** 银河系组 */
  public group: THREE.Group;
  /** 银河系核心 */
  private core: THREE.Mesh;
  /** 银河系旋臂 */
  private arms: THREE.Points;
  /** 配置 */
  private config: GalaxyConfig;

  /**
   * 创建银河系
   * @param config 银河系配置
   */
  constructor(config: Partial<GalaxyConfig> = {}) {
    this.config = { ...DEFAULT_GALAXY_CONFIG, ...config };
    this.group = new THREE.Group();
    
    this.createCore();
    this.createArms();
  }

  /**
   * 创建银河系核心
   */
  private createCore(): void {
    const coreGeometry = new THREE.SphereGeometry(this.config.coreSize, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.galaxyCore,
      transparent: true,
      opacity: 0.7
    });
    
    this.core = new THREE.Mesh(coreGeometry, coreMaterial);
    this.group.add(this.core);
  }

  /**
   * 创建银河系旋臂
   */
  private createArms(): void {
    const armGeometry = new THREE.BufferGeometry();
    const armMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });
    
    const armVertices: number[] = [];
    const armColors: number[] = [];
    
    // 创建旋臂
    for (let arm = 0; arm < this.config.armCount; arm++) {
      for (let i = 0; i < this.config.particlesPerArm; i++) {
        const position = getGalaxyArmPosition(
          arm, 
          i, 
          this.config.armCount, 
          this.config.particlesPerArm
        );
        
        armVertices.push(position.x, position.y, position.z);
        
        const color = getGalaxyArmColor(i, this.config.particlesPerArm);
        armColors.push(color.r, color.g, color.b);
      }
    }
    
    armGeometry.setAttribute('position', new THREE.Float32BufferAttribute(armVertices, 3));
    armGeometry.setAttribute('color', new THREE.Float32BufferAttribute(armColors, 3));
    
    this.arms = new THREE.Points(armGeometry, armMaterial);
    this.group.add(this.arms);
  }

  /**
   * 更新银河系动画
   * @param params 动画参数
   */
  public update(params: AnimationParams): void {
    // 旋转银河系
    this.group.rotation.y += params.delta * this.config.rotationSpeed;
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    // 释放核心资源
    this.core.geometry.dispose();
    (this.core.material as THREE.Material).dispose();
    
    // 释放旋臂资源
    this.arms.geometry.dispose();
    (this.arms.material as THREE.Material).dispose();
    
    // 清空组
    this.group.clear();
  }
}
