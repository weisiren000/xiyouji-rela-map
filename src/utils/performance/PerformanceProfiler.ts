import { BVHMetrics, bvhProfiler } from './BVHProfiler'

/**
 * 性能分析器
 * 监控渲染性能，提供详细的性能指标和优化建议
 */
export class PerformanceProfiler {
  private static instance: PerformanceProfiler
  
  // 性能指标
  private metrics = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
    memory: {
      geometries: 0,
      textures: 0,
      total: 0
    },
    bvh: null as BVHMetrics | null
  }
  
  // 历史数据
  private history = {
    fps: [] as number[],
    frameTime: [] as number[],
    drawCalls: [] as number[]
  }
  
  // 性能阈值
  private thresholds = {
    targetFPS: 60,
    warningFPS: 45,
    criticalFPS: 30,
    maxFrameTime: 16.67, // 60fps = 16.67ms per frame
    maxDrawCalls: 1000,
    maxTriangles: 1000000
  }
  
  // 监控状态
  private isMonitoring = false
  private lastTime = 0
  private frameCount = 0
  private animationFrameId: number | null = null

  private constructor() {}

  static getInstance(): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler()
    }
    return PerformanceProfiler.instance
  }

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.lastTime = performance.now()
    this.frameCount = 0
    
    this.monitorLoop()
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * 监控循环
   */
  private monitorLoop(): void {
    if (!this.isMonitoring) return
    
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    
    this.frameCount++
    
    // 每秒更新一次FPS
    if (deltaTime >= 1000) {
      this.metrics.fps = (this.frameCount * 1000) / deltaTime
      this.metrics.frameTime = deltaTime / this.frameCount
      
      // 更新历史数据
      this.updateHistory()
      
      // 重置计数器
      this.frameCount = 0
      this.lastTime = currentTime
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.monitorLoop())
  }

  /**
   * 更新历史数据
   */
  private updateHistory(): void {
    const maxHistoryLength = 60 // 保留60秒的数据
    
    this.history.fps.push(this.metrics.fps)
    this.history.frameTime.push(this.metrics.frameTime)
    this.history.drawCalls.push(this.metrics.drawCalls)
    
    // 限制历史数据长度
    if (this.history.fps.length > maxHistoryLength) {
      this.history.fps.shift()
      this.history.frameTime.shift()
      this.history.drawCalls.shift()
    }
  }

  /**
   * 更新渲染器信息
   */
  updateRendererInfo(renderer: THREE.WebGLRenderer): void {
    const info = renderer.info

    this.metrics.drawCalls = info.render.calls
    this.metrics.triangles = info.render.triangles
    this.metrics.geometries = info.memory.geometries
    this.metrics.textures = info.memory.textures
    this.metrics.programs = info.programs?.length || 0

    // 估算内存使用
    this.metrics.memory.geometries = info.memory.geometries * 1024 // 估算每个几何体1KB
    this.metrics.memory.textures = info.memory.textures * 512 * 512 * 4 // 估算512x512 RGBA纹理
    this.metrics.memory.total = this.metrics.memory.geometries + this.metrics.memory.textures

    // 更新BVH指标
    this.metrics.bvh = bvhProfiler.getMetrics()
  }

  /**
   * 获取性能等级
   */
  getPerformanceLevel(): 'excellent' | 'good' | 'warning' | 'critical' {
    const avgFPS = this.getAverageFPS()
    
    if (avgFPS >= this.thresholds.targetFPS) return 'excellent'
    if (avgFPS >= this.thresholds.warningFPS) return 'good'
    if (avgFPS >= this.thresholds.criticalFPS) return 'warning'
    return 'critical'
  }

  /**
   * 获取平均FPS
   */
  getAverageFPS(): number {
    if (this.history.fps.length === 0) return this.metrics.fps
    
    const sum = this.history.fps.reduce((a, b) => a + b, 0)
    return sum / this.history.fps.length
  }

  /**
   * 获取性能瓶颈分析
   */
  getBottleneckAnalysis(): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = []
    
    // FPS分析
    if (this.metrics.fps < this.thresholds.warningFPS) {
      bottlenecks.push({
        type: 'fps',
        severity: this.metrics.fps < this.thresholds.criticalFPS ? 'critical' : 'warning',
        message: `FPS过低: ${this.metrics.fps.toFixed(1)}`,
        suggestion: '考虑降低渲染质量或减少对象数量'
      })
    }
    
    // 绘制调用分析
    if (this.metrics.drawCalls > this.thresholds.maxDrawCalls) {
      bottlenecks.push({
        type: 'drawCalls',
        severity: 'warning',
        message: `绘制调用过多: ${this.metrics.drawCalls}`,
        suggestion: '使用实例化渲染或批量渲染减少绘制调用'
      })
    }
    
    // 三角形数量分析
    if (this.metrics.triangles > this.thresholds.maxTriangles) {
      bottlenecks.push({
        type: 'triangles',
        severity: 'warning',
        message: `三角形数量过多: ${this.metrics.triangles}`,
        suggestion: '使用LOD或简化几何体'
      })
    }
    
    // 内存分析
    if (this.metrics.memory.total > 100 * 1024 * 1024) { // 100MB
      bottlenecks.push({
        type: 'memory',
        severity: 'warning',
        message: `内存使用过高: ${(this.metrics.memory.total / 1024 / 1024).toFixed(1)}MB`,
        suggestion: '优化纹理大小或使用纹理压缩'
      })
    }
    
    return bottlenecks
  }

  /**
   * 获取优化建议
   */
  getOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    const level = this.getPerformanceLevel()
    
    if (level === 'warning' || level === 'critical') {
      suggestions.push({
        priority: 'high',
        category: 'rendering',
        title: '启用性能优化模式',
        description: '自动降低渲染质量以提升性能',
        impact: 'high'
      })
      
      if (this.metrics.drawCalls > 500) {
        suggestions.push({
          priority: 'high',
          category: 'batching',
          title: '使用批量渲染',
          description: '合并相似对象以减少绘制调用',
          impact: 'medium'
        })
      }
      
      if (this.metrics.triangles > 500000) {
        suggestions.push({
          priority: 'medium',
          category: 'geometry',
          title: '启用LOD系统',
          description: '根据距离动态调整几何体细节',
          impact: 'medium'
        })
      }
    }
    
    return suggestions
  }

  /**
   * 获取当前指标
   */
  getMetrics() {
    return { ...this.metrics }
  }

  /**
   * 获取历史数据
   */
  getHistory() {
    return {
      fps: [...this.history.fps],
      frameTime: [...this.history.frameTime],
      drawCalls: [...this.history.drawCalls]
    }
  }

  /**
   * 重置所有数据
   */
  reset(): void {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      programs: 0,
      memory: {
        geometries: 0,
        textures: 0,
        total: 0
      },
      bvh: null
    }
    
    this.history = {
      fps: [],
      frameTime: [],
      drawCalls: []
    }
  }
}

/**
 * 性能瓶颈接口
 */
export interface PerformanceBottleneck {
  type: 'fps' | 'drawCalls' | 'triangles' | 'memory'
  severity: 'warning' | 'critical'
  message: string
  suggestion: string
}

/**
 * 优化建议接口
 */
export interface OptimizationSuggestion {
  priority: 'low' | 'medium' | 'high'
  category: 'rendering' | 'batching' | 'geometry' | 'memory'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
}

/**
 * 获取全局性能分析器实例
 */
export const performanceProfiler = PerformanceProfiler.getInstance()
