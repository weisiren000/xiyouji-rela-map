/**
 * BVH性能测试脚本
 * 用于测试和对比BVH优化前后的性能差异
 */

import * as THREE from 'three'
import { MeshBVH, acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'

// 扩展Three.js原型
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

/**
 * 创建测试场景
 */
function createTestScene() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer()
  
  camera.position.z = 5
  
  return { scene, camera, renderer }
}

/**
 * 创建复杂几何体用于测试
 */
function createComplexGeometry(complexity = 1000) {
  const geometry = new THREE.SphereGeometry(1, complexity / 10, complexity / 10)
  return geometry
}

/**
 * 创建InstancedMesh用于测试
 */
function createInstancedMesh(count = 500) {
  const geometry = new THREE.SphereGeometry(0.1, 16, 16)
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
  
  // 随机分布实例
  const tempObject = new THREE.Object3D()
  for (let i = 0; i < count; i++) {
    tempObject.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    )
    tempObject.updateMatrix()
    instancedMesh.setMatrixAt(i, tempObject.matrix)
  }
  instancedMesh.instanceMatrix.needsUpdate = true
  
  return instancedMesh
}

/**
 * 生成随机射线
 */
function generateRandomRays(count = 1000) {
  const rays = []
  
  for (let i = 0; i < count; i++) {
    const origin = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    )
    
    const direction = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize()
    
    rays.push(new THREE.Ray(origin, direction))
  }
  
  return rays
}

/**
 * 测试射线投射性能
 */
function testRaycastPerformance(mesh, rays, testName = 'Test') {
  const raycaster = new THREE.Raycaster()
  const results = {
    testName,
    rayCount: rays.length,
    totalTime: 0,
    averageTime: 0,
    hitCount: 0,
    hitRate: 0
  }
  
  const startTime = performance.now()
  
  rays.forEach(ray => {
    raycaster.ray = ray
    const intersects = raycaster.intersectObject(mesh)
    if (intersects.length > 0) {
      results.hitCount++
    }
  })
  
  const endTime = performance.now()
  results.totalTime = endTime - startTime
  results.averageTime = results.totalTime / rays.length
  results.hitRate = (results.hitCount / rays.length) * 100
  
  return results
}

/**
 * 运行完整的性能测试套件
 */
