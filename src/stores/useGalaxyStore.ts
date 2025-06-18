import { create } from 'zustand'
import { GalaxyConfig, FogConfig, BloomConfig, PlanetData } from '../types/galaxy'
import { CharacterData } from '../types/character'
import { Vector3 } from 'three'
import { CharacterData } from '../types/character'

/**
 * 银河系状态管理
 * 1:1复刻原始HTML文件的参数配置
 */

interface GalaxyState {
  // 配置
  galaxyConfig: GalaxyConfig
  fogConfig: FogConfig
  bloomConfig: BloomConfig

  // 数据
  planets: PlanetData[]

  // 视图状态管理
  viewMode: 'galaxy' | 'detail'
  selectedCharacter: CharacterData | null
  detailViewCameraPosition: Vector3

  // 控制状态
  isAnimating: boolean
  rotationSpeed: number
  sunRotationSpeed: number

  // 相机控制
  cameraAutoRotate: boolean
  cameraRotateSpeed: number

  // 相机位置控制
  cameraPositionX: number
  cameraPositionY: number
  cameraPositionZ: number

  // 相机旋转控制
  cameraRotationX: number
  cameraRotationY: number
  cameraRotationZ: number

  // 相机视野控制
  cameraFov: number
  cameraNear: number
  cameraFar: number

  // 相机目标点控制
  cameraTargetX: number
  cameraTargetY: number
  cameraTargetZ: number

  // 背景星空控制
  starFieldVisible: boolean
  starFieldOpacity: number
  starFieldSize: number

  // 重新生成控制
  needsRegeneration: boolean

  // 性能控制
  performanceLevel: 'low' | 'medium' | 'high' | 'ultra'
  autoPerformance: boolean
  maxFPS: number

  // 操作方法
  updateGalaxyConfig: (config: Partial<GalaxyConfig>) => void
  updateFogConfig: (config: Partial<FogConfig>) => void
  updateBloomConfig: (config: Partial<BloomConfig>) => void
  setPlanets: (planets: PlanetData[]) => void
  setAnimating: (isAnimating: boolean) => void
  setRotationSpeed: (speed: number) => void
  setSunRotationSpeed: (speed: number) => void
  setCameraAutoRotate: (autoRotate: boolean) => void
  setCameraRotateSpeed: (speed: number) => void

  // 视图状态管理方法
  setViewMode: (mode: 'galaxy' | 'detail') => void
  setSelectedCharacter: (character: CharacterData | null) => void
  setDetailViewCameraPosition: (position: Vector3) => void
  enterDetailView: (character: CharacterData) => void
  exitDetailView: () => void

  // 相机位置控制方法
  setCameraPosition: (x: number, y: number, z: number) => void
  setCameraPositionX: (x: number) => void
  setCameraPositionY: (y: number) => void
  setCameraPositionZ: (z: number) => void

  // 相机旋转控制方法
  setCameraRotation: (x: number, y: number, z: number) => void
  setCameraRotationX: (x: number) => void
  setCameraRotationY: (y: number) => void
  setCameraRotationZ: (z: number) => void

  // 相机视野控制方法
  setCameraFov: (fov: number) => void
  setCameraNear: (near: number) => void
  setCameraFar: (far: number) => void

  // 相机目标点控制方法
  setCameraTarget: (x: number, y: number, z: number) => void
  setCameraTargetX: (x: number) => void
  setCameraTargetY: (y: number) => void
  setCameraTargetZ: (z: number) => void

  // 相机预设方法
  applyCameraPreset: (preset: string) => void
  saveCameraPreset: (name: string) => void
  resetCameraToDefault: () => void
  setStarFieldVisible: (visible: boolean) => void
  setStarFieldOpacity: (opacity: number) => void
  setStarFieldSize: (size: number) => void
  triggerRegeneration: () => void
  setPerformanceLevel: (level: 'low' | 'medium' | 'high' | 'ultra') => void
  setAutoPerformance: (auto: boolean) => void
  setMaxFPS: (fps: number) => void
}

