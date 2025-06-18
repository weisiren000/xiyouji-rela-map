import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

interface RenderStats {
  fps: number
  frameTime: number
  isStable: boolean
}

/**
 * 渲染性能监控Hook
 * 监控FPS和帧时间，检测渲染问题
 */
export const useRenderMonitor = (enabled: boolean = true) => {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsHistory = useRef<number[]>([])
  const stats = useRef<RenderStats>({
    fps: 60,
    frameTime: 16.67,
    isStable: true
  })

  useFrame(() => {
    if (!enabled) return

    const now = performance.now()
    const deltaTime = now - lastTime.current
    
    frameCount.current++
    
    // 每秒更新一次统计
    if (deltaTime >= 1000) {
      const fps = (frameCount.current * 1000) / deltaTime
      const frameTime = deltaTime / frameCount.current
      
      // 记录FPS历史
      fpsHistory.current.push(fps)
      if (fpsHistory.current.length > 10) {
        fpsHistory.current.shift()
      }
      
      // 计算稳定性
      const avgFps = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
      const fpsVariance = fpsHistory.current.reduce((acc, val) => acc + Math.pow(val - avgFps, 2), 0) / fpsHistory.current.length
      const isStable = fpsVariance < 100 && fps > 30 // 方差小于100且FPS大于30认为稳定
      
      stats.current = {
        fps: Math.round(fps),
        frameTime: Math.round(frameTime * 100) / 100,
        isStable
      }
      
      // 检测性能问题
      if (fps < 20) {
        console.warn(`⚠️ 低FPS检测: ${fps.toFixed(1)} FPS`)
      }
      
      if (frameTime > 50) {
        console.warn(`⚠️ 高帧时间检测: ${frameTime.toFixed(1)}ms`)
      }
      
      if (!isStable) {
        console.warn(`⚠️ 渲染不稳定检测: FPS方差 ${fpsVariance.toFixed(1)}`)
      }
      
      // 重置计数器
      frameCount.current = 0
      lastTime.current = now
    }
  })

  // 获取当前统计信息
  const getStats = (): RenderStats => ({ ...stats.current })
  
  // 检测是否有渲染问题
  const hasRenderIssues = (): boolean => {
    return stats.current.fps < 30 || stats.current.frameTime > 33.33 || !stats.current.isStable
  }

  return {
    getStats,
    hasRenderIssues,
    currentFps: stats.current.fps,
    isStable: stats.current.isStable
  }
}

/**
 * 渲染错误检测Hook
 * 检测可能导致黑屏的渲染错误
 */
export const useRenderErrorDetection = () => {
  const errorCount = useRef(0)
  const lastErrorTime = useRef(0)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const now = Date.now()
      
      // 检测是否是渲染相关错误
      if (
        event.error?.message?.includes('WebGL') ||
        event.error?.message?.includes('Three') ||
        event.error?.message?.includes('shader') ||
        event.error?.message?.includes('texture') ||
        event.error?.message?.includes('material')
      ) {
        errorCount.current++
        lastErrorTime.current = now
        
        console.error('🔴 渲染错误检测:', {
          message: event.error?.message,
          stack: event.error?.stack,
          errorCount: errorCount.current,
          timestamp: new Date(now).toISOString()
        })
        
        // 如果短时间内多次错误，可能需要重置渲染器
        if (errorCount.current >= 3 && (now - lastErrorTime.current) < 5000) {
          console.error('🚨 检测到频繁渲染错误，建议刷新页面')
        }
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('WebGL') ||
        event.reason?.message?.includes('Three')
      ) {
        console.error('🔴 渲染Promise错误:', event.reason)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return {
    errorCount: errorCount.current,
    hasFrequentErrors: errorCount.current >= 3
  }
}
