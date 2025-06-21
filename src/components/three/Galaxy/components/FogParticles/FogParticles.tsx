import React, { useMemo } from 'react'
import { Color, CanvasTexture } from 'three'
import { PlanetData } from '@/types/galaxy'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { PERFORMANCE_CONFIGS } from '@/hooks/usePerformanceMonitor'

interface FogParticlesProps {
  planets: PlanetData[]
}

/**
 * 优化的雾气粒子组件
 */
export const FogParticles: React.FC<FogParticlesProps> = ({ planets }) => {
  const { fogConfig, performanceLevel } = useGalaxyStore()
  const config = PERFORMANCE_CONFIGS[performanceLevel]

  // 生成雾气粒子位置和颜色
  const { positions, colors } = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const fogColor = new Color(fogConfig.color)

    planets.forEach(planet => {
      // 在每个星球周围生成雾气粒子
      const x = planet.position.x + (Math.random() - 0.5) * 3
      const y = planet.position.y + (Math.random() - 0.5) * 3
      const z = planet.position.z + (Math.random() - 0.5) * 3

      positions.push(x, y, z)
      colors.push(fogColor.r, fogColor.g, fogColor.b)
    })

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    }
  }, [planets, fogConfig.color])

  // 生成雾气纹理
  const fogTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')!

    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)

    return new CanvasTexture(canvas)
  }, [])

  // 根据性能等级决定是否显示雾气
  if (positions.length === 0 || !config.fogEnabled) return null

  return (
    <points frustumCulled={true}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={fogConfig.size}
        map={fogTexture}
        blending={2} // AdditiveBlending
        depthWrite={false}
        transparent
        vertexColors
        opacity={fogConfig.opacity}
      />
    </points>
  )
}
