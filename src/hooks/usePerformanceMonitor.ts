import { useRef, useEffect, useState } from 'react'

/**
 * 性能监控Hook (非Three.js版本)
 * 使用requestAnimationFrame监控FPS并自动调整质量等级
 */
export const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60)
  const [performanceLevel, setPerformanceLevel] = useState<'low' | 'medium' | 'high' | 'ultra'>('high')
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsHistory = useRef<number[]>([])
  const animationFrameId = useRef<number>()

  useEffect(() => {
    const updateFPS = () => {
      frameCount.current++
      const currentTime = performance.now()

      // 每秒计算一次FPS
      if (currentTime - lastTime.current >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
        setFps(currentFps)

        // 记录FPS历史
        fpsHistory.current.push(currentFps)
        if (fpsHistory.current.length > 10) {
          fpsHistory.current.shift()
        }

        // 计算平均FPS
        const avgFps = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length

        // 自动调整性能等级
        if (avgFps < 30 && performanceLevel !== 'low') {
          setPerformanceLevel('low')
        } else if (avgFps >= 30 && avgFps < 45 && performanceLevel !== 'medium') {
          setPerformanceLevel('medium')
        } else if (avgFps >= 45 && avgFps < 55 && performanceLevel !== 'high') {
          setPerformanceLevel('high')
        } else if (avgFps >= 55 && performanceLevel !== 'ultra') {
          setPerformanceLevel('ultra')
        }

        frameCount.current = 0
        lastTime.current = currentTime
      }

      animationFrameId.current = requestAnimationFrame(updateFPS)
    }

    animationFrameId.current = requestAnimationFrame(updateFPS)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [performanceLevel])

  return {
    fps,
    performanceLevel,
    setPerformanceLevel,
  }
}

/**
 * 获取设备性能等级
 */
export const getDevicePerformanceLevel = (): 'low' | 'medium' | 'high' | 'ultra' => {
  // 检测设备性能指标
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null

  if (!gl) return 'low'

  // 检测GPU信息
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : ''
  
  // 检测内存
  const memory = (navigator as any).deviceMemory || 4
  
  // 检测CPU核心数
  const cores = navigator.hardwareConcurrency || 4
  
  // 简单的性能评分
  let score = 0
  
  // GPU评分
  if (renderer.toLowerCase().includes('nvidia') || renderer.toLowerCase().includes('amd')) {
    score += 3
  } else if (renderer.toLowerCase().includes('intel')) {
    score += 1
  }
  
  // 内存评分
  if (memory >= 8) score += 3
  else if (memory >= 4) score += 2
  else score += 1
  
  // CPU评分
  if (cores >= 8) score += 3
  else if (cores >= 4) score += 2
  else score += 1
  
  // 根据评分返回性能等级
  if (score >= 8) return 'ultra'
  if (score >= 6) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

/**
 * 性能等级配置
 */
export const PERFORMANCE_CONFIGS = {
  low: {
    planetCount: 2000,
    starCount: 2000,
    fogEnabled: false,
    bloomEnabled: false,
    animationEnabled: true,
    lodEnabled: true,
    maxDistance: 100,
    geometryDetail: 8, // 球体细分数
  },
  medium: {
    planetCount: 4000,
    starCount: 5000,
    fogEnabled: true,
    bloomEnabled: false,
    animationEnabled: true,
    lodEnabled: true,
    maxDistance: 150,
    geometryDetail: 12,
  },
  high: {
    planetCount: 8000,
    starCount: 10000,
    fogEnabled: true,
    bloomEnabled: true,
    animationEnabled: true,
    lodEnabled: false,
    maxDistance: 200,
    geometryDetail: 16,
  },
  ultra: {
    planetCount: 15000,
    starCount: 15000,
    fogEnabled: true,
    bloomEnabled: true,
    animationEnabled: true,
    lodEnabled: false,
    maxDistance: 300,
    geometryDetail: 20,
  },
}
