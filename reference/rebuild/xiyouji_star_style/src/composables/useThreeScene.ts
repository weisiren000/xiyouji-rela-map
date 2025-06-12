import { ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

import { useAppStore } from '@/stores/app'
import { useNodeSystem } from '@/composables/useNodeSystem'
import { usePulseSystem } from '@/composables/usePulseSystem'
import { useStarfield } from '@/composables/useStarfield'

/**
 * Three.js场景管理组合式函数
 */
export function useThreeScene() {
  const appStore = useAppStore()
  
  // Three.js核心对象
  const scene = ref<THREE.Scene>()
  const camera = ref<THREE.PerspectiveCamera>()
  const renderer = ref<THREE.WebGLRenderer>()
  const composer = ref<EffectComposer>()
  const controls = ref<OrbitControls>()
  
  // 子系统
  const { createStarfield } = useStarfield()
  const { 
    initNodeSystem, 
    updateNodeSystemTheme, 
    updateNodeSystemDensity,
    updateNodeSystemFormation,
    getNodeSystemPoints,
    cleanupNodeSystem
  } = useNodeSystem()
  const { 
    initPulseSystem, 
    createPulse, 
    updatePulseTime,
    getPulseUniforms 
  } = usePulseSystem()
  
  // 动画状态
  const animationId = ref<number>()
  
  /**
   * 初始化Three.js场景
   */
  async function initScene(canvas: HTMLCanvasElement) {
    // 创建场景
    scene.value = new THREE.Scene()
    scene.value.fog = new THREE.FogExp2(0x000000, 0.0015)
    
    // 创建相机
    camera.value = new THREE.PerspectiveCamera(
      60, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1200
    )
    camera.value.position.set(0, 5, 22)
    
    // 创建渲染器
    renderer.value = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      powerPreference: "high-performance" 
    })
    renderer.value.setSize(window.innerWidth, window.innerHeight)
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.value.setClearColor(0x000000)
    renderer.value.outputColorSpace = THREE.SRGBColorSpace
    
    // 创建控制器
    controls.value = new OrbitControls(camera.value, renderer.value.domElement)
    controls.value.enableDamping = true
    controls.value.dampingFactor = 0.05
    controls.value.rotateSpeed = 0.5
    controls.value.minDistance = 5
    controls.value.maxDistance = 100
    controls.value.autoRotate = true
    controls.value.autoRotateSpeed = 0.15
    controls.value.enablePan = false
    
    // 创建后处理管线
    composer.value = new EffectComposer(renderer.value)
    composer.value.addPass(new RenderPass(scene.value, camera.value))
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 
      1.5, 
      0.4, 
      0.68
    )
    composer.value.addPass(bloomPass)
    
    const filmPass = new FilmPass(0.35, 0.55, 2048, false)
    composer.value.addPass(filmPass)
    
    composer.value.addPass(new OutputPass())
    
    // 创建星空背景
    const starField = createStarfield()
    scene.value.add(starField)
    
    // 初始化脉冲系统
    initPulseSystem()
    
    // 初始化节点系统
    await initNodeSystem(scene.value, getPulseUniforms())
    
    console.log('Three.js场景初始化完成')
  }
  
  /**
   * 动画循环
   */
  function animate() {
    animationId.value = requestAnimationFrame(animate)
    
    if (!appStore.config.paused && controls.value && composer.value) {
      const time = performance.now() * 0.001
      updatePulseTime(time)
      
      controls.value.update()
      composer.value.render()
    }
  }
  
  /**
   * 处理窗口大小调整
   */
  function handleResize() {
    if (camera.value && renderer.value && composer.value) {
      camera.value.aspect = window.innerWidth / window.innerHeight
      camera.value.updateProjectionMatrix()
      renderer.value.setSize(window.innerWidth, window.innerHeight)
      composer.value.setSize(window.innerWidth, window.innerHeight)
    }
  }
  
  /**
   * 处理画布点击事件
   */
  function handleClick(event: MouseEvent) {
    if (!camera.value) return
    
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera.value)
    raycaster.params.Points.threshold = 2
    
    const points = getNodeSystemPoints()
    if (points) {
      const intersects = raycaster.intersectObject(points)
      if (intersects.length > 0) {
        const clickPosition = intersects[0].point
        createPulse(clickPosition)
        
        // 显示角色信息
        const index = intersects[0].index
        if (index !== undefined) {
          // 这里需要根据索引获取角色信息
          // 暂时先不实现，后续完善
        }
      }
    }
  }
  
  /**
   * 更新主题
   */
  function updateTheme(paletteIndex: number) {
    updateNodeSystemTheme(paletteIndex)
  }
  
  /**
   * 更新密度
   */
  function updateDensity(densityFactor: number) {
    updateNodeSystemDensity(densityFactor)
  }
  
  /**
   * 更新布局
   */
  function updateFormation(formationIndex: number) {
    updateNodeSystemFormation(formationIndex)
  }
  
  /**
   * 重置相机位置
   */
  function resetCamera() {
    if (camera.value && controls.value) {
      camera.value.position.set(0, 5, 22)
      controls.value.target.set(0, 0, 0)
      controls.value.update()
    }
  }
  
  /**
   * 清理资源
   */
  function cleanup() {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
    
    cleanupNodeSystem()
    
    if (renderer.value) {
      renderer.value.dispose()
    }
  }
  
  return {
    initScene,
    animate,
    handleResize,
    handleClick,
    updateTheme,
    updateDensity,
    updateFormation,
    resetCamera,
    cleanup
  }
}
