/**
 * 渲染优化工具集
 * 提供完整的3D渲染性能优化解决方案
 */

// 核心优化器
export { RenderOptimizer, renderOptimizer } from './RenderOptimizer'
export { ShaderManager, shaderManager } from './ShaderManager'
export { BatchRenderer, batchRenderer } from './BatchRenderer'
export { PerformanceProfiler, performanceProfiler } from './PerformanceProfiler'

// 类型定义
export type {
  RenderObject,
  RenderBatch
} from './BatchRenderer'

export type {
  PerformanceBottleneck,
  OptimizationSuggestion
} from './PerformanceProfiler'

/**
 * 渲染优化配置
 */
export interface RenderOptimizationConfig {
  // 几何体优化
  enableGeometryCache: boolean
  enableMaterialCache: boolean
  enableObjectPooling: boolean
  
  // 批量渲染
  enableBatchRendering: boolean
  enableInstancedRendering: boolean
  maxBatchSize: number
  
  // 着色器优化
  useCustomShaders: boolean
  enableShaderCache: boolean
  
  // 性能监控
  enablePerformanceMonitoring: boolean
  targetFPS: number
  
  // LOD设置
  enableLOD: boolean
  lodDistances: number[]
  lodDetails: number[]
}

/**
 * 默认优化配置
 */
export const DEFAULT_OPTIMIZATION_CONFIG: RenderOptimizationConfig = {
  enableGeometryCache: true,
  enableMaterialCache: true,
  enableObjectPooling: true,
  
  enableBatchRendering: true,
  enableInstancedRendering: true,
  maxBatchSize: 1000,
  
  useCustomShaders: true,
  enableShaderCache: true,
  
  enablePerformanceMonitoring: true,
  targetFPS: 60,
  
  enableLOD: true,
  lodDistances: [50, 100, 200],
  lodDetails: [20, 12, 6]
}

/**
 * 渲染优化管理器
 * 统一管理所有优化功能
 */
export class RenderOptimizationManager {
  private static instance: RenderOptimizationManager
  private config: RenderOptimizationConfig
  
  private constructor(config: Partial<RenderOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config }
  }
  
  static getInstance(config?: Partial<RenderOptimizationConfig>): RenderOptimizationManager {
    if (!RenderOptimizationManager.instance) {
      RenderOptimizationManager.instance = new RenderOptimizationManager(config)
    }
    return RenderOptimizationManager.instance
  }
  
  /**
   * 初始化优化系统
   */
  initialize(): void {
    if (this.config.enablePerformanceMonitoring) {
      performanceProfiler.startMonitoring()
    }
    
    console.log('🚀 渲染优化系统已启动', this.config)
  }
  
  /**
   * 获取优化配置
   */
  getConfig(): RenderOptimizationConfig {
    return { ...this.config }
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<RenderOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
  
  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    const metrics = performanceProfiler.getMetrics()
    const bottlenecks = performanceProfiler.getBottleneckAnalysis()
    const suggestions = performanceProfiler.getOptimizationSuggestions()
    const renderStats = renderOptimizer.getStats()
    const batchStats = batchRenderer.getStats()
    
    return {
      metrics,
      bottlenecks,
      suggestions,
      renderStats,
      batchStats,
      config: this.config
    }
  }
  
  /**
   * 自动优化
   */
  autoOptimize(): void {
    const level = performanceProfiler.getPerformanceLevel()
    
    if (level === 'critical' || level === 'warning') {
      // 启用更激进的优化
      this.updateConfig({
        enableBatchRendering: true,
        enableInstancedRendering: true,
        useCustomShaders: true,
        enableLOD: true
      })
      
      console.log('⚡ 自动优化已启用，性能等级:', level)
    }
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    performanceProfiler.stopMonitoring()
    renderOptimizer.dispose()
    shaderManager.dispose()
    batchRenderer.dispose()
    
    console.log('🧹 渲染优化系统已清理')
  }
}

/**
 * 获取全局渲染优化管理器
 */
export const renderOptimizationManager = RenderOptimizationManager.getInstance()

/**
 * 便捷函数：初始化渲染优化
 */
export function initializeRenderOptimization(config?: Partial<RenderOptimizationConfig>) {
  const manager = RenderOptimizationManager.getInstance(config)
  manager.initialize()
  return manager
}

/**
 * 便捷函数：获取性能报告
 */
export function getPerformanceReport() {
  return renderOptimizationManager.getPerformanceReport()
}

/**
 * 便捷函数：自动优化
 */
export function autoOptimize() {
  renderOptimizationManager.autoOptimize()
}
