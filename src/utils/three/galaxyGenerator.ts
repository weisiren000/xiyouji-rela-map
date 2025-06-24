import { Vector3, Color } from 'three'
import { GalaxyConfig, PlanetData } from '../../types/galaxy'

/**
 * 生成银河系星球数据
 * 基于原始HTML文件中的算法
 */
export function generateGalaxyPlanets(config: GalaxyConfig): PlanetData[] {
  const {
    planetCount,
    galaxyRadius,
    numArms,
    armTightness,
    armWidth,
    waveAmplitude,
    waveFrequency,
    maxEmissiveIntensity,
  } = config

  const planets: PlanetData[] = []

  for (let i = 0; i < planetCount; i++) {
    // 使用幂函数分布，让星球更集中在中心
    const r = Math.pow(Math.random(), 2) * galaxyRadius
    
    // 选择旋臂
    const armIndex = Math.floor(Math.random() * numArms)
    
    // 计算角度（对数螺旋）
    let angle = Math.log(r + 1) * armTightness + (armIndex * 2 * Math.PI / numArms)
    
    // 添加随机偏移
    angle += (Math.random() - 0.5) * armWidth / (r * 0.1 + 1)

    // 计算3D位置
    const x = r * Math.cos(angle)
    const z = r * Math.sin(angle)
    const y = waveAmplitude * Math.sin(waveFrequency * r + angle)

    // 计算发光强度（距离中心越近越亮）
    const emissiveIntensity = maxEmissiveIntensity * Math.pow(1.0 - (r / galaxyRadius), 2)
    
    // 生成随机颜色
    const color = new Color(Math.random(), Math.random(), Math.random())
    
    // 生成随机半径
    const radius = Math.random() * 0.12 + 0.05

    const planet: PlanetData = {
      id: `planet_${i}`,
      position: new Vector3(x, y, z),
      radius,
      angle,
      distanceFromCenter: r,
      color: `#${color.getHexString()}`,
      emissiveIntensity,
      userData: {
        originalAngle: angle,
        armIndex,
      },
    }

    planets.push(planet)
  }

  return planets
}

/**
 * 生成背景星空数据
 */
export function generateStarField(count: number = 10000, range: number = 2000): Vector3[] {
  const stars: Vector3[] = []
  
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * range
    const y = (Math.random() - 0.5) * range
    const z = (Math.random() - 0.5) * range
    
    stars.push(new Vector3(x, y, z))
  }
  
  return stars
}

/**
 * 生成雾气粒子数据
 */
export function generateFogParticles(planets: PlanetData[]): Vector3[] {
  const fogParticles: Vector3[] = []
  
  planets.forEach(planet => {
    // 在每个星球周围生成雾气粒子
    const x = planet.position.x + (Math.random() - 0.5) * 3
    const y = planet.position.y + (Math.random() - 0.5) * 3
    const z = planet.position.z + (Math.random() - 0.5) * 3
    
    fogParticles.push(new Vector3(x, y, z))
  })
  
  return fogParticles
}

/**
 * 更新星球轨道位置
 */
export function updatePlanetOrbits(planets: PlanetData[], deltaTime: number): PlanetData[] {
  return planets.map(planet => {
    const { distanceFromCenter, userData } = planet
    const speed = 0.5 / (distanceFromCenter + 1)
    
    // 更新角度
    const newAngle = userData.originalAngle + speed * deltaTime * 0.02
    
    // 重新计算位置
    const x = distanceFromCenter * Math.cos(newAngle)
    const z = distanceFromCenter * Math.sin(newAngle)
    const y = 1.8 * Math.sin(0.4 * distanceFromCenter + newAngle) // waveAmplitude * sin(waveFrequency * r + angle)
    
    return {
      ...planet,
      position: new Vector3(x, y, z),
      angle: newAngle,
      userData: {
        ...userData,
        originalAngle: newAngle,
      },
    }
  })
}
