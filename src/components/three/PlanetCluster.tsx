import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color, Vector3 } from 'three'
import { PlanetData } from '@/types/galaxy'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { PERFORMANCE_CONFIGS } from '@/hooks/usePerformanceMonitor'

interface PlanetClusterProps {
  planets: PlanetData[]
}

/**
 * 优化的星球集群组件
 * 使用InstancedMesh提升性能，支持LOD和性能分级
 */
export const PlanetCluster: React.FC<PlanetClusterProps> = ({ planets }) => {
  const meshRef = useRef<InstancedMesh>(null)
  const { performanceLevel, isAnimating, galaxyConfig } = useGalaxyStore()
  const tempObject = useMemo(() => new Object3D(), [])
  const tempColor = useMemo(() => new Color(), [])
  const animatedPlanets = useRef<PlanetData[]>(planets)


  // 根据性能等级获取配置
  const config = PERFORMANCE_CONFIGS[performanceLevel]

  // 更新动画星球数据
  useEffect(() => {
    animatedPlanets.current = planets
  }, [planets])

  // 轨道动画循环
  useFrame(() => {
    if (!isAnimating || animatedPlanets.current.length === 0) return

    // 更新每个星球的轨道位置
    animatedPlanets.current = animatedPlanets.current.map(planet => {
      const radius = planet.distanceFromCenter
      const speed = 0.5 / (radius + 1)
      const newAngle = planet.angle + speed * 0.02

      // 重新计算位置 (与原始HTML公式完全一致)
      const x = radius * Math.cos(newAngle)
      const z = radius * Math.sin(newAngle)
      const y = 1.8 * Math.sin(0.4 * radius + newAngle)

      return {
        ...planet,
        angle: newAngle,
        position: new Vector3(x, y, z),
        userData: {
          ...planet.userData,
          angle: newAngle,
        }
      }
    })

    // 更新InstancedMesh
    updateInstancedMesh()
  })

  // 根据性能等级过滤星球
  const visiblePlanets = useMemo(() => {
    const currentPlanets = animatedPlanets.current.length > 0 ? animatedPlanets.current : planets
    if (currentPlanets.length === 0) return []

    // 根据性能等级限制星球数量
    const maxCount = Math.min(config.planetCount, currentPlanets.length)

    if (config.lodEnabled) {
      // LOD: 优先显示距离中心近的星球
      return currentPlanets
        .sort((a, b) => a.distanceFromCenter - b.distanceFromCenter)
        .slice(0, maxCount)
    }

    return currentPlanets.slice(0, maxCount)
  }, [planets, config.planetCount, config.lodEnabled])

  // 更新InstancedMesh的函数
  const updateInstancedMesh = () => {
    if (!meshRef.current || visiblePlanets.length === 0) return

    visiblePlanets.forEach((planet, i) => {
      // 设置位置和缩放
      tempObject.position.copy(planet.position)
      tempObject.scale.setScalar(planet.radius)
      tempObject.updateMatrix()

      // 应用变换矩阵
      meshRef.current!.setMatrixAt(i, tempObject.matrix)

      // 设置颜色 - 现在发光强度通过材质的emissiveIntensity控制
      tempColor.set(planet.color)
      // 可以根据距离调整基础颜色亮度，但发光效果由材质emissiveIntensity控制
      const distanceFactor = Math.pow(1.0 - (planet.distanceFromCenter / galaxyConfig.galaxyRadius), 2)
      const brightnessBoost = 1 + distanceFactor * 0.5  // 距离中心近的星球稍微亮一些
      tempColor.multiplyScalar(brightnessBoost)
      meshRef.current!.setColorAt(i, tempColor)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }

  // 初始化时更新一次InstancedMesh
  useEffect(() => {
    updateInstancedMesh()
  }, [visiblePlanets])

  // 当发光强度配置变化时，重新更新颜色
  useEffect(() => {
    updateInstancedMesh()
  }, [galaxyConfig.maxEmissiveIntensity])

  if (visiblePlanets.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, visiblePlanets.length]}
      frustumCulled={true}
    >
      <sphereGeometry args={[1, config.geometryDetail, config.geometryDetail]} />
      <meshStandardMaterial
        metalness={0.3}
        roughness={0.5}
        emissive="#ffffff"
        emissiveIntensity={galaxyConfig.maxEmissiveIntensity}
      />
    </instancedMesh>
  )
}
