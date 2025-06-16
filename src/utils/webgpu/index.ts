/**
 * WebGPU与WebGL并存系统
 * 提供自动检测、降级和统一的渲染接口
 */

// 核心模块
export {
  WebGPUDetector,
  webgpuDetector,
  detectWebGPU,
  isWebGPURecommended
} from './WebGPUDetector'

export {
  RendererManager,
  rendererManager
} from './RendererManager'

export {
  ComputeShaderManager,
  computeShaderManager
} from './ComputeShaderManager'

export {
  UnifiedRenderingAPI,
  unifiedRenderingAPI
} from './UnifiedRenderingAPI'

// 导入实例和类型用于内部使用
import { webgpuDetector } from './WebGPUDetector'
import { rendererManager, type RendererType } from './RendererManager'
import { unifiedRenderingAPI } from './UnifiedRenderingAPI'

// 类型定义
export type {
  WebGPUCapabilities,
  WebGPUFeatureSupport
} from './WebGPUDetector'

export type {
  RendererType,
  RendererConfig,
  RendererInfo
} from './RendererManager'

export type {
  ComputeShaderConfig,
  ParticleSystemConfig
} from './ComputeShaderManager'

export type {
  UnifiedGeometryConfig,
  UnifiedMaterialConfig,
  UnifiedInstancedMeshConfig,
  InstanceUpdate
} from './UnifiedRenderingAPI'

/**
 * WebGPU系统配置
 */
export interface WebGPUSystemConfig {
  // 检测配置
  enableAutoDetection: boolean
  fallbackToWebGL: boolean
  
  // 性能配置
  preferWebGPU: boolean
  minPerformanceScore: number
  
  // 功能配置
  enableComputeShaders: boolean
  enableAdvancedFeatures: boolean
  
  // 调试配置
  enableDebugMode: boolean
  logPerformanceStats: boolean
}

/**
 * 默认WebGPU系统配置
 */
export const DEFAULT_WEBGPU_CONFIG: WebGPUSystemConfig = {
  enableAutoDetection: true,
  fallbackToWebGL: true,
  preferWebGPU: true,
  minPerformanceScore: 60,
  enableComputeShaders: true,
  enableAdvancedFeatures: true,
  enableDebugMode: false,
  logPerformanceStats: true
}

/**
 * WebGPU系统管理器
 * 统一管理整个WebGPU与WebGL并存系统
 */
export class WebGPUSystemManager {
  private static instance: WebGPUSystemManager
  private config: WebGPUSystemConfig
  private initialized = false
  private capabilities: any = null

  private constructor(config: Partial<WebGPUSystemConfig> = {}) {
    this.config = { ...DEFAULT_WEBGPU_CONFIG, ...config }
  }

  static getInstance(config?: Partial<WebGPUSystemConfig>): WebGPUSystemManager {
    if (!WebGPUSystemManager.instance) {
      WebGPUSystemManager.instance = new WebGPUSystemManager(config)
    }
    return WebGPUSystemManager.instance
  }

  /**
   * 初始化WebGPU系统
   */
  async initialize(): Promise<{
    success: boolean
    rendererType: RendererType
    capabilities: any
    performanceScore?: number
    message?: string
  }> {
    if (this.initialized) {
      return {
        success: true,
        rendererType: rendererManager.getRendererType(),
        capabilities: this.capabilities
      }
    }

    console.log('🚀 初始化WebGPU与WebGL并存系统...')

    try {
      // 1. 检测WebGPU能力
      if (this.config.enableAutoDetection) {
        this.capabilities = await webgpuDetector.detectCapabilities()

        if (this.config.logPerformanceStats && this.capabilities.supported) {
          const score = webgpuDetector.getPerformanceScore(this.capabilities)
          console.log(`📊 WebGPU性能评分: ${score}/100`)
        }
      }

      // 2. 初始化渲染器管理器
      console.log('🔧 初始化渲染器管理器...')
      await rendererManager.initialize()
      const rendererType = rendererManager.getRendererType()

      // 3. 初始化统一渲染API
      console.log('🎨 初始化统一渲染API...')
      await unifiedRenderingAPI.initialize()

      // 4. 输出系统信息
      this.logSystemInfo(rendererType)

      this.initialized = true

      const message = rendererType === 'webgpu' ?
        'WebGPU系统初始化成功！享受高性能3D渲染体验。' :
        'WebGL系统初始化成功！WebGPU暂不可用，已自动降级。'

      return {
        success: true,
        rendererType,
        capabilities: this.capabilities,
        performanceScore: this.capabilities?.supported ?
          webgpuDetector.getPerformanceScore(this.capabilities) : undefined,
        message
      }

    } catch (error) {
      console.error('❌ WebGPU系统初始化失败:', error)

      if (this.config.fallbackToWebGL) {
        console.log('🔄 降级到WebGL模式...')
        try {
          // 强制使用WebGL
          await rendererManager.initialize()
          await unifiedRenderingAPI.initialize()

          this.initialized = true

          return {
            success: true,
            rendererType: 'webgl',
            capabilities: null,
            message: 'WebGPU不可用，已自动降级到WebGL。所有功能正常工作。'
          }
        } catch (fallbackError) {
          console.error('❌ WebGL降级也失败:', fallbackError)
          throw fallbackError
        }
      }

      throw error
    }
  }

