import * as THREE from 'three'
import { webgpuDetector, WebGPUCapabilities } from './WebGPUDetector'

/**
 * 渲染器类型
 */
export type RendererType = 'webgl' | 'webgpu'

/**
 * 渲染器配置
 */
export interface RendererConfig {
  antialias: boolean
  alpha: boolean
  powerPreference: 'default' | 'high-performance' | 'low-power'
  stencil: boolean
  depth: boolean
  logarithmicDepthBuffer: boolean
  precision: 'highp' | 'mediump' | 'lowp'
  premultipliedAlpha: boolean
  preserveDrawingBuffer: boolean
  failIfMajorPerformanceCaveat: boolean
}

/**
 * 渲染器信息
 */
export interface RendererInfo {
  type: RendererType
  version: string
  vendor: string
  renderer: string
  capabilities: any
  extensions: string[]
  maxTextureSize: number
  maxCubeTextureSize: number
  maxVertexTextures: number
  maxFragmentTextures: number
  maxVaryings: number
  maxVertexAttributes: number
  maxVertexUniformVectors: number
  maxFragmentUniformVectors: number
}

/**
 * 渲染器管理器
 * 统一管理WebGL和WebGPU渲染器，提供自动降级和性能优化
 */
export class RendererManager {
  private static instance: RendererManager
  private renderer: THREE.WebGLRenderer | any = null
  private rendererType: RendererType = 'webgl'
  private canvas: HTMLCanvasElement | null = null
  private webgpuCapabilities: WebGPUCapabilities | null = null
  private config: RendererConfig
  private initialized = false

  private constructor(config: Partial<RendererConfig> = {}) {
    this.config = {
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: true,
      depth: true,
      logarithmicDepthBuffer: false,
      precision: 'highp',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
      ...config
    }
  }

  static getInstance(config?: Partial<RendererConfig>): RendererManager {
    if (!RendererManager.instance) {
      RendererManager.instance = new RendererManager(config)
    }
    return RendererManager.instance
  }

  /**
   * 初始化渲染器
   */
  async initialize(canvas?: HTMLCanvasElement): Promise<THREE.WebGLRenderer | any> {
    if (this.initialized && this.renderer) {
      return this.renderer
    }

    console.log('🎨 初始化渲染器管理器...')

    // 检测WebGPU支持
    this.webgpuCapabilities = await webgpuDetector.detectCapabilities()
    
    // 决定使用哪种渲染器
    const useWebGPU = this.shouldUseWebGPU()
    
    if (useWebGPU) {
      console.log('🚀 尝试初始化WebGPU渲染器...')
      try {
        this.renderer = await this.createWebGPURenderer(canvas)
        this.rendererType = 'webgpu'
        console.log('✅ WebGPU渲染器初始化成功')
      } catch (error) {
        console.warn('⚠️ WebGPU渲染器初始化失败，降级到WebGL:', error)
        this.renderer = this.createWebGLRenderer(canvas)
        this.rendererType = 'webgl'
      }
    } else {
      console.log('🔧 使用WebGL渲染器')
      this.renderer = this.createWebGLRenderer(canvas)
      this.rendererType = 'webgl'
    }

    this.canvas = canvas || this.renderer.domElement
    this.initialized = true

    // 输出渲染器信息
    this.logRendererInfo()

    return this.renderer
  }

  /**
   * 判断是否应该使用WebGPU
   */
  private shouldUseWebGPU(): boolean {
    if (!this.webgpuCapabilities?.supported) {
      return false
    }

    // 检查是否推荐使用WebGPU
    const recommended = webgpuDetector.isWebGPURecommended(this.webgpuCapabilities)
    
    // 可以添加更多的判断逻辑，比如用户设置、性能要求等
    return recommended
  }

  /**
   * 创建WebGPU渲染器
   */
  private async createWebGPURenderer(canvas?: HTMLCanvasElement): Promise<any> {
    // 注意：Three.js的WebGPU支持还在开发中
    // 当前版本(0.160.0)还没有正式的WebGPURenderer

    console.log('🔍 检查Three.js WebGPU支持...')

    // 检查是否有WebGPU渲染器
    const hasWebGPURenderer = (THREE as any).WebGPURenderer ||
                              (THREE as any).WebGPURenderer ||
                              false

    if (!hasWebGPURenderer) {
      throw new Error(`Three.js WebGPU renderer not available in version ${THREE.REVISION}. WebGPU支持预计在Three.js r161+版本中提供。`)
    }

    try {
      const renderer = new (THREE as any).WebGPURenderer({
        canvas: canvas,
        antialias: this.config.antialias,
        alpha: this.config.alpha,
        powerPreference: this.config.powerPreference
      })

      // 等待WebGPU初始化
      if (renderer.init) {
        await renderer.init()
      }

      return renderer
    } catch (error) {
      console.error('WebGPU渲染器创建失败:', error)
      throw error
    }
  }

