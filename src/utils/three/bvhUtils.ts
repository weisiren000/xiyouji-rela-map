/**
 * BVH (Bounding Volume Hierarchy) 优化工具
 * 使用 three-mesh-bvh 库提升射线投射和空间查询性能
 */

import * as THREE from 'three'
import {
  MeshBVH,
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
  computeBatchedBoundsTree,
  disposeBatchedBoundsTree,
  getBVHExtremes,
  estimateMemoryInBytes
} from 'three-mesh-bvh'

// 扩展 Three.js 原型以支持 BVH
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

// 如果使用 BatchedMesh（未来可能需要）
if (THREE.BatchedMesh) {
  THREE.BatchedMesh.prototype.computeBoundsTree = computeBatchedBoundsTree
  THREE.BatchedMesh.prototype.disposeBoundsTree = disposeBatchedBoundsTree
  THREE.BatchedMesh.prototype.raycast = acceleratedRaycast
}

/**
 * BVH 配置选项
 */
export interface BVHOptions {
  /** 分割策略 */
  strategy?: number
  /** 最大树深度 */
  maxDepth?: number
  /** 叶节点最大三角形数 */
  maxLeafTris?: number
  /** 是否设置包围盒 */
  setBoundingBox?: boolean
  /** 是否使用 SharedArrayBuffer */
  useSharedArrayBuffer?: boolean
  /** 是否启用详细日志 */
  verbose?: boolean
}

/**
 * 默认 BVH 配置
 */
export const DEFAULT_BVH_OPTIONS: BVHOptions = {
  maxDepth: 40,
  maxLeafTris: 10,
  setBoundingBox: true,
  useSharedArrayBuffer: false,
  verbose: false
}

/**
 * BVH 性能统计
 */
export interface BVHStats {
  nodeCount: number
  leafNodeCount: number
  surfaceAreaScore: number
  depth: { min: number; max: number }
  triangles: { min: number; max: number }
  splits: [number, number, number]
  memoryBytes: number
}

/**
 * BVH 管理器类
 */
export class BVHManager {
  private bvhCache = new Map<string, MeshBVH>()
  private stats = new Map<string, BVHStats>()

  /**
   * 为几何体计算 BVH
   */
  computeBVH(
    geometry: THREE.BufferGeometry,
    options: BVHOptions = {},
    cacheKey?: string
  ): MeshBVH {
    const finalOptions = { ...DEFAULT_BVH_OPTIONS, ...options }
    
    // 检查缓存
    if (cacheKey && this.bvhCache.has(cacheKey)) {
      return this.bvhCache.get(cacheKey)!
    }

    // 计算 BVH
    const bvh = new MeshBVH(geometry, finalOptions)
    
    // 缓存结果
    if (cacheKey) {
      this.bvhCache.set(cacheKey, bvh)
      this.stats.set(cacheKey, this.getBVHStats(bvh))
    }

    return bvh
  }

  /**
   * 为 InstancedMesh 计算 BVH
   */
  computeInstancedBVH(
    mesh: THREE.InstancedMesh,
    options: BVHOptions = {},
    cacheKey?: string
  ): void {
    if (!mesh.geometry.boundsTree) {
      const bvh = this.computeBVH(mesh.geometry, options, cacheKey)
      mesh.geometry.boundsTree = bvh
    }
  }

  /**
   * 获取 BVH 统计信息
   */
  getBVHStats(bvh: MeshBVH): BVHStats {
    const extremes = getBVHExtremes(bvh)[0] // 获取第一个组的统计
    const memoryBytes = estimateMemoryInBytes(bvh)

    return {
      nodeCount: extremes.nodeCount,
      leafNodeCount: extremes.leafNodeCount,
      surfaceAreaScore: extremes.surfaceAreaScore,
      depth: extremes.depth,
      triangles: extremes.tris,
      splits: extremes.splits,
      memoryBytes
    }
  }

  /**
   * 获取缓存的统计信息
   */
  getCachedStats(cacheKey: string): BVHStats | undefined {
    return this.stats.get(cacheKey)
  }

  /**
   * 清理 BVH 缓存
   */
  clearCache(): void {
    this.bvhCache.clear()
    this.stats.clear()
  }

  /**
   * 获取总内存使用量
   */
  getTotalMemoryUsage(): number {
    return Array.from(this.stats.values())
      .reduce((total, stats) => total + stats.memoryBytes, 0)
  }
}

/**
 * 全局 BVH 管理器实例
 */
export const bvhManager = new BVHManager()

/**
 * 配置射线投射器以使用 BVH 优化
 */
export function configureBVHRaycaster(raycaster: THREE.Raycaster): void {
  // 启用首次命中优化，适合大多数交互场景
  raycaster.firstHitOnly = true
  
  // 优化射线投射参数
  raycaster.params.Mesh = { threshold: 0.1 }
  raycaster.params.Points = { threshold: 0.1 }
}

/**
 * 为 GLB 模型启用 BVH
 */
export function enableBVHForModel(
  model: THREE.Group | THREE.Mesh,
  options: BVHOptions = {}
): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      if (!child.geometry.boundsTree) {
        bvhManager.computeInstancedBVH(
          child as any,
          options,
          `model_${child.uuid}`
        )
      }
    }
  })
}

/**
 * 性能对比测试工具
 */
export class BVHPerformanceTest {
  /**
   * 测试射线投射性能
   */
  static testRaycastPerformance(
    mesh: THREE.Mesh,
    rayCount: number = 1000
  ): { withBVH: number; withoutBVH: number; speedup: number } {
    const raycaster = new THREE.Raycaster()
    const rays: THREE.Ray[] = []
    
    // 生成随机射线
    for (let i = 0; i < rayCount; i++) {
      const origin = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      )
      const direction = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize()
      
      rays.push(new THREE.Ray(origin, direction))
    }

    // 测试无 BVH 性能
    const originalBoundsTree = mesh.geometry.boundsTree
    mesh.geometry.boundsTree = undefined
    
    const startWithout = performance.now()
    rays.forEach(ray => {
      raycaster.ray = ray
      raycaster.intersectObject(mesh)
    })
    const timeWithout = performance.now() - startWithout

    // 测试有 BVH 性能
    mesh.geometry.boundsTree = originalBoundsTree || bvhManager.computeBVH(mesh.geometry)
    
    const startWith = performance.now()
    rays.forEach(ray => {
      raycaster.ray = ray
      raycaster.intersectObject(mesh)
    })
    const timeWith = performance.now() - startWith

    return {
      withBVH: timeWith,
      withoutBVH: timeWithout,
      speedup: timeWithout / timeWith
    }
  }
}