  /**
   * 获取系统状态
   */
  getSystemStatus() {
    return {
      initialized: this.initialized,
      config: this.config,
      rendererType: this.initialized ? rendererManager.getRendererType() : null,
      capabilities: this.capabilities,
      performanceStats: this.initialized ? unifiedRenderingAPI.getPerformanceStats() : null
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<WebGPUSystemConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 检查功能支持
   */
  supportsFeature(feature: string): boolean {
    if (!this.initialized) return false
    
    const rendererType = rendererManager.getRendererType()
    if (rendererType === 'webgpu') {
      return this.capabilities?.features.includes(feature) || false
    } else {
      return rendererManager.supportsFeature(feature)
    }
  }

  /**
   * 获取推荐的性能设置
   */
  getRecommendedSettings() {
    const rendererType = rendererManager.getRendererType()
    const performanceScore = this.capabilities?.supported ? 
      webgpuDetector.getPerformanceScore(this.capabilities) : 50

    if (rendererType === 'webgpu' && performanceScore >= 80) {
      return {
        quality: 'ultra',
        enableComputeShaders: true,
        enableAdvancedFeatures: true,
        particleCount: 50000,
        instanceCount: 20000
      }
    } else if (rendererType === 'webgpu' && performanceScore >= 60) {
      return {
        quality: 'high',
        enableComputeShaders: true,
        enableAdvancedFeatures: false,
        particleCount: 20000,
        instanceCount: 10000
      }
    } else {
      return {
        quality: 'medium',
        enableComputeShaders: false,
        enableAdvancedFeatures: false,
        particleCount: 5000,
        instanceCount: 5000
      }
    }
  }

  /**
   * 输出系统信息
   */
  private logSystemInfo(rendererType: RendererType): void {
    console.log('🎨 WebGPU系统初始化完成')
    console.log(`  渲染器类型: ${rendererType.toUpperCase()}`)
    console.log(`  WebGPU支持: ${this.capabilities?.supported ? '✅' : '❌'}`)
    
    if (this.capabilities?.supported) {
      const score = webgpuDetector.getPerformanceScore(this.capabilities)
      console.log(`  性能评分: ${score}/100`)
      console.log(`  支持功能: ${this.capabilities.features.length}个`)
    }

    const settings = this.getRecommendedSettings()
    console.log(`  推荐质量: ${settings.quality}`)
    console.log(`  计算着色器: ${settings.enableComputeShaders ? '✅' : '❌'}`)
  }

  /**
   * 清理系统资源
   */
  dispose(): void {
    if (this.initialized) {
      unifiedRenderingAPI.dispose()
      rendererManager.dispose()
      webgpuDetector.clearCache()
      
      this.initialized = false
      this.capabilities = null
      
      console.log('🧹 WebGPU系统资源已清理')
    }
  }
}

/**
 * 获取全局WebGPU系统管理器
 */
export const webgpuSystemManager = WebGPUSystemManager.getInstance()

/**
 * 便捷函数：初始化WebGPU系统
 */
export async function initializeWebGPUSystem(config?: Partial<WebGPUSystemConfig>) {
  const manager = WebGPUSystemManager.getInstance(config)
  return manager.initialize()
}

/**
 * 便捷函数：获取系统状态
 */
export function getWebGPUSystemStatus() {
  return webgpuSystemManager.getSystemStatus()
}

/**
 * 便捷函数：获取推荐设置
 */
export function getRecommendedSettings() {
  return webgpuSystemManager.getRecommendedSettings()
}
