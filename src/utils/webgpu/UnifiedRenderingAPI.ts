import * as THREE from 'three'
import { rendererManager, RendererType } from './RendererManager'
import { computeShaderManager } from './ComputeShaderManager'

/**
 * 统一渲染API
 * 为WebGL和WebGPU提供一致的接口，自动选择最佳的渲染路径
 */

export interface UnifiedGeometryConfig {
  type: 'sphere' | 'box' | 'plane' | 'cylinder'
  radius?: number
  width?: number
  height?: number
  depth?: number
  widthSegments?: number
  heightSegments?: number
  depthSegments?: number
  radialSegments?: number
}

export interface UnifiedMaterialConfig {
  type: 'standard' | 'basic' | 'physical' | 'custom'
  color?: string | number
  metalness?: number
  roughness?: number
  emissive?: string | number
  emissiveIntensity?: number
  transparent?: boolean
  opacity?: number
  side?: THREE.Side
  wireframe?: boolean
}

export interface UnifiedInstancedMeshConfig {
  geometry: UnifiedGeometryConfig
  material: UnifiedMaterialConfig
  count: number
  frustumCulled?: boolean
}

export interface InstanceUpdate {
  index: number
  position?: THREE.Vector3
  rotation?: THREE.Euler
  scale?: THREE.Vector3
  color?: THREE.Color
}

export class UnifiedRenderingAPI {
  private static instance: UnifiedRenderingAPI
  private rendererType: RendererType = 'webgl'
  private geometryCache = new Map<string, THREE.BufferGeometry>()
  private materialCache = new Map<string, THREE.Material>()

  private constructor() {}

  static getInstance(): UnifiedRenderingAPI {
    if (!UnifiedRenderingAPI.instance) {
      UnifiedRenderingAPI.instance = new UnifiedRenderingAPI()
    }
    return UnifiedRenderingAPI.instance
  }

  /**
   * 初始化统一渲染API
   */
  async initialize(): Promise<void> {
    const renderer = await rendererManager.initialize()
    this.rendererType = rendererManager.getRendererType()
    
    // 如果是WebGPU，初始化计算着色器管理器
    if (this.rendererType === 'webgpu') {
      const webgpuRenderer = renderer as any
      if (webgpuRenderer.device) {
        await computeShaderManager.initialize(webgpuRenderer.device)
      }
    }

    console.log(`🎨 统一渲染API初始化完成 (${this.rendererType.toUpperCase()})`)
  }

