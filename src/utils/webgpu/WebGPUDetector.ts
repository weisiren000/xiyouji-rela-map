/**
 * WebGPU能力检测器
 * 检测浏览器对WebGPU的支持情况并提供详细的能力信息
 */

import '@/types/webgpu' // 导入WebGPU类型定义

export interface WebGPUCapabilities {
  supported: boolean
  adapter: GPUAdapter | null
  device: GPUDevice | null
  features: string[]
  limits: Record<string, number>
  errorMessage?: string
}

export interface WebGPUFeatureSupport {
  computeShaders: boolean
  timestampQuery: boolean
  textureCompressionBC: boolean
  textureCompressionETC2: boolean
  textureCompressionASTC: boolean
  depthClipControl: boolean
  depth32floatStencil8: boolean
  indirectFirstInstance: boolean
}

export class WebGPUDetector {
  private static instance: WebGPUDetector
  private capabilities: WebGPUCapabilities | null = null
  private detectionPromise: Promise<WebGPUCapabilities> | null = null

  private constructor() {}

  static getInstance(): WebGPUDetector {
    if (!WebGPUDetector.instance) {
      WebGPUDetector.instance = new WebGPUDetector()
    }
    return WebGPUDetector.instance
  }

  /**
   * 检测WebGPU支持情况
   */
  async detectCapabilities(): Promise<WebGPUCapabilities> {
    // 如果已经检测过，返回缓存结果
    if (this.capabilities) {
      return this.capabilities
    }

    // 如果正在检测，返回现有的Promise
    if (this.detectionPromise) {
      return this.detectionPromise
    }

    // 开始新的检测
    this.detectionPromise = this.performDetection()
    this.capabilities = await this.detectionPromise
    
    return this.capabilities
  }

  /**
   * 执行实际的WebGPU检测
   */
  private async performDetection(): Promise<WebGPUCapabilities> {
    const result: WebGPUCapabilities = {
      supported: false,
      adapter: null,
      device: null,
      features: [],
      limits: {}
    }

    try {
      // 检查基础WebGPU支持
      if (!navigator.gpu) {
        result.errorMessage = 'WebGPU not available in this browser. 请检查：1) 浏览器版本是否为Chrome 113+或Edge 113+ 2) 是否启用了WebGPU标志 3) 是否在安全上下文(HTTPS/localhost)中'
        console.log('❌ navigator.gpu 不存在')
        console.log('💡 解决方案:')
        console.log('  1. Chrome/Edge: 访问 chrome://flags 搜索 "WebGPU" 并启用')
        console.log('  2. Firefox: 访问 about:config 设置 dom.webgpu.enabled = true')
        console.log('  3. 确保使用HTTPS或localhost')
        return result
      }

      console.log('🔍 检测WebGPU支持...')
      console.log('✅ navigator.gpu 可用')

      // 请求适配器
      console.log('🔍 请求WebGPU适配器...')
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
      })

      if (!adapter) {
        result.errorMessage = 'No WebGPU adapter available. 可能原因：1) GPU硬件不支持WebGPU 2) GPU驱动程序过旧 3) 硬件加速被禁用'
        console.log('❌ 无法获取WebGPU适配器')
        console.log('💡 解决方案:')
        console.log('  1. 更新显卡驱动程序到最新版本')
        console.log('  2. 检查浏览器设置中的硬件加速是否启用')
        console.log('  3. 确认GPU支持Vulkan或D3D12')
        return result
      }

      result.adapter = adapter

      // 获取适配器信息
      const adapterInfo = adapter.info
      console.log('📱 WebGPU适配器信息:', adapterInfo)

      // 请求设备
      const device = await adapter.requestDevice({
        requiredFeatures: [],
        requiredLimits: {}
      })

      if (!device) {
        result.errorMessage = 'Failed to create WebGPU device'
        return result
      }

      result.device = device
      result.supported = true

      // 获取支持的功能
      result.features = Array.from(adapter.features)
      
