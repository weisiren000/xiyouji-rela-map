/**
 * BVH 性能监控器
 * 监控 BVH 的性能指标和内存使用情况
 */

import { BVHStats, bvhManager } from '../three/bvhUtils'

/**
 * BVH 性能指标
 */
export interface BVHMetrics {
  /** BVH 数量 */
  bvhCount: number
  /** 总内存使用（字节） */
  totalMemory: number
  /** 平均射线投射时间（毫秒） */
  avgRaycastTime: number
  /** 射线投射次数 */
  raycastCount: number
  /** BVH 统计信息 */
  stats: Map<string, BVHStats>
}

/**
 * 射线投射性能记录
 */
interface RaycastRecord {
  timestamp: number
  duration: number
  hitCount: number
}

/**
 * BVH 性能监控器
 */
export class BVHProfiler {
  private raycastRecords: RaycastRecord[] = []
  private maxRecords = 1000
  private isEnabled = true

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * 记录射线投射性能
   */
  recordRaycast(duration: number, hitCount: number): void {
    if (!this.isEnabled) return

    this.raycastRecords.push({
      timestamp: performance.now(),
      duration,
      hitCount
    })

    // 保持记录数量在限制内
    if (this.raycastRecords.length > this.maxRecords) {
      this.raycastRecords.shift()
    }
  }

  /**
   * 获取当前 BVH 指标
   */
  getMetrics(): BVHMetrics {
    const recentRecords = this.raycastRecords.slice(-100) // 最近100次记录
    const avgRaycastTime = recentRecords.length > 0
      ? recentRecords.reduce((sum, record) => sum + record.duration, 0) / recentRecords.length
      : 0

    return {
      bvhCount: bvhManager['bvhCache'].size,
      totalMemory: bvhManager.getTotalMemoryUsage(),
      avgRaycastTime,
      raycastCount: this.raycastRecords.length,
      stats: new Map(bvhManager['stats'])
    }
  }

  /**
   * 获取性能统计摘要
   */
  getPerformanceSummary(): {
    avgRaycastTime: number
    minRaycastTime: number
    maxRaycastTime: number
    totalRaycasts: number
    memoryUsageMB: number
  } {
    const metrics = this.getMetrics()
    const durations = this.raycastRecords.map(r => r.duration)

    return {
      avgRaycastTime: metrics.avgRaycastTime,
      minRaycastTime: durations.length > 0 ? Math.min(...durations) : 0,
      maxRaycastTime: durations.length > 0 ? Math.max(...durations) : 0,
      totalRaycasts: metrics.raycastCount,
      memoryUsageMB: metrics.totalMemory / (1024 * 1024)
    }
  }

  /**
   * 清理记录
   */
  clearRecords(): void {
    this.raycastRecords = []
  }

  /**
   * 导出性能数据
   */
  exportData(): {
    timestamp: string
    metrics: BVHMetrics
    summary: ReturnType<BVHProfiler['getPerformanceSummary']>
    records: RaycastRecord[]
  } {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      summary: this.getPerformanceSummary(),
      records: [...this.raycastRecords]
    }
  }
}

/**
 * 全局 BVH 性能监控器实例
 */
export const bvhProfiler = new BVHProfiler()

/**
 * 装饰器：自动监控射线投射性能
 */
export function monitorRaycast<T extends (...args: any[]) => any>(
  target: T
): T {
  return ((...args: any[]) => {
    const start = performance.now()
    const result = target(...args)
    const duration = performance.now() - start
    
    // 假设结果是交集数组或单个交集
    const hitCount = Array.isArray(result) ? result.length : (result ? 1 : 0)
    
    bvhProfiler.recordRaycast(duration, hitCount)
    
    return result
  }) as T
}

/**
 * 创建性能监控的射线投射器
 */
export function createMonitoredRaycaster(): THREE.Raycaster {
  const raycaster = new THREE.Raycaster()
  
  // 包装 intersectObject 方法
  const originalIntersectObject = raycaster.intersectObject.bind(raycaster)
  raycaster.intersectObject = monitorRaycast(originalIntersectObject)
  
  // 包装 intersectObjects 方法
  const originalIntersectObjects = raycaster.intersectObjects.bind(raycaster)
  raycaster.intersectObjects = monitorRaycast(originalIntersectObjects)
  
  return raycaster
}
