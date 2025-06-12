import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

import { PulseManager } from './PulseManager'
import { NetworkNode } from './NetworkNode'
import { NetworkGenerator } from './NetworkGenerator'
import { nodeShader } from '@/shaders/nodeShader'
import { connectionShader } from '@/shaders/connectionShader'
import { APP_CONSTANTS, COLOR_PALETTES, DEFAULT_CONFIG } from '@/utils/constants'
import { AppConfig, ShaderUniforms } from '@/types'

/**
 * 神经网络可视化主应用类
 * 管理整个3D场景、渲染器、相机和交互
 */
export class NeuralNetworkApp {
  // 核心Three.js对象
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls!: OrbitControls
  private composer!: EffectComposer

  // 应用状态
  private config: AppConfig = { ...DEFAULT_CONFIG }
  private isRunning = false
  private clock = new THREE.Clock()

  // 管理器
  private pulseManager!: PulseManager

  // 网络数据
  private nodes: NetworkNode[] = []
  private nodesMesh!: THREE.Points
  private connectionsMesh!: THREE.LineSegments
  private shaderUniforms!: ShaderUniforms

  // 容器元素
  private container!: HTMLElement

  /**
   * 初始化应用
   */
  public async init(): Promise<void> {
    try {
      // 获取容器元素
      this.container = document.getElementById('app')!
      if (!this.container) {
        throw new Error('找不到应用容器元素')
      }

      // 初始化Three.js核心组件
      this.initScene()
      this.initCamera()
      this.initRenderer()
      this.initControls()
      this.initPostProcessing()

      // 初始化管理器
      this.initManagers()

      // 生成初始网络
      await this.generateNetwork()

      // 初始化UI
      this.initUI()

      // 设置事件监听
      this.setupEventListeners()

      console.log('✅ 神经网络应用初始化完成')

    } catch (error) {
      console.error('❌ 应用初始化失败:', error)
      throw error
    }
  }

  /**
   * 初始化场景
   */
  private initScene(): void {
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(
      APP_CONSTANTS.FOG.COLOR,
      APP_CONSTANTS.FOG.DENSITY
    )

    // 添加星空背景
    this.createStarfield()
  }

