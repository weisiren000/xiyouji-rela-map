import { create } from 'zustand'
import { GalaxyConfig, FogConfig, BloomConfig, PlanetData } from '../types/galaxy'

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

  // 控制状态
  isAnimating: boolean
  rotationSpeed: number
  sunRotationSpeed: number

  // 相机控制
  cameraAutoRotate: boolean
  cameraRotateSpeed: number

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
    threshold: 0.0,  // bloomThreshold: 0.0
    strength: 0.4,   // bloomStrength: 0.4
    radius: 0.2,     // bloomRadius: 0.2
  },
  
  // 初始数据
  planets: [],
  isAnimating: true,
  rotationSpeed: 1.0,
  sunRotationSpeed: 1.0,

  // 相机控制
  cameraAutoRotate: false,
  cameraRotateSpeed: 0.5,

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
  setStarFieldVisible: (visible) => set({ starFieldVisible: visible }),
  setStarFieldOpacity: (opacity) => set({ starFieldOpacity: opacity }),
  setStarFieldSize: (size) => set({ starFieldSize: size }),
  triggerRegeneration: () => set((state) => ({ needsRegeneration: !state.needsRegeneration })),
  setPerformanceLevel: (level) => set({ performanceLevel: level }),
  setAutoPerformance: (auto) => set({ autoPerformance: auto }),
  setMaxFPS: (fps) => set({ maxFPS: fps }),
}))