  /**
   * 创建WebGL渲染器
   */
  private createWebGLRenderer(canvas?: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: this.config.antialias,
      alpha: this.config.alpha,
      powerPreference: this.config.powerPreference,
      stencil: this.config.stencil,
      depth: this.config.depth,
      logarithmicDepthBuffer: this.config.logarithmicDepthBuffer,
      precision: this.config.precision,
      premultipliedAlpha: this.config.premultipliedAlpha,
      preserveDrawingBuffer: this.config.preserveDrawingBuffer,
      failIfMajorPerformanceCaveat: this.config.failIfMajorPerformanceCaveat
    })

    // WebGL特定的优化设置
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    return renderer
  }

  /**
   * 获取当前渲染器
   */
  getRenderer(): THREE.WebGLRenderer | any {
    if (!this.initialized || !this.renderer) {
      throw new Error('Renderer not initialized. Call initialize() first.')
    }
    return this.renderer
  }

  /**
   * 获取渲染器类型
   */
  getRendererType(): RendererType {
    return this.rendererType
  }

  /**
   * 获取渲染器信息
   */
  getRendererInfo(): RendererInfo {
    if (!this.renderer) {
      throw new Error('Renderer not initialized')
    }

    if (this.rendererType === 'webgl') {
      const gl = this.renderer.getContext()
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      
      return {
        type: 'webgl',
        version: gl.getParameter(gl.VERSION),
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        capabilities: this.renderer.capabilities,
        extensions: gl.getSupportedExtensions() || [],
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxCubeTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
        maxVertexTextures: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        maxFragmentTextures: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        maxVaryings: gl.getParameter(gl.MAX_VARYING_VECTORS),
        maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)
      }
    } else {
      // WebGPU信息
      return {
        type: 'webgpu',
        version: 'WebGPU',
        vendor: 'WebGPU',
        renderer: 'WebGPU',
        capabilities: this.webgpuCapabilities,
        extensions: this.webgpuCapabilities?.features || [],
        maxTextureSize: this.webgpuCapabilities?.limits.maxTextureDimension2D || 0,
        maxCubeTextureSize: this.webgpuCapabilities?.limits.maxTextureDimension2D || 0,
        maxVertexTextures: 16, // WebGPU默认值
        maxFragmentTextures: 16,
        maxVaryings: 16,
        maxVertexAttributes: this.webgpuCapabilities?.limits.maxVertexAttributes || 0,
        maxVertexUniformVectors: 256,
        maxFragmentUniformVectors: 256
      }
    }
  }

  /**
   * 检查是否支持特定功能
   */
  supportsFeature(feature: string): boolean {
    if (this.rendererType === 'webgl') {
      const gl = this.renderer.getContext()
      return gl.getExtension(feature) !== null
    } else {
      return this.webgpuCapabilities?.features.includes(feature) || false
    }
  }

  /**
   * 设置渲染器大小
   */
  setSize(width: number, height: number, updateStyle = true): void {
    if (this.renderer) {
      this.renderer.setSize(width, height, updateStyle)
    }
  }

  /**
   * 设置像素比
   */
  setPixelRatio(ratio: number): void {
    if (this.renderer) {
      this.renderer.setPixelRatio(ratio)
    }
  }

  /**
   * 输出渲染器信息
   */
  private logRendererInfo(): void {
    const info = this.getRendererInfo()
    console.log('🎨 渲染器信息:')
    console.log(`  类型: ${info.type.toUpperCase()}`)
    console.log(`  版本: ${info.version}`)
    console.log(`  厂商: ${info.vendor}`)
    console.log(`  渲染器: ${info.renderer}`)
    console.log(`  最大纹理尺寸: ${info.maxTextureSize}`)
    console.log(`  最大顶点属性: ${info.maxVertexAttributes}`)
    
    if (this.rendererType === 'webgpu') {
      const score = webgpuDetector.getPerformanceScore(this.webgpuCapabilities!)
      console.log(`  性能评分: ${score}/100`)
    }
  }

  /**
   * 销毁渲染器
   */
  dispose(): void {
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer = null
    }
    this.initialized = false
    this.canvas = null
  }
}

/**
 * 获取全局渲染器管理器实例
 */
export const rendererManager = RendererManager.getInstance()
