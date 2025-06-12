import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SceneConfig, AppState, AnimationParams } from '@/types';
import { DEFAULT_SCENE_CONFIG, COLORS, ANIMATION_CONFIG } from '@/utils/config';
import { handleResize, toggleLoading, handleError, performanceMonitor } from '@/utils/helpers';
import { StarField } from './StarField';
import { Galaxy } from './Galaxy';

/**
 * 场景管理器
 * 负责管理整个3D场景的创建、更新和渲染
 */
export class SceneManager {
  /** Three.js 场景 */
  private scene: THREE.Scene;
  /** 相机 */
  private camera: THREE.PerspectiveCamera;
  /** 渲染器 */
  private renderer: THREE.WebGLRenderer;
  /** 轨道控制器 */
  private controls: OrbitControls;
  /** 星空场景 */
  private starField: StarField;
  /** 银河系 */
  private galaxy: Galaxy;
  /** 环境光 */
  private ambientLight: THREE.AmbientLight;
  /** 应用状态 */
  private state: AppState;
  /** 配置 */
  private config: SceneConfig;
  /** 动画ID */
  private animationId: number | null = null;
  /** 上一帧时间 */
  private lastTime = 0;

  /**
   * 创建场景管理器
   * @param container 容器元素
   * @param config 场景配置
   */
  constructor(container: HTMLElement, config: Partial<SceneConfig> = {}) {
    this.config = { ...DEFAULT_SCENE_CONFIG, ...config };
    this.state = {
      isLoading: true,
      isInitialized: false
    };

    try {
      this.initScene();
      this.initCamera();
      this.initRenderer(container);
      this.initControls();
      this.initLighting();
      this.initComponents();
      this.setupEventListeners();
      
      this.state.isInitialized = true;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : '未知错误';
      handleError(error as Error, 'SceneManager初始化');
    }
  }

  /**
   * 初始化场景
   */
  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.background);
  }

  /**
   * 初始化相机
   */
  private initCamera(): void {
    const { camera: cameraConfig } = this.config;
    
    this.camera = new THREE.PerspectiveCamera(
      cameraConfig.fov,
      window.innerWidth / window.innerHeight,
      cameraConfig.near,
      cameraConfig.far
    );
    
    this.camera.position.copy(cameraConfig.position);
  }

  /**
   * 初始化渲染器
   */
  private initRenderer(container: HTMLElement): void {
    const { renderer: rendererConfig } = this.config;
    
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: rendererConfig.antialias 
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(rendererConfig.pixelRatio);
    
    container.appendChild(this.renderer.domElement);
  }

  /**
   * 初始化控制器
   */
  private initControls(): void {
    const { controls: controlsConfig } = this.config;
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = controlsConfig.enableDamping;
    this.controls.dampingFactor = controlsConfig.dampingFactor;
  }

  /**
   * 初始化光照
   */
  private initLighting(): void {
    this.ambientLight = new THREE.AmbientLight(COLORS.ambientLight);
    this.scene.add(this.ambientLight);
  }

  /**
   * 初始化组件
   */
  private initComponents(): void {
    // 创建星空
    this.starField = new StarField();
    this.scene.add(this.starField.points);
    
    // 创建银河系
    this.galaxy = new Galaxy();
    this.scene.add(this.galaxy.group);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      handleResize(this.camera, this.renderer);
    });
  }

  /**
   * 开始渲染循环
   */
  public start(): void {
    if (!this.state.isInitialized) {
      console.warn('场景未初始化，无法开始渲染');
      return;
    }

    // 延迟隐藏加载界面
    setTimeout(() => {
      this.state.isLoading = false;
      toggleLoading(false);
      this.animate(0);
    }, ANIMATION_CONFIG.loadingDelay);
  }

  /**
   * 动画循环
   */
  private animate = (time: number): void => {
    this.animationId = requestAnimationFrame(this.animate);
    
    const delta = time - this.lastTime;
    this.lastTime = time;
    
    const animationParams: AnimationParams = { time, delta };
    
    // 更新组件
    this.starField.update(animationParams);
    this.galaxy.update(animationParams);
    
    // 更新控制器
    this.controls.update();
    
    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * 停止渲染循环
   */
  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    this.stop();
    
    // 释放组件资源
    this.starField?.dispose();
    this.galaxy?.dispose();
    
    // 释放渲染器资源
    this.renderer.dispose();
    
    // 移除事件监听器
    window.removeEventListener('resize', () => {
      handleResize(this.camera, this.renderer);
    });
  }

  /**
   * 获取应用状态
   */
  public getState(): AppState {
    return { ...this.state };
  }
}
