import * as THREE from 'three'

/**
 * 星空背景系统组合式函数
 */
export function useStarfield() {
  
  /**
   * 创建星空背景
   */
  function createStarfield(): THREE.Points {
    const count = 5000
    const positions: number[] = []
    
    // 生成随机分布的星星位置
    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloat(40, 120)
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2))
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2)
      
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
    }
    
    // 创建几何体
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    
    // 创建材质
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      sizeAttenuation: true,
      depthWrite: false,
      opacity: 0.8,
      transparent: true
    })
    
    // 创建星空点云
    const starField = new THREE.Points(geometry, material)
    
    return starField
  }
  
  return {
    createStarfield
  }
}