async function runPerformanceTests() {
  console.log('🚀 开始BVH性能测试...')
  
  const testResults = []
  
  // 测试1: 简单几何体
  console.log('\n📊 测试1: 简单几何体 (球体 32x32)')
  const simpleGeometry = new THREE.SphereGeometry(1, 32, 32)
  const simpleMaterial = new THREE.MeshBasicMaterial()
  const simpleMesh = new THREE.Mesh(simpleGeometry, simpleMaterial)
  const simpleRays = generateRandomRays(500)
  
  // 无BVH测试
  const simpleNoBVH = testRaycastPerformance(simpleMesh, simpleRays, '简单几何体 - 无BVH')
  testResults.push(simpleNoBVH)
  
  // 有BVH测试
  simpleMesh.geometry.computeBoundsTree()
  const simpleWithBVH = testRaycastPerformance(simpleMesh, simpleRays, '简单几何体 - 有BVH')
  testResults.push(simpleWithBVH)
  
  // 测试2: 复杂几何体
  console.log('\n📊 测试2: 复杂几何体 (球体 100x100)')
  const complexGeometry = createComplexGeometry(10000)
  const complexMesh = new THREE.Mesh(complexGeometry, simpleMaterial)
  const complexRays = generateRandomRays(1000)
  
  // 无BVH测试
  const complexNoBVH = testRaycastPerformance(complexMesh, complexRays, '复杂几何体 - 无BVH')
  testResults.push(complexNoBVH)
  
  // 有BVH测试
  complexMesh.geometry.computeBoundsTree()
  const complexWithBVH = testRaycastPerformance(complexMesh, complexRays, '复杂几何体 - 有BVH')
  testResults.push(complexWithBVH)
  
  // 测试3: InstancedMesh
  console.log('\n📊 测试3: InstancedMesh (500个实例)')
  const instancedMesh = createInstancedMesh(500)
  const instancedRays = generateRandomRays(1000)
  
  // 无BVH测试
  const instancedNoBVH = testRaycastPerformance(instancedMesh, instancedRays, 'InstancedMesh - 无BVH')
  testResults.push(instancedNoBVH)
  
  // 有BVH测试
  instancedMesh.geometry.computeBoundsTree()
  const instancedWithBVH = testRaycastPerformance(instancedMesh, instancedRays, 'InstancedMesh - 有BVH')
  testResults.push(instancedWithBVH)
  
  // 输出结果
  console.log('\n📈 性能测试结果汇总:')
  console.log('=' .repeat(80))
  
  testResults.forEach(result => {
    console.log(`\n🎯 ${result.testName}:`)
    console.log(`   射线数量: ${result.rayCount}`)
    console.log(`   总时间: ${result.totalTime.toFixed(2)}ms`)
    console.log(`   平均时间: ${result.averageTime.toFixed(4)}ms/ray`)
    console.log(`   命中数量: ${result.hitCount}`)
    console.log(`   命中率: ${result.hitRate.toFixed(1)}%`)
  })
  
  // 计算性能提升
  console.log('\n🚀 性能提升分析:')
  console.log('=' .repeat(80))
  
  for (let i = 0; i < testResults.length; i += 2) {
    const noBVH = testResults[i]
    const withBVH = testResults[i + 1]
    
    if (withBVH) {
      const speedup = noBVH.totalTime / withBVH.totalTime
      const improvement = ((noBVH.totalTime - withBVH.totalTime) / noBVH.totalTime * 100)
      
      console.log(`\n📊 ${noBVH.testName.replace(' - 无BVH', '')}:`)
      console.log(`   性能提升: ${speedup.toFixed(2)}x`)
      console.log(`   时间减少: ${improvement.toFixed(1)}%`)
      console.log(`   无BVH: ${noBVH.totalTime.toFixed(2)}ms`)
      console.log(`   有BVH: ${withBVH.totalTime.toFixed(2)}ms`)
    }
  }
  
  // 生成JSON报告
  const report = {
    timestamp: new Date().toISOString(),
    testResults,
    summary: {
      totalTests: testResults.length,
      averageSpeedup: 0,
      bestSpeedup: 0,
      worstSpeedup: 0
    }
  }
  
  // 计算平均性能提升
  const speedups = []
  for (let i = 0; i < testResults.length; i += 2) {
    const noBVH = testResults[i]
    const withBVH = testResults[i + 1]
    if (withBVH) {
      speedups.push(noBVH.totalTime / withBVH.totalTime)
    }
  }
  
  if (speedups.length > 0) {
    report.summary.averageSpeedup = speedups.reduce((a, b) => a + b, 0) / speedups.length
    report.summary.bestSpeedup = Math.max(...speedups)
    report.summary.worstSpeedup = Math.min(...speedups)
  }
  
  console.log('\n📋 测试总结:')
  console.log(`   平均性能提升: ${report.summary.averageSpeedup.toFixed(2)}x`)
  console.log(`   最佳性能提升: ${report.summary.bestSpeedup.toFixed(2)}x`)
  console.log(`   最差性能提升: ${report.summary.worstSpeedup.toFixed(2)}x`)
  
  return report
}

/**
 * 主函数
 */
async function main() {
  try {
    const report = await runPerformanceTests()
    
    // 保存报告到文件
    const fs = await import('fs')
    const path = await import('path')
    
    const reportPath = path.join(process.cwd(), '_experiments', 'bvh-performance-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`\n💾 性能报告已保存到: ${reportPath}`)
    console.log('\n✅ BVH性能测试完成!')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { runPerformanceTests, testRaycastPerformance, createTestScene }
