import { ref } from 'vue'
import * as THREE from 'three'
import type { PulseUniforms, INodeSystem } from '@/types'
import { 
  xiyoujiCharacters, 
  relationships, 
  celestialBodies, 
  xiyoujiPalettes 
} from '@/utils/data'
import { nodeShaderConfig } from '@/utils/shaders'
import { useAppStore } from '@/stores/app'

/**
 * 节点系统管理组合式函数
 */
export function useNodeSystem() {
  const appStore = useAppStore()
  
  // 节点系统状态
  const nodeSystem = ref<NodeSystemImpl>()
  const scene = ref<THREE.Scene>()
  
  /**
   * 节点系统实现类
   */
  class NodeSystemImpl implements INodeSystem {
    nodeCount: number
    positions: Float32Array
    colors: Float32Array
    sizes: Float32Array
    types: Float32Array
    connectionIndices: Float32Array
    distancesFromRoot: Float32Array
    geometry: THREE.BufferGeometry
    material: THREE.ShaderMaterial
    points: THREE.Points
    
    constructor(pulseUniforms: PulseUniforms) {
      this.nodeCount = Math.floor(xiyoujiCharacters.length * appStore.config.densityFactor)
      this.positions = new Float32Array(this.nodeCount * 3)
      this.colors = new Float32Array(this.nodeCount * 3)
      this.sizes = new Float32Array(this.nodeCount)
      this.types = new Float32Array(this.nodeCount)
      this.connectionIndices = new Float32Array(this.nodeCount * 3)
      this.distancesFromRoot = new Float32Array(this.nodeCount)
      this.geometry = new THREE.BufferGeometry()
      
      this.init(pulseUniforms)
    }
    
    init(pulseUniforms: PulseUniforms) {
      this.generateNodes()
      this.createGeometry()
      this.createMaterial(pulseUniforms)
      this.createPoints()
    }
    
    generateNodes() {
      for (let i = 0; i < this.nodeCount; i++) {
        const charIndex = i % xiyoujiCharacters.length
        const character = xiyoujiCharacters[charIndex]
        
        // 位置 - 银河系螺旋布局
        const celestialBody = celestialBodies[character.celestial]
        const baseRadius = celestialBody.radius
        const arms = 4
        const armIndex = i % arms
        const spiralAngle = (armIndex * Math.PI * 0.5) + (i / this.nodeCount) * Math.PI * 6
        const radiusOffset = (1 - character.importance) * 3
        const finalRadius = baseRadius + radiusOffset
        
        this.positions[i * 3] = Math.cos(spiralAngle) * finalRadius
        this.positions[i * 3 + 1] = Math.sin(i * 0.1) * 2
        this.positions[i * 3 + 2] = Math.sin(spiralAngle) * finalRadius
        
        // 颜色
        const palette = xiyoujiPalettes[appStore.config.activePaletteIndex]
        const color = palette[character.type % palette.length]
        this.colors[i * 3] = color.r
        this.colors[i * 3 + 1] = color.g
        this.colors[i * 3 + 2] = color.b
        
        // 大小
        this.sizes[i] = 0.8 + character.importance * 1.2
        
        // 类型
        this.types[i] = character.type
        
        // 连接索引
        const connections = relationships.filter(rel => rel.from === charIndex || rel.to === charIndex)
        for (let j = 0; j < 3; j++) {
          this.connectionIndices[i * 3 + j] = connections[j] ? 
            (connections[j].from === charIndex ? connections[j].to : connections[j].from) : -1
        }
        
        // 距离根节点
        this.distancesFromRoot[i] = i * 0.1
      }
    }

    createGeometry() {
      this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
      this.geometry.setAttribute('nodeColor', new THREE.BufferAttribute(this.colors, 3))
      this.geometry.setAttribute('nodeSize', new THREE.BufferAttribute(this.sizes, 1))
      this.geometry.setAttribute('nodeType', new THREE.BufferAttribute(this.types, 1))
      this.geometry.setAttribute('connectionIndices', new THREE.BufferAttribute(this.connectionIndices, 3))
      this.geometry.setAttribute('distanceFromRoot', new THREE.BufferAttribute(this.distancesFromRoot, 1))
    }

    createMaterial(pulseUniforms: PulseUniforms) {
      this.material = new THREE.ShaderMaterial({
        uniforms: {
          ...pulseUniforms,
          uActivePalette: { value: appStore.config.activePaletteIndex }
        },
        vertexShader: nodeShaderConfig.vertexShader,
        fragmentShader: nodeShaderConfig.fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    }

    createPoints() {
      this.points = new THREE.Points(this.geometry, this.material)
      if (scene.value) {
        scene.value.add(this.points)
      }
    }

    updatePalette(paletteIndex: number) {
      const palette = xiyoujiPalettes[paletteIndex]
      for (let i = 0; i < this.nodeCount; i++) {
        const charIndex = i % xiyoujiCharacters.length
        const character = xiyoujiCharacters[charIndex]
        const color = palette[character.type % palette.length]
        this.colors[i * 3] = color.r
        this.colors[i * 3 + 1] = color.g
        this.colors[i * 3 + 2] = color.b
      }
      this.geometry.attributes.nodeColor.needsUpdate = true
      this.material.uniforms.uActivePalette.value = paletteIndex
    }

    updateDensity(densityFactor: number) {
      const newNodeCount = Math.floor(xiyoujiCharacters.length * densityFactor)
      if (newNodeCount !== this.nodeCount) {
        if (scene.value) {
          scene.value.remove(this.points)
        }
        this.nodeCount = newNodeCount
        this.positions = new Float32Array(this.nodeCount * 3)
        this.colors = new Float32Array(this.nodeCount * 3)
        this.sizes = new Float32Array(this.nodeCount)
        this.types = new Float32Array(this.nodeCount)
        this.connectionIndices = new Float32Array(this.nodeCount * 3)
        this.distancesFromRoot = new Float32Array(this.nodeCount)
        this.generateNodes()
        this.createGeometry()
        this.createPoints()
      }
    }

    applyFormation(formationIndex: number) {
      switch(formationIndex) {
        case 0: // 银河系螺旋
          this.applyGalaxyFormation()
          break
        case 1: // 九重天分层
          this.applyNineHeavensFormation()
          break
        case 2: // 取经路线
          this.applyJourneyFormation()
          break
        case 3: // 势力阵营
          this.applyFactionsFormation()
          break
      }
      this.geometry.attributes.position.needsUpdate = true
    }

    applyGalaxyFormation() {
      for (let i = 0; i < this.nodeCount; i++) {
        const charIndex = i % xiyoujiCharacters.length
        const character = xiyoujiCharacters[charIndex]
        const celestialBody = celestialBodies[character.celestial]
        const baseRadius = celestialBody.radius
        const arms = 4
        const armIndex = i % arms
        const spiralAngle = (armIndex * Math.PI * 0.5) + (i / this.nodeCount) * Math.PI * 6
        const radiusOffset = (1 - character.importance) * 3
        const finalRadius = baseRadius + radiusOffset

        this.positions[i * 3] = Math.cos(spiralAngle) * finalRadius
        this.positions[i * 3 + 1] = Math.sin(i * 0.1) * 2
        this.positions[i * 3 + 2] = Math.sin(spiralAngle) * finalRadius
      }
    }

    applyNineHeavensFormation() {
      const layers = 9
      const layerHeight = 8

      for (let i = 0; i < this.nodeCount; i++) {
        const charIndex = i % xiyoujiCharacters.length
        const character = xiyoujiCharacters[charIndex]
        const layer = Math.floor((1 - character.importance) * layers)
        const positionInLayer = i % Math.ceil(this.nodeCount / layers)
        const nodesInLayer = Math.ceil(this.nodeCount / layers)

        const angle = (positionInLayer / nodesInLayer) * Math.PI * 2
        const radius = 5 + layer * 3
        const height = (layers - layer - 1) * layerHeight - (layers * layerHeight / 2)

        this.positions[i * 3] = Math.cos(angle) * radius
        this.positions[i * 3 + 1] = height
        this.positions[i * 3 + 2] = Math.sin(angle) * radius
      }
    }

    applyJourneyFormation() {
      const pathLength = 60
      const spiralRadius = 15

      for (let i = 0; i < this.nodeCount; i++) {
        const t = i / (this.nodeCount - 1)
        const angle = t * Math.PI * 4
        const z = (t - 0.5) * pathLength

        this.positions[i * 3] = Math.cos(angle) * spiralRadius * (1 - t * 0.3)
        this.positions[i * 3 + 1] = Math.sin(angle) * spiralRadius * (1 - t * 0.3)
        this.positions[i * 3 + 2] = z
      }
    }

    applyFactionsFormation() {
      const factionCenters = [
        new THREE.Vector3(0, 0, 0),    // 主角
        new THREE.Vector3(20, 10, 0),  // 神仙
        new THREE.Vector3(0, -10, 0),  // 妖魔
        new THREE.Vector3(0, 10, 20)   // 其他
      ]

      for (let i = 0; i < this.nodeCount; i++) {
        const charIndex = i % xiyoujiCharacters.length
        const character = xiyoujiCharacters[charIndex]
        const factionIndex = Math.min(character.type, factionCenters.length - 1)
        const center = factionCenters[factionIndex]

        const angle = (i / this.nodeCount) * Math.PI * 2
        const radius = 3 + Math.random() * 5

        this.positions[i * 3] = center.x + Math.cos(angle) * radius
        this.positions[i * 3 + 1] = center.y + (Math.random() - 0.5) * 4
        this.positions[i * 3 + 2] = center.z + Math.sin(angle) * radius
      }
    }
  }

  /**
   * 初始化节点系统
   */
  async function initNodeSystem(sceneRef: THREE.Scene, pulseUniforms: PulseUniforms) {
    scene.value = sceneRef
    nodeSystem.value = new NodeSystemImpl(pulseUniforms)
  }

  /**
   * 更新节点系统主题
   */
  function updateNodeSystemTheme(paletteIndex: number) {
    nodeSystem.value?.updatePalette(paletteIndex)
  }

  /**
   * 更新节点系统密度
   */
  function updateNodeSystemDensity(densityFactor: number) {
    nodeSystem.value?.updateDensity(densityFactor)
  }

  /**
   * 更新节点系统布局
   */
  function updateNodeSystemFormation(formationIndex: number) {
    nodeSystem.value?.applyFormation(formationIndex)
  }

  /**
   * 获取节点系统的Points对象
   */
  function getNodeSystemPoints(): THREE.Points | undefined {
    return nodeSystem.value?.points
  }

  /**
   * 清理节点系统
   */
  function cleanupNodeSystem() {
    if (nodeSystem.value && scene.value) {
      scene.value.remove(nodeSystem.value.points)
      nodeSystem.value.geometry.dispose()
      nodeSystem.value.material.dispose()
    }
    nodeSystem.value = undefined
  }

  return {
    initNodeSystem,
    updateNodeSystemTheme,
    updateNodeSystemDensity,
    updateNodeSystemFormation,
    getNodeSystemPoints,
    cleanupNodeSystem
  }
}
