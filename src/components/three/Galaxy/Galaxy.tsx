import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { useGalaxyStore } from '@stores/useGalaxyStore'
import { generateGalaxyPlanets } from '@utils/galaxyGenerator'
import { PERFORMANCE_CONFIGS } from '@/hooks/usePerformanceMonitor'
import { PlanetCluster } from './components/PlanetCluster'
import { FogParticles } from './components/FogParticles'
import { CharacterSpheresSimple as CharacterSpheres } from './components/CharacterSpheresSimple'

/**
 * 银河系组件
 * 1:1复刻原始HTML文件的银河系效果
 */

interface GalaxyProps {
  characterDataVisible?: boolean
  characterDataOpacity?: number
  characterGlobalSize?: number
  characterEmissiveIntensity?: number
  characterMetalness?: number
  characterRoughness?: number
  characterAnimationSpeed?: number
  characterFloatAmplitude?: number
  showAliases?: boolean
  aliasOpacity?: number
  aliasSize?: number
  characterRadiusMultiplier?: number
  characterHeightMultiplier?: number
  characterRandomSpread?: number
  characterColorIntensity?: number
  characterUseOriginalColors?: boolean
  characterRegeneratePositions?: boolean
}

/**
 * 银河系主组件
 * 包含星球集群、雾气效果、角色数据等
 */
export const Galaxy: React.FC<GalaxyProps> = ({
  characterDataVisible = true,
  characterDataOpacity = 0.8,
  characterGlobalSize = 1.0,
  characterEmissiveIntensity = 0.3,
  characterMetalness = 0.1,
  characterRoughness = 0.3,
  characterAnimationSpeed = 1.0,
  characterFloatAmplitude = 0.1,
  showAliases = true,
  aliasOpacity = 0.7,
  aliasSize = 0.8,
  characterRadiusMultiplier = 1.0,
  characterHeightMultiplier = 1.0,
  characterRandomSpread = 2.0,
  characterColorIntensity = 1.0,
  characterUseOriginalColors = true,
  characterRegeneratePositions = false
}) => {
  const groupRef = useRef<Group>(null)
  
  const {
    galaxyConfig,
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

      {/* 西游记角色数据点 */}
      <CharacterSpheres
        visible={characterDataVisible}
        opacity={characterDataOpacity}
        globalSize={characterGlobalSize}
        emissiveIntensity={characterEmissiveIntensity}
        metalness={characterMetalness}
        roughness={characterRoughness}
        animationSpeed={characterAnimationSpeed}
        floatAmplitude={characterFloatAmplitude}
        showAliases={showAliases}
        aliasOpacity={aliasOpacity}
        aliasSize={aliasSize}
        radiusMultiplier={characterRadiusMultiplier}
        heightMultiplier={characterHeightMultiplier}
        randomSpread={characterRandomSpread}
        colorIntensity={characterColorIntensity}
        useOriginalColors={characterUseOriginalColors}
        regeneratePositions={characterRegeneratePositions}
      />
    </group>
  )
}

/**
 * 优化的背景星空组件
 */
export const StarField: React.FC = () => {
  const { starFieldVisible, starFieldOpacity, starFieldSize, performanceLevel } = useGalaxyStore()

  const starPositions = useMemo(() => {
    const positions: number[] = []
    const config = PERFORMANCE_CONFIGS[performanceLevel]
    const starCount = config.starCount

    for (let i = 0; i < starCount; i++) {
      positions.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      )
    }

    return new Float32Array(positions)
  }, [performanceLevel])

  if (!starFieldVisible) return null

  return (
    <points frustumCulled={true}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={starFieldSize}
        transparent
        opacity={starFieldOpacity}
      />
    </points>
  )
}

/**
 * 中心太阳组件
 */
export const CentralSun: React.FC = () => {
  const sunRef = useRef<Group>(null)
  const { sunRotationSpeed } = useGalaxyStore()

  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.005 * sunRotationSpeed
    }
  })

  return (
    <group ref={sunRef}>
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#ffd580" />
      </mesh>
      
      {/* 点光源 */}
      <pointLight
        color="#ffd580"
        intensity={2}
        distance={250}
        position={[0, 0, 0]}
      />
    </group>
  )
}