export const useGalaxyStore = create<GalaxyState>((set) => ({
  // 默认配置 - 1:1复刻原始HTML参数
  galaxyConfig: {
    planetCount: 8000,              // const planetCount = 8000;
    galaxyRadius: 50.0,             // const galaxyRadius = 50.0
    numArms: 3,                     // numArms = 3
    armTightness: 8.0,              // armTightness = 8.0
    armWidth: 1.2,                  // armWidth = 1.2
    waveAmplitude: 1.8,             // const waveAmplitude = 1.8
    waveFrequency: 0.4,             // waveFrequency = 0.4
    maxEmissiveIntensity: 0.2,      // 星球发光强度默认值
  },
  
  fogConfig: {
    opacity: 0.01,    // fogOpacity: 0.01
    size: 3,          // fogSize: 3
    color: '#dddddd', // 与原始HTML一致
  },
  
  bloomConfig: {
    threshold: 0.0,  // bloomThreshold: 0.0 - 让所有发光都产生辉光
    strength: 1.2,   // bloomStrength: 1.2 - 增强辉光强度
    radius: 0.4,     // bloomRadius: 0.4 - 增大辉光半径
  },
  
  // 初始数据
  planets: [],

  // 视图状态初始值
  viewMode: 'galaxy',
  selectedCharacter: null,
  detailViewCameraPosition: new Vector3(0, 10, 20), // 详情视图的固定相机位置

  isAnimating: true,
  rotationSpeed: 1.0,
  sunRotationSpeed: 1.0,

  // 相机控制
  cameraAutoRotate: false,
  cameraRotateSpeed: 0.5,

  // 相机位置控制 (默认入场视角)
  cameraPositionX: 0,
  cameraPositionY: 45,
  cameraPositionZ: 65,

  // 相机旋转控制 (弧度制)
  cameraRotationX: 0,
  cameraRotationY: 0,
  cameraRotationZ: 0,

  // 相机视野控制
  cameraFov: 75,
  cameraNear: 0.1,
  cameraFar: 1000,

  // 相机目标点控制 (OrbitControls target)
  cameraTargetX: 0,
  cameraTargetY: 0,
  cameraTargetZ: 0,

  // 背景星空控制
  starFieldVisible: true,
  starFieldOpacity: 0.8,
  starFieldSize: 0.7,

  // 重新生成控制
  needsRegeneration: false,

  // 性能控制
  performanceLevel: 'high',
  autoPerformance: false,  // 默认关闭自动调节，避免影响查看体验
  maxFPS: 60,
  
  // 操作方法
  updateGalaxyConfig: (config) =>
    set((state) => ({
      galaxyConfig: { ...state.galaxyConfig, ...config },
    })),
    
  updateFogConfig: (config) =>
    set((state) => ({
      fogConfig: { ...state.fogConfig, ...config },
    })),
    
  updateBloomConfig: (config) =>
    set((state) => ({
      bloomConfig: { ...state.bloomConfig, ...config },
    })),
    
  setPlanets: (planets) => set({ planets }),
  setAnimating: (isAnimating) => set({ isAnimating }),
  setRotationSpeed: (speed) => set({ rotationSpeed: speed }),
  setSunRotationSpeed: (speed) => set({ sunRotationSpeed: speed }),
  setCameraAutoRotate: (autoRotate) => set({ cameraAutoRotate: autoRotate }),
  setCameraRotateSpeed: (speed) => set({ cameraRotateSpeed: speed }),

  // 相机位置控制方法实现
  setCameraPosition: (x, y, z) => set({
    cameraPositionX: x,
    cameraPositionY: y,
    cameraPositionZ: z
  }),
  setCameraPositionX: (x) => set({ cameraPositionX: x }),
  setCameraPositionY: (y) => set({ cameraPositionY: y }),
  setCameraPositionZ: (z) => set({ cameraPositionZ: z }),

  // 相机旋转控制方法实现
  setCameraRotation: (x, y, z) => set({
    cameraRotationX: x,
    cameraRotationY: y,
    cameraRotationZ: z
  }),
  setCameraRotationX: (x) => set({ cameraRotationX: x }),
  setCameraRotationY: (y) => set({ cameraRotationY: y }),
  setCameraRotationZ: (z) => set({ cameraRotationZ: z }),

  // 相机视野控制方法实现
  setCameraFov: (fov) => set({ cameraFov: fov }),
  setCameraNear: (near) => set({ cameraNear: near }),
  setCameraFar: (far) => set({ cameraFar: far }),

  // 相机目标点控制方法实现
  setCameraTarget: (x, y, z) => set({
    cameraTargetX: x,
    cameraTargetY: y,
    cameraTargetZ: z
  }),
  setCameraTargetX: (x) => set({ cameraTargetX: x }),
  setCameraTargetY: (y) => set({ cameraTargetY: y }),
  setCameraTargetZ: (z) => set({ cameraTargetZ: z }),

  // 相机预设方法实现
  applyCameraPreset: (preset: string) => {
    const presets = {
      'default': {
        position: [0, 45, 65],
        rotation: [0, 0, 0],
        target: [0, 0, 0],
        fov: 75
      },
      'top-view': {
        position: [0, 70, 0],
        rotation: [-Math.PI/2, 0, 0],
        target: [0, 0, 0],
        fov: 60
      },
      'side-view': {
        position: [100, 0, 0],
        rotation: [0, Math.PI/2, 0],
        target: [0, 0, 0],
        fov: 75
      },
      'close-up': {
        position: [0, 20, 30],
        rotation: [0, 0, 0],
        target: [0, 0, 0],
        fov: 90
      },
      'wide-angle': {
        position: [0, 80, 120],
        rotation: [0, 0, 0],
        target: [0, 0, 0],
        fov: 45
      }
    }

    const config = presets[preset as keyof typeof presets]
    if (config) {
      set({
        cameraPositionX: config.position[0],
        cameraPositionY: config.position[1],
        cameraPositionZ: config.position[2],
        cameraRotationX: config.rotation[0],
        cameraRotationY: config.rotation[1],
        cameraRotationZ: config.rotation[2],
        cameraTargetX: config.target[0],
        cameraTargetY: config.target[1],
        cameraTargetZ: config.target[2],
        cameraFov: config.fov
      })
    }
  },

  saveCameraPreset: (name: string) => {
    // 这里可以实现保存到localStorage的逻辑
    const state = useGalaxyStore.getState()
    const preset = {
      position: [state.cameraPositionX, state.cameraPositionY, state.cameraPositionZ],
      rotation: [state.cameraRotationX, state.cameraRotationY, state.cameraRotationZ],
      target: [state.cameraTargetX, state.cameraTargetY, state.cameraTargetZ],
      fov: state.cameraFov
    }
    localStorage.setItem(`camera-preset-${name}`, JSON.stringify(preset))
    console.log(`📷 相机预设 "${name}" 已保存`)
  },

  resetCameraToDefault: () => set({
    cameraPositionX: 0,
    cameraPositionY: 45,
    cameraPositionZ: 65,
    cameraRotationX: 0,
    cameraRotationY: 0,
    cameraRotationZ: 0,
    cameraTargetX: 0,
    cameraTargetY: 0,
    cameraTargetZ: 0,
    cameraFov: 75,
    cameraNear: 0.1,
    cameraFar: 1000
  }),
  setStarFieldVisible: (visible) => set({ starFieldVisible: visible }),
  setStarFieldOpacity: (opacity) => set({ starFieldOpacity: opacity }),
  setStarFieldSize: (size) => set({ starFieldSize: size }),
  triggerRegeneration: () => set((state) => ({ needsRegeneration: !state.needsRegeneration })),
  setPerformanceLevel: (level) => set({ performanceLevel: level }),
  setAutoPerformance: (auto) => set({ autoPerformance: auto }),
  setMaxFPS: (fps) => set({ maxFPS: fps }),

  // 视图状态管理方法实现
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedCharacter: (character) => set({ selectedCharacter: character }),
  setDetailViewCameraPosition: (position) => set({ detailViewCameraPosition: position }),

  enterDetailView: (character) => set({
    viewMode: 'detail',
    selectedCharacter: character
  }),

  exitDetailView: () => set({
    viewMode: 'galaxy',
    selectedCharacter: null
  }),
}))