      // 获取限制信息
      const limits = adapter.limits
      result.limits = {
        maxTextureDimension1D: limits.maxTextureDimension1D,
        maxTextureDimension2D: limits.maxTextureDimension2D,
        maxTextureDimension3D: limits.maxTextureDimension3D,
        maxTextureArrayLayers: limits.maxTextureArrayLayers,
        maxBindGroups: limits.maxBindGroups,
        maxDynamicUniformBuffersPerPipelineLayout: limits.maxDynamicUniformBuffersPerPipelineLayout,
        maxDynamicStorageBuffersPerPipelineLayout: limits.maxDynamicStorageBuffersPerPipelineLayout,
        maxSampledTexturesPerShaderStage: limits.maxSampledTexturesPerShaderStage,
        maxSamplersPerShaderStage: limits.maxSamplersPerShaderStage,
        maxStorageBuffersPerShaderStage: limits.maxStorageBuffersPerShaderStage,
        maxStorageTexturesPerShaderStage: limits.maxStorageTexturesPerShaderStage,
        maxUniformBuffersPerShaderStage: limits.maxUniformBuffersPerShaderStage,
        maxUniformBufferBindingSize: limits.maxUniformBufferBindingSize,
        maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
        maxVertexBuffers: limits.maxVertexBuffers,
        maxVertexAttributes: limits.maxVertexAttributes,
        maxVertexBufferArrayStride: limits.maxVertexBufferArrayStride,
        maxComputeWorkgroupStorageSize: limits.maxComputeWorkgroupStorageSize,
        maxComputeInvocationsPerWorkgroup: limits.maxComputeInvocationsPerWorkgroup,
        maxComputeWorkgroupSizeX: limits.maxComputeWorkgroupSizeX,
        maxComputeWorkgroupSizeY: limits.maxComputeWorkgroupSizeY,
        maxComputeWorkgroupSizeZ: limits.maxComputeWorkgroupSizeZ,
        maxComputeWorkgroupsPerDimension: limits.maxComputeWorkgroupsPerDimension
      }

      console.log('✅ WebGPU检测成功')
      console.log('🚀 支持的功能:', result.features)
      console.log('📊 设备限制:', result.limits)

    } catch (error) {
      console.error('❌ WebGPU检测失败:', error)
      result.errorMessage = error instanceof Error ? error.message : 'Unknown WebGPU error'
    }

    return result
  }

  /**
   * 获取功能支持详情
   */
  getFeatureSupport(capabilities: WebGPUCapabilities): WebGPUFeatureSupport {
    const features = capabilities.features

    return {
      computeShaders: capabilities.supported, // WebGPU基础支持就包含计算着色器
      timestampQuery: features.includes('timestamp-query'),
      textureCompressionBC: features.includes('texture-compression-bc'),
      textureCompressionETC2: features.includes('texture-compression-etc2'),
      textureCompressionASTC: features.includes('texture-compression-astc'),
      depthClipControl: features.includes('depth-clip-control'),
      depth32floatStencil8: features.includes('depth32float-stencil8'),
      indirectFirstInstance: features.includes('indirect-first-instance')
    }
  }

  /**
   * 检查是否推荐使用WebGPU
   */
  isWebGPURecommended(capabilities: WebGPUCapabilities): boolean {
    if (!capabilities.supported) return false

    // 检查基本性能要求
    const limits = capabilities.limits
    const hasGoodLimits = 
      limits.maxTextureDimension2D >= 8192 &&
      limits.maxBindGroups >= 4 &&
      limits.maxUniformBuffersPerShaderStage >= 12

    // 检查是否有有用的功能
    const featureSupport = this.getFeatureSupport(capabilities)
    const hasUsefulFeatures = featureSupport.computeShaders

    return hasGoodLimits && hasUsefulFeatures
  }

  /**
   * 获取WebGPU性能评分 (0-100)
   */
  getPerformanceScore(capabilities: WebGPUCapabilities): number {
    if (!capabilities.supported) return 0

    let score = 50 // 基础分数

    const limits = capabilities.limits
    const features = this.getFeatureSupport(capabilities)

    // 纹理支持评分
    if (limits.maxTextureDimension2D >= 16384) score += 10
    else if (limits.maxTextureDimension2D >= 8192) score += 5

    // 绑定组支持评分
    if (limits.maxBindGroups >= 8) score += 10
    else if (limits.maxBindGroups >= 4) score += 5

    // 计算着色器评分
    if (features.computeShaders) score += 15

    // 纹理压缩评分
    if (features.textureCompressionBC) score += 5
    if (features.textureCompressionETC2) score += 5
    if (features.textureCompressionASTC) score += 5

    // 高级功能评分
    if (features.timestampQuery) score += 5
    if (features.indirectFirstInstance) score += 5

    return Math.min(100, score)
  }

  /**
   * 获取当前缓存的能力信息
   */
  getCachedCapabilities(): WebGPUCapabilities | null {
    return this.capabilities
  }

  /**
   * 清除缓存，强制重新检测
   */
  clearCache(): void {
    this.capabilities = null
    this.detectionPromise = null
  }
}

/**
 * 获取全局WebGPU检测器实例
 */
export const webgpuDetector = WebGPUDetector.getInstance()

/**
 * 便捷函数：检测WebGPU支持
 */
export async function detectWebGPU(): Promise<WebGPUCapabilities> {
  return webgpuDetector.detectCapabilities()
}

/**
 * 便捷函数：检查WebGPU是否可用且推荐使用
 */
export async function isWebGPURecommended(): Promise<boolean> {
  const capabilities = await detectWebGPU()
  return webgpuDetector.isWebGPURecommended(capabilities)
}
