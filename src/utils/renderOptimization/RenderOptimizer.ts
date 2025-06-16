import * as THREE from 'three'

/**
 * 渲染优化器
 * 管理几何体和材质缓存，减少GPU状态切换，提升渲染性能
 */
export class RenderOptimizer {
  private static instance: RenderOptimizer
  
  // 几何体缓存
  private geometryCache = new Map<string, THREE.BufferGeometry>()
  
  // 材质缓存
  private materialCache = new Map<string, THREE.Material>()
  
  // 纹理缓存
  private textureCache = new Map<string, THREE.Texture>()
  
  // 对象池
  private objectPools = new Map<string, THREE.Object3D[]>()
  
  // 渲染统计
  private stats = {
    geometryCacheHits: 0,
    materialCacheHits: 0,
    textureCacheHits: 0,
    objectPoolHits: 0,
    totalDrawCalls: 0,
    totalTriangles: 0
  }

  private constructor() {}

  static getInstance(): RenderOptimizer {
    if (!RenderOptimizer.instance) {
      RenderOptimizer.instance = new RenderOptimizer()
    }
    return RenderOptimizer.instance
  }

  /**
   * 获取或创建几何体
   */
  getGeometry(key: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
    if (this.geometryCache.has(key)) {
      this.stats.geometryCacheHits++
      return this.geometryCache.get(key)!
    }

    const geometry = factory()
    this.geometryCache.set(key, geometry)
    return geometry
  }

  /**
   * 获取或创建材质
   */
  getMaterial(key: string, factory: () => THREE.Material): THREE.Material {
    if (this.materialCache.has(key)) {
      this.stats.materialCacheHits++
      return this.materialCache.get(key)!
    }

    const material = factory()
    this.materialCache.set(key, material)
    return material
  }

  /**
   * 获取或创建纹理
   */
  getTexture(key: string, factory: () => THREE.Texture): THREE.Texture {
    if (this.textureCache.has(key)) {
      this.stats.textureCacheHits++
      return this.textureCache.get(key)!
    }

    const texture = factory()
    this.textureCache.set(key, texture)
    return texture
  }

  /**
   * 对象池管理 - 获取对象
   */
  acquireObject<T extends THREE.Object3D>(poolKey: string, factory: () => T): T {
    if (!this.objectPools.has(poolKey)) {
      this.objectPools.set(poolKey, [])
    }

    const pool = this.objectPools.get(poolKey)!
    if (pool.length > 0) {
      this.stats.objectPoolHits++
      return pool.pop() as T
    }

    return factory()
  }

  /**
   * 对象池管理 - 释放对象
   */
  releaseObject(poolKey: string, object: THREE.Object3D): void {
    // 重置对象状态
    object.position.set(0, 0, 0)
    object.rotation.set(0, 0, 0)
    object.scale.set(1, 1, 1)
    object.visible = true

    if (!this.objectPools.has(poolKey)) {
      this.objectPools.set(poolKey, [])
    }

    const pool = this.objectPools.get(poolKey)!
    if (pool.length < 100) { // 限制池大小
      pool.push(object)
    }
  }

  /**
   * 创建优化的球体几何体
   */
  createOptimizedSphereGeometry(radius: number, detail: number): THREE.BufferGeometry {
    const key = `sphere_${radius}_${detail}`
    return this.getGeometry(key, () => {
      const geometry = new THREE.SphereGeometry(radius, detail, detail)
      
      // 优化几何体
      geometry.computeBoundingSphere()
      geometry.computeBoundingBox()
      
      // 如果不需要法线，可以删除以节省内存
      // geometry.deleteAttribute('normal')
      
      return geometry
    })
  }

  /**
   * 创建优化的标准材质
   */
  createOptimizedStandardMaterial(params: {
    color?: string | number
    metalness?: number
    roughness?: number
    emissive?: string | number
    emissiveIntensity?: number
    transparent?: boolean
    opacity?: number
  }): THREE.MeshStandardMaterial {
    const key = `standard_${JSON.stringify(params)}`
    return this.getMaterial(key, () => {
      const material = new THREE.MeshStandardMaterial(params)
      
      // 优化材质设置
      material.needsUpdate = false
      
      return material
    }) as THREE.MeshStandardMaterial
  }

  /**
   * 批量更新InstancedMesh
   */
  batchUpdateInstancedMesh(
    mesh: THREE.InstancedMesh,
    updates: Array<{
      index: number
      position?: THREE.Vector3
      rotation?: THREE.Euler
      scale?: THREE.Vector3
      color?: THREE.Color
    }>
  ): void {
    const tempObject = new THREE.Object3D()
    
    updates.forEach(({ index, position, rotation, scale, color }) => {
      // 更新变换
      if (position) tempObject.position.copy(position)
      if (rotation) tempObject.rotation.copy(rotation)
      if (scale) tempObject.scale.copy(scale)
      
      tempObject.updateMatrix()
      mesh.setMatrixAt(index, tempObject.matrix)
      
      // 更新颜色
      if (color && mesh.instanceColor) {
        mesh.setColorAt(index, color)
      }
    })

    // 批量更新
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
  }

  /**
   * 获取渲染统计信息
   */
  getStats() {
    return { ...this.stats }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    Object.keys(this.stats).forEach(key => {
      (this.stats as any)[key] = 0
    })
  }

  /**
   * 清理缓存
   */
  dispose(): void {
    // 清理几何体
    this.geometryCache.forEach(geometry => geometry.dispose())
    this.geometryCache.clear()

    // 清理材质
    this.materialCache.forEach(material => material.dispose())
    this.materialCache.clear()

    // 清理纹理
    this.textureCache.forEach(texture => texture.dispose())
    this.textureCache.clear()

    // 清理对象池
    this.objectPools.clear()

    this.resetStats()
  }
}

/**
 * 获取全局渲染优化器实例
 */
export const renderOptimizer = RenderOptimizer.getInstance()