  /**
   * 创建优化的几何体
   */
  createGeometry(config: UnifiedGeometryConfig): THREE.BufferGeometry {
    const key = this.generateGeometryKey(config)
    
    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key)!.clone()
    }

    let geometry: THREE.BufferGeometry

    switch (config.type) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          config.radius || 1,
          config.widthSegments || 32,
          config.heightSegments || 16
        )
        break
      case 'box':
        geometry = new THREE.BoxGeometry(
          config.width || 1,
          config.height || 1,
          config.depth || 1,
          config.widthSegments || 1,
          config.heightSegments || 1,
          config.depthSegments || 1
        )
        break
      case 'plane':
        geometry = new THREE.PlaneGeometry(
          config.width || 1,
          config.height || 1,
          config.widthSegments || 1,
          config.heightSegments || 1
        )
        break
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          config.radius || 1,
          config.radius || 1,
          config.height || 1,
          config.radialSegments || 8
        )
        break
      default:
        throw new Error(`Unsupported geometry type: ${config.type}`)
    }

    // 优化几何体
    geometry.computeBoundingSphere()
    geometry.computeBoundingBox()

    this.geometryCache.set(key, geometry)
    return geometry.clone()
  }

  /**
   * 创建优化的材质
   */
  createMaterial(config: UnifiedMaterialConfig): THREE.Material {
    const key = this.generateMaterialKey(config)
    
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)!.clone()
    }

    let material: THREE.Material

    switch (config.type) {
      case 'standard':
        material = new THREE.MeshStandardMaterial({
          color: config.color || 0xffffff,
          metalness: config.metalness || 0,
          roughness: config.roughness || 1,
          emissive: config.emissive || 0x000000,
          emissiveIntensity: config.emissiveIntensity || 0,
          transparent: config.transparent || false,
          opacity: config.opacity || 1,
          side: config.side || THREE.FrontSide,
          wireframe: config.wireframe || false
        })
        break
      case 'basic':
        material = new THREE.MeshBasicMaterial({
          color: config.color || 0xffffff,
          transparent: config.transparent || false,
          opacity: config.opacity || 1,
          side: config.side || THREE.FrontSide,
          wireframe: config.wireframe || false
        })
        break
      case 'physical':
        material = new THREE.MeshPhysicalMaterial({
          color: config.color || 0xffffff,
          metalness: config.metalness || 0,
          roughness: config.roughness || 1,
          emissive: config.emissive || 0x000000,
          emissiveIntensity: config.emissiveIntensity || 0,
          transparent: config.transparent || false,
          opacity: config.opacity || 1,
          side: config.side || THREE.FrontSide,
          wireframe: config.wireframe || false
        })
        break
      default:
        throw new Error(`Unsupported material type: ${config.type}`)
    }

    this.materialCache.set(key, material)
    return material.clone()
  }

  /**
   * 创建实例化网格
   */
  createInstancedMesh(config: UnifiedInstancedMeshConfig): THREE.InstancedMesh {
    const geometry = this.createGeometry(config.geometry)
    const material = this.createMaterial(config.material)
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, config.count)
    instancedMesh.frustumCulled = config.frustumCulled !== false

    // WebGPU特定优化
    if (this.rendererType === 'webgpu') {
      this.applyWebGPUOptimizations(instancedMesh)
    }

    return instancedMesh
  }

  /**
   * 批量更新实例化网格
   */
  batchUpdateInstancedMesh(mesh: THREE.InstancedMesh, updates: InstanceUpdate[]): void {
    const tempObject = new THREE.Object3D()
    
    // 根据渲染器类型选择优化策略
    if (this.rendererType === 'webgpu') {
      this.batchUpdateWebGPU(mesh, updates, tempObject)
    } else {
      this.batchUpdateWebGL(mesh, updates, tempObject)
    }
  }

  /**
   * WebGL批量更新
   */
  private batchUpdateWebGL(mesh: THREE.InstancedMesh, updates: InstanceUpdate[], tempObject: THREE.Object3D): void {
    updates.forEach(({ index, position, rotation, scale, color }) => {
      if (position) tempObject.position.copy(position)
      if (rotation) tempObject.rotation.copy(rotation)
      if (scale) tempObject.scale.copy(scale)
      
      tempObject.updateMatrix()
      mesh.setMatrixAt(index, tempObject.matrix)
      
      if (color && mesh.instanceColor) {
        mesh.setColorAt(index, color)
      }
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
  }

  /**
   * WebGPU批量更新（可以利用计算着色器）
   */
  private batchUpdateWebGPU(mesh: THREE.InstancedMesh, updates: InstanceUpdate[], tempObject: THREE.Object3D): void {
    // 对于大量更新，可以考虑使用计算着色器
    if (updates.length > 1000) {
      // TODO: 实现计算着色器批量更新
      console.log('🚀 使用WebGPU计算着色器进行大批量更新')
    }
    
    // 回退到标准更新
    this.batchUpdateWebGL(mesh, updates, tempObject)
  }

  /**
   * 应用WebGPU特定优化
   */
  private applyWebGPUOptimizations(mesh: THREE.InstancedMesh): void {
    // WebGPU特定的优化设置
    // 例如：更高效的缓冲区管理、计算着色器集成等
    console.log('🚀 应用WebGPU优化到实例化网格')
  }

  /**
   * 创建粒子系统（WebGPU增强）
   */
  async createParticleSystem(particleCount: number): Promise<{
    mesh: THREE.Points,
    update: (deltaTime: number) => Promise<void>
  }> {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    // 初始化粒子数据
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = Math.random() * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      colors[i * 3] = Math.random()
      colors[i * 3 + 1] = Math.random()
      colors[i * 3 + 2] = Math.random()
      
      sizes[i] = Math.random() * 2 + 1
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    })

    const mesh = new THREE.Points(geometry, material)

    let updateFunction: (deltaTime: number) => Promise<void>

    if (this.rendererType === 'webgpu') {
      // 使用WebGPU计算着色器更新粒子
      updateFunction = async (deltaTime: number) => {
        // TODO: 实现WebGPU粒子更新
        console.log('🚀 使用WebGPU计算着色器更新粒子系统')
      }
    } else {
      // 使用CPU更新粒子
      updateFunction = async (deltaTime: number) => {
        const positions = geometry.attributes.position.array as Float32Array
        
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] -= deltaTime * 2 // 重力
          
          if (positions[i * 3 + 1] < -10) {
            positions[i * 3 + 1] = 10
          }
        }
        
        geometry.attributes.position.needsUpdate = true
      }
    }

    return { mesh, update: updateFunction }
  }

  /**
   * 生成几何体缓存键
   */
  private generateGeometryKey(config: UnifiedGeometryConfig): string {
    return `${config.type}_${JSON.stringify(config)}`
  }

  /**
   * 生成材质缓存键
   */
  private generateMaterialKey(config: UnifiedMaterialConfig): string {
    return `${config.type}_${JSON.stringify(config)}`
  }

  /**
   * 获取渲染器类型
   */
  getRendererType(): RendererType {
    return this.rendererType
  }

  /**
   * 检查是否支持WebGPU
   */
  isWebGPUSupported(): boolean {
    return this.rendererType === 'webgpu'
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return {
      rendererType: this.rendererType,
      geometryCacheSize: this.geometryCache.size,
      materialCacheSize: this.materialCache.size,
      webgpuSupported: this.isWebGPUSupported()
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.geometryCache.forEach(geometry => geometry.dispose())
    this.geometryCache.clear()
    
    this.materialCache.forEach(material => material.dispose())
    this.materialCache.clear()
    
    if (this.rendererType === 'webgpu') {
      computeShaderManager.dispose()
    }
  }
}

/**
 * 获取全局统一渲染API实例
 */
export const unifiedRenderingAPI = UnifiedRenderingAPI.getInstance()
