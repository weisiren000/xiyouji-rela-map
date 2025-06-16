import * as THREE from 'three'

/**
 * 批量渲染器
 * 优化渲染顺序，减少状态切换，提升渲染性能
 */
export class BatchRenderer {
  private static instance: BatchRenderer
  
  // 渲染队列
  private renderQueue: RenderBatch[] = []
  
  // 渲染统计
  private stats = {
    totalBatches: 0,
    totalObjects: 0,
    stateChanges: 0,
    drawCalls: 0
  }

  private constructor() {}

  static getInstance(): BatchRenderer {
    if (!BatchRenderer.instance) {
      BatchRenderer.instance = new BatchRenderer()
    }
    return BatchRenderer.instance
  }

  /**
   * 添加渲染批次
   */
  addBatch(batch: RenderBatch): void {
    this.renderQueue.push(batch)
  }

  /**
   * 按材质和几何体分组对象
   */
  groupObjects(objects: RenderObject[]): Map<string, RenderObject[]> {
    const groups = new Map<string, RenderObject[]>()
    
    objects.forEach(obj => {
      const key = this.generateBatchKey(obj)
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(obj)
    })
    
    return groups
  }

  /**
   * 生成批次键
   */
  private generateBatchKey(obj: RenderObject): string {
    const materialId = obj.material.uuid
    const geometryId = obj.geometry.uuid
    const transparent = obj.material.transparent ? 'T' : 'O'
    const blending = obj.material.blending
    
    return `${materialId}_${geometryId}_${transparent}_${blending}`
  }

  /**
   * 优化渲染顺序
   */
  optimizeRenderOrder(batches: RenderBatch[]): RenderBatch[] {
    return batches.sort((a, b) => {
      // 1. 不透明物体优先
      if (a.transparent !== b.transparent) {
        return a.transparent ? 1 : -1
      }
      
      // 2. 按材质分组
      if (a.materialId !== b.materialId) {
        return a.materialId.localeCompare(b.materialId)
      }
      
      // 3. 按几何体分组
      if (a.geometryId !== b.geometryId) {
        return a.geometryId.localeCompare(b.geometryId)
      }
      
      // 4. 透明物体按距离排序（从远到近）
      if (a.transparent) {
        return b.distance - a.distance
      }
      
      return 0
    })
  }

  /**
   * 创建实例化网格批次
   */
  createInstancedBatch(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    objects: RenderObject[]
  ): THREE.InstancedMesh {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, objects.length)
    
    // 设置实例变换矩阵
    const tempObject = new THREE.Object3D()
    objects.forEach((obj, index) => {
      tempObject.position.copy(obj.position)
      tempObject.rotation.copy(obj.rotation)
      tempObject.scale.copy(obj.scale)
      tempObject.updateMatrix()
      
      instancedMesh.setMatrixAt(index, tempObject.matrix)
      
      // 设置颜色（如果支持）
      if (obj.color && instancedMesh.instanceColor) {
        instancedMesh.setColorAt(index, obj.color)
      }
    })
    
    instancedMesh.instanceMatrix.needsUpdate = true
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true
    }
    
    return instancedMesh
  }

  /**
   * 执行批量渲染
   */
  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
    this.resetStats()
    
    // 优化渲染顺序
    const optimizedBatches = this.optimizeRenderOrder(this.renderQueue)
    
    let currentMaterial: THREE.Material | null = null
    let currentGeometry: THREE.BufferGeometry | null = null
    
    optimizedBatches.forEach(batch => {
      // 检查状态变化
      if (batch.material !== currentMaterial) {
        this.stats.stateChanges++
        currentMaterial = batch.material
      }
      
      if (batch.geometry !== currentGeometry) {
        this.stats.stateChanges++
        currentGeometry = batch.geometry
      }
      
      // 渲染批次
      this.renderBatch(renderer, batch, scene, camera)
      
      this.stats.totalBatches++
      this.stats.totalObjects += batch.objects.length
      this.stats.drawCalls++
    })
    
    // 清空渲染队列
    this.renderQueue = []
  }

  /**
   * 渲染单个批次
   */
  private renderBatch(
    renderer: THREE.WebGLRenderer,
    batch: RenderBatch,
    scene: THREE.Scene,
    camera: THREE.Camera
  ): void {
    if (batch.instancedMesh) {
      // 使用实例化渲染
      scene.add(batch.instancedMesh)
      // 实例化网格会自动被渲染器处理
    } else {
      // 传统渲染方式
      batch.objects.forEach(obj => {
        const mesh = new THREE.Mesh(batch.geometry, batch.material)
        mesh.position.copy(obj.position)
        mesh.rotation.copy(obj.rotation)
        mesh.scale.copy(obj.scale)
        
        scene.add(mesh)
      })
    }
  }

  /**
   * 时间分片渲染
   */
  renderWithTimeSlicing(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    maxTimeMs: number = 16
  ): boolean {
    const startTime = performance.now()
    let batchIndex = 0
    
    while (batchIndex < this.renderQueue.length && 
           performance.now() - startTime < maxTimeMs) {
      
      const batch = this.renderQueue[batchIndex]
      this.renderBatch(renderer, batch, scene, camera)
      
      batchIndex++
      this.stats.totalBatches++
      this.stats.totalObjects += batch.objects.length
    }
    
    // 移除已渲染的批次
    this.renderQueue.splice(0, batchIndex)
    
    // 返回是否完成所有渲染
    return this.renderQueue.length === 0
  }

  /**
   * 获取渲染统计
   */
  getStats() {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  private resetStats(): void {
    this.stats.totalBatches = 0
    this.stats.totalObjects = 0
    this.stats.stateChanges = 0
    this.stats.drawCalls = 0
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.renderQueue = []
    this.resetStats()
  }
}

/**
 * 渲染对象接口
 */
export interface RenderObject {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
  color?: THREE.Color
  distance?: number
}

/**
 * 渲染批次接口
 */
export interface RenderBatch {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  objects: RenderObject[]
  materialId: string
  geometryId: string
  transparent: boolean
  distance: number
  instancedMesh?: THREE.InstancedMesh
}

/**
 * 获取全局批量渲染器实例
 */
export const batchRenderer = BatchRenderer.getInstance()
