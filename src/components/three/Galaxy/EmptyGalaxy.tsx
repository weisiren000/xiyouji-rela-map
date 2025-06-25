import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { generateGalaxyPlanets } from '@utils/three/galaxyGenerator'
import { generateJourneyPoints } from '@utils/three/journeyGenerator'
import { PlanetCluster } from './components/PlanetCluster'
import { FogParticles } from './components/FogParticles'
import { JourneyPoints } from './components/JourneyPoints'

/**
 * 空银河系组件
 * 与原始Galaxy组件相同，但不包含角色数据点
 * 只显示星球集群和雾气效果
 */
export const EmptyGalaxy: React.FC = () => {
  const groupRef = useRef<Group>(null)
  
  const {
    galaxyConfig,
    journeyConfig,
    planets,
    setPlanets,
    isAnimating,
    rotationSpeed,
    needsRegeneration,
  } = useGalaxyStore()

  // 只有影响星球结构的参数才触发重新生成
  const structuralConfig = useMemo(() => ({
    planetCount: galaxyConfig.planetCount,
    galaxyRadius: galaxyConfig.galaxyRadius,
    numArms: galaxyConfig.numArms,
    armTightness: galaxyConfig.armTightness,
    armWidth: galaxyConfig.armWidth,
    waveAmplitude: galaxyConfig.waveAmplitude,
    waveFrequency: galaxyConfig.waveFrequency,
    // 注意：maxEmissiveIntensity 不在这里，因为它只影响视觉效果
  }), [
    galaxyConfig.planetCount,
    galaxyConfig.galaxyRadius,
    galaxyConfig.numArms,
    galaxyConfig.armTightness,
    galaxyConfig.armWidth,
    galaxyConfig.waveAmplitude,
    galaxyConfig.waveFrequency,
  ])

  // 生成星球数据 - 只有结构参数改变时才重新生成
  const initialPlanets = useMemo(() => {
    return generateGalaxyPlanets(galaxyConfig)
  }, [structuralConfig, galaxyConfig])

  // 生成西游记取经路径点 - 九九八十一难
  const journeyPoints = useMemo(() => {
    return generateJourneyPoints(journeyConfig)
  }, [journeyConfig])

  // 初始化星球数据
  useEffect(() => {
    setPlanets(initialPlanets)
  }, [initialPlanets, setPlanets])

  // 处理手动重新生成
  useEffect(() => {
    const newPlanets = generateGalaxyPlanets(galaxyConfig)
    setPlanets(newPlanets)
  }, [needsRegeneration])

  // 动画循环 - 适配InstancedMesh的轨道动画
  useFrame(() => {
    if (!groupRef.current || !isAnimating) return

    // 银河系整体旋转 (与原始HTML完全一致)
    groupRef.current.rotation.y -= 0.0005 * rotationSpeed
  })

  return (
    <group ref={groupRef}>
      {/* 星球集群 */}
      <PlanetCluster planets={planets} />

      {/* 雾气粒子 */}
      <FogParticles planets={planets} />

      {/* 西游记取经路径点 - 九九八十一难 */}
      <JourneyPoints
        points={journeyPoints}
        globalSize={journeyConfig.globalSize}
        opacity={journeyConfig.opacity}
        emissiveIntensity={journeyConfig.emissiveIntensity}
        metalness={journeyConfig.metalness}
        roughness={journeyConfig.roughness}
        animationSpeed={journeyConfig.animationSpeed}
        visible={true}
      />

      {/* 注意：这里不包含 CharacterSpheres 组件 */}
      {/* 现在包含了西游记取经路径的81个点，使用单螺旋线从外到内分布 */}
    </group>
  )
}