  /**
   * 初始化相机
   */
  private initCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      APP_CONSTANTS.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      APP_CONSTANTS.CAMERA.NEAR,
      APP_CONSTANTS.CAMERA.FAR
    )
    this.camera.position.copy(APP_CONSTANTS.CAMERA.INITIAL_POSITION)
  }

  /**
   * 初始化渲染器
   */
  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: APP_CONSTANTS.RENDERER.ANTIALIAS,
      powerPreference: APP_CONSTANTS.RENDERER.POWER_PREFERENCE,
    })

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, APP_CONSTANTS.RENDERER.MAX_PIXEL_RATIO))
    this.renderer.setClearColor(APP_CONSTANTS.RENDERER.CLEAR_COLOR)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    // 将canvas添加到容器
    const canvas = this.renderer.domElement
    canvas.id = 'neural-network-canvas'
    this.container.appendChild(canvas)
  }

  /**
   * 初始化控制器
   */
  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    
    const controlsConfig = APP_CONSTANTS.CONTROLS
    this.controls.enableDamping = controlsConfig.ENABLE_DAMPING
    this.controls.dampingFactor = controlsConfig.DAMPING_FACTOR
    this.controls.rotateSpeed = controlsConfig.ROTATE_SPEED
    this.controls.minDistance = controlsConfig.MIN_DISTANCE
    this.controls.maxDistance = controlsConfig.MAX_DISTANCE
    this.controls.autoRotate = controlsConfig.AUTO_ROTATE
    this.controls.autoRotateSpeed = controlsConfig.AUTO_ROTATE_SPEED
    this.controls.enablePan = controlsConfig.ENABLE_PAN
  }

  /**
   * 初始化后处理
   */
  private initPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))

    // 辉光效果
    const bloomConfig = APP_CONSTANTS.POST_PROCESSING.BLOOM
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomConfig.STRENGTH,
      bloomConfig.RADIUS,
      bloomConfig.THRESHOLD
    )
    this.composer.addPass(bloomPass)

    this.composer.addPass(new OutputPass())
  }

  /**
   * 初始化管理器
   */
  private initManagers(): void {
    this.pulseManager = new PulseManager(COLOR_PALETTES, APP_CONSTANTS.PULSE.MAX_COUNT)
  }

  /**
   * 创建星空背景
   */
  private createStarfield(): void {
    const starConfig = APP_CONSTANTS.STARFIELD
    const positions: number[] = []

    for (let i = 0; i < starConfig.COUNT; i++) {
      const r = THREE.MathUtils.randFloat(starConfig.MIN_RADIUS, starConfig.MAX_RADIUS)
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2))
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2)

      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: starConfig.SIZE,
      sizeAttenuation: true,
      depthWrite: false,
      opacity: starConfig.OPACITY,
      transparent: true,
    })

    const starField = new THREE.Points(geometry, material)
    this.scene.add(starField)
  }

  /**
   * 生成网络
   */
  private async generateNetwork(): Promise<void> {
    // 清除现有网络
    this.nodes = []

    // 生成网络结构
    this.nodes = NetworkGenerator.generateNetwork(
      this.config.currentFormation,
      this.config.densityFactor
    )

    // 创建渲染对象
    this.createNetworkMeshes()

    console.log(`✅ 生成了 ${this.nodes.length} 个节点的网络`)
  }

  /**
   * 创建网络渲染对象
   */
  private createNetworkMeshes(): void {
    // 清除现有的网格
    if (this.nodesMesh) {
      this.scene.remove(this.nodesMesh)
    }
    if (this.connectionsMesh) {
      this.scene.remove(this.connectionsMesh)
    }

    // 创建着色器制服变量
    this.shaderUniforms = {
      uTime: { value: 0.0 },
      uPulsePositions: { value: [new THREE.Vector3(1000, 1000, 1000), new THREE.Vector3(1000, 1000, 1000), new THREE.Vector3(1000, 1000, 1000)] },
      uPulseTimes: { value: [-1000, -1000, -1000] },
      uPulseColors: { value: [new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1)] },
      uPulseSpeed: { value: APP_CONSTANTS.PULSE.SPEED },
      uBaseNodeSize: { value: APP_CONSTANTS.NETWORK.BASE_NODE_SIZE },
      uActivePalette: { value: this.config.activePaletteIndex }
    }

    // 创建节点几何体
    this.createNodesMesh()

    // 创建连接线几何体
    this.createConnectionsMesh()
  }

  /**
   * 创建节点网格
   */
  private createNodesMesh(): void {
    const positions: number[] = []
    const colors: number[] = []
    const sizes: number[] = []
    const types: number[] = []
    const distances: number[] = []

    const palette = COLOR_PALETTES[this.config.activePaletteIndex]

    for (const node of this.nodes) {
      // 位置
      positions.push(node.position.x, node.position.y, node.position.z)

      // 颜色（根据节点类型和层级）
      const colorIndex = node.level % palette.length
      const color = palette[colorIndex]
      colors.push(color.r, color.g, color.b)

      // 大小
      sizes.push(node.size)

      // 类型
      types.push(node.type)

      // 距离
      distances.push(node.distanceFromRoot)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('nodeColor', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('nodeSize', new THREE.Float32BufferAttribute(sizes, 1))
    geometry.setAttribute('nodeType', new THREE.Float32BufferAttribute(types, 1))
    geometry.setAttribute('distanceFromRoot', new THREE.Float32BufferAttribute(distances, 1))

    const material = new THREE.ShaderMaterial({
      vertexShader: nodeShader.vertexShader,
      fragmentShader: nodeShader.fragmentShader,
      uniforms: this.shaderUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    this.nodesMesh = new THREE.Points(geometry, material)
    this.scene.add(this.nodesMesh)
  }

  /**
   * 创建连接线网格
   */
  private createConnectionsMesh(): void {
    const positions: number[] = []
    const colors: number[] = []
    const startPoints: number[] = []
    const endPoints: number[] = []
    const strengths: number[] = []
    const pathIndices: number[] = []

    const palette = COLOR_PALETTES[this.config.activePaletteIndex]
    let pathIndex = 0

    // 收集所有连接
    for (const node of this.nodes) {
      for (const connection of node.connections) {
        // 避免重复连接
        if (node.position.x < connection.node.position.x ||
           (node.position.x === connection.node.position.x && node.position.y < connection.node.position.y)) {

          const segments = 20 // 每条连接的分段数
          const colorIndex = Math.floor(pathIndex / 2) % palette.length
          const color = palette[colorIndex]

          for (let i = 0; i <= segments; i++) {
            const t = i / segments

            // 位置（用于贝塞尔曲线插值）
            positions.push(t, 0, 0)

            // 颜色
            colors.push(color.r, color.g, color.b)

            // 起点和终点
            startPoints.push(node.position.x, node.position.y, node.position.z)
            endPoints.push(connection.node.position.x, connection.node.position.y, connection.node.position.z)

            // 连接强度
            strengths.push(connection.strength)

            // 路径索引
            pathIndices.push(pathIndex)
          }

          pathIndex++
        }
      }
    }

    if (positions.length === 0) return

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('connectionColor', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('startPoint', new THREE.Float32BufferAttribute(startPoints, 3))
    geometry.setAttribute('endPoint', new THREE.Float32BufferAttribute(endPoints, 3))
    geometry.setAttribute('connectionStrength', new THREE.Float32BufferAttribute(strengths, 1))
    geometry.setAttribute('pathIndex', new THREE.Float32BufferAttribute(pathIndices, 1))

    const material = new THREE.ShaderMaterial({
      vertexShader: connectionShader.vertexShader,
      fragmentShader: connectionShader.fragmentShader,
      uniforms: this.shaderUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    this.connectionsMesh = new THREE.LineSegments(geometry, material)
    this.scene.add(this.connectionsMesh)
  }

  /**
   * 更新着色器制服变量
   */
  private updateShaderUniforms(elapsedTime: number): void {
    if (!this.shaderUniforms) return

    // 更新时间
    this.shaderUniforms.uTime.value = elapsedTime

    // 更新脉冲数据
    const pulseData = this.pulseManager.getPulseData()
    this.shaderUniforms.uPulsePositions.value = pulseData.positions
    this.shaderUniforms.uPulseTimes.value = pulseData.times
    this.shaderUniforms.uPulseColors.value = pulseData.colors

    // 更新调色板索引
    this.shaderUniforms.uActivePalette.value = this.config.activePaletteIndex
  }

  /**
   * 设置主题按钮
   */
  private setupThemeButtons(): void {
    const themeButtons = document.querySelectorAll('.theme-button')
    themeButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        this.setActiveTheme(index)
      })
    })
  }

  /**
   * 设置密度滑块
   */
  private setupDensitySlider(): void {
    const slider = document.getElementById('density-slider') as HTMLInputElement
    const valueDisplay = document.getElementById('density-value')

    if (slider && valueDisplay) {
      slider.addEventListener('input', () => {
        const value = parseInt(slider.value)
        valueDisplay.textContent = `${value}%`
        this.config.densityFactor = value / 100
        this.regenerateNetwork()
      })
    }
  }

  /**
   * 设置控制按钮
   */
  private setupControlButtons(): void {
    // 形态切换按钮
    const formationBtn = document.getElementById('change-formation-btn')
    if (formationBtn) {
      formationBtn.addEventListener('click', () => {
        this.config.currentFormation = (this.config.currentFormation + 1) % this.config.numFormations
        this.regenerateNetwork()
      })
    }

    // 暂停/播放按钮
    const pauseBtn = document.getElementById('pause-play-btn')
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.config.paused = !this.config.paused
        pauseBtn.textContent = this.config.paused ? '播放' : '暂停'
      })
    }

    // 重置相机按钮
    const resetBtn = document.getElementById('reset-camera-btn')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetCamera()
      })
    }
  }

  /**
   * 设置活跃主题
   */
  private setActiveTheme(themeIndex: number): void {
    this.config.activePaletteIndex = themeIndex
    this.pulseManager.setActivePalette(themeIndex)

    // 更新UI
    const themeButtons = document.querySelectorAll('.theme-button')
    themeButtons.forEach((button, index) => {
      button.classList.toggle('active', index === themeIndex)
    })

    // 重新生成网络以应用新颜色
    this.regenerateNetwork()
  }

  /**
   * 重新生成网络
   */
  private async regenerateNetwork(): Promise<void> {
    await this.generateNetwork()
  }

  /**
   * 重置相机
   */
  private resetCamera(): void {
    this.camera.position.copy(APP_CONSTANTS.CAMERA.INITIAL_POSITION)
    this.controls.reset()
  }

  /**
   * 初始化UI
   */
  private initUI(): void {
    // 设置主题按钮
    this.setupThemeButtons()

    // 设置密度滑块
    this.setupDensitySlider()

    // 设置控制按钮
    this.setupControlButtons()

    // 设置初始主题
    this.setActiveTheme(this.config.activePaletteIndex)

    console.log('🎨 UI初始化完成')
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 窗口大小变化
    window.addEventListener('resize', () => this.handleResize())

    // 鼠标点击创建脉冲
    this.renderer.domElement.addEventListener('click', (event) => {
      this.handleClick(event)
    })
  }

  /**
   * 处理窗口大小变化
   */
  public handleResize(): void {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.composer.setSize(width, height)
  }

  /**
   * 处理鼠标点击
   */
  private handleClick(_event: MouseEvent): void {
    // 创建脉冲
    const clickPosition = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(20),
      THREE.MathUtils.randFloatSpread(10),
      THREE.MathUtils.randFloatSpread(20)
    )
    
    this.pulseManager.createPulse(clickPosition, this.clock.getElapsedTime())
  }

  /**
   * 启动应用
   */
  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true
      this.animate()
      console.log('🚀 应用开始运行')
    }
  }

  /**
   * 暂停应用
   */
  public pause(): void {
    this.config.paused = true
  }

  /**
   * 恢复应用
   */
  public resume(): void {
    this.config.paused = false
  }

  /**
   * 动画循环
   */
  private animate = (): void => {
    if (!this.isRunning) return

    requestAnimationFrame(this.animate)

    if (!this.config.paused) {
      const elapsedTime = this.clock.getElapsedTime()

      // 更新脉冲管理器
      this.pulseManager.update(elapsedTime)

      // 更新着色器制服变量
      this.updateShaderUniforms(elapsedTime)

      // 更新控制器
      this.controls.update()
    }

    // 渲染场景
    this.composer.render()
  }

  /**
   * 销毁应用
   */
  public dispose(): void {
    this.isRunning = false
    
    // 清理资源
    this.scene.clear()
    this.renderer.dispose()
    this.composer.dispose()
    
    console.log('🗑️ 应用资源已清理')
  }
}
