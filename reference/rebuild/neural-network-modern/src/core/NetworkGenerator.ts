import * as THREE from 'three'
import { NetworkNode } from './NetworkNode'
import { NetworkFormation, NodeType } from '@/types'

/**
 * 网络生成器
 * 生成不同形态的神经网络结构
 */
export class NetworkGenerator {
  /**
   * 生成神经网络
   * @param formation 网络形态
   * @param densityFactor 密度因子
   * @returns 生成的节点数组
   */
  public static generateNetwork(formation: NetworkFormation, densityFactor: number = 1.0): NetworkNode[] {
    switch (formation) {
      case NetworkFormation.QUANTUM_CORTEX:
        return this.generateQuantumCortex(densityFactor)
      case NetworkFormation.HYPERDIMENSIONAL_MESH:
        return this.generateHyperdimensionalMesh(densityFactor)
      case NetworkFormation.NEURAL_VORTEX:
        return this.generateNeuralVortex(densityFactor)
      case NetworkFormation.SYNAPTIC_CLOUD:
        return this.generateSynapticCloud(densityFactor)
      default:
        return this.generateQuantumCortex(densityFactor)
    }
  }

  /**
   * 生成量子皮层网络
   */
  private static generateQuantumCortex(densityFactor: number): NetworkNode[] {
    const nodes: NetworkNode[] = []
    
    // 创建根节点
    const rootNode = new NetworkNode(new THREE.Vector3(0, 0, 0), 0, NodeType.CORE)
    rootNode.size = 1.5
    nodes.push(rootNode)

    // 创建主要轴线
    const primaryAxes = 6
    const nodesPerAxis = 8
    const axisLength = 20
    const axisEndpoints: NetworkNode[] = []

    for (let a = 0; a < primaryAxes; a++) {
      const phi = Math.acos(-1 + (2 * a) / primaryAxes)
      const theta = Math.PI * (1 + Math.sqrt(5)) * a
      const dirVec = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      )

      let prevNode = rootNode
      for (let i = 1; i <= nodesPerAxis; i++) {
        const t = i / nodesPerAxis
        const distance = axisLength * Math.pow(t, 0.8)
        const pos = new THREE.Vector3().copy(dirVec).multiplyScalar(distance)
        const nodeType = (i === nodesPerAxis) ? NodeType.LEAF : NodeType.CORE
        const newNode = new NetworkNode(pos, i, nodeType)
        newNode.distanceFromRoot = distance
        nodes.push(newNode)
        prevNode.addConnection(newNode, 1.0 - (t * 0.3))
        prevNode = newNode
        if (i === nodesPerAxis) axisEndpoints.push(newNode)
      }
    }

    // 创建环形结构
    const ringDistances = [5, 10, 15]
    const ringNodes: NetworkNode[][] = []
    
    for (const ringDist of ringDistances) {
      const nodesInRing = Math.floor(ringDist * 3 * densityFactor)
      const ringLayer: NetworkNode[] = []
      
      for (let i = 0; i < nodesInRing; i++) {
        const t = i / nodesInRing
        const ringPhi = Math.acos(2 * Math.random() - 1)
        const ringTheta = 2 * Math.PI * t
        const pos = new THREE.Vector3(
          ringDist * Math.sin(ringPhi) * Math.cos(ringTheta),
          ringDist * Math.sin(ringPhi) * Math.sin(ringTheta),
          ringDist * Math.cos(ringPhi)
        )
        const level = Math.ceil(ringDist / 5)
        const nodeType = Math.random() < 0.4 ? NodeType.LEAF : NodeType.CORE
        const newNode = new NetworkNode(pos, level, nodeType)
        newNode.distanceFromRoot = ringDist
        nodes.push(newNode)
        ringLayer.push(newNode)
      }
      ringNodes.push(ringLayer)

      // 连接环形节点
      for (let i = 0; i < ringLayer.length; i++) {
        const node = ringLayer[i]
        const nextNode = ringLayer[(i + 1) % ringLayer.length]
        node.addConnection(nextNode, 0.7)
        
        if (i % 4 === 0 && ringLayer.length > 5) {
          const jumpIdx = (i + Math.floor(ringLayer.length / 2)) % ringLayer.length
          node.addConnection(ringLayer[jumpIdx], 0.4)
        }
      }
    }

    // 连接环形节点到轴线节点
    for (const ring of ringNodes) {
      for (const node of ring) {
        let closestAxisNode: NetworkNode | null = null
        let minDist = Infinity
        
        for (const n of nodes) {
          if (n === rootNode || n === node) continue
          if (n.level === 0 || n.type !== NodeType.CORE) continue
          const dist = node.position.distanceTo(n.position)
          if (dist < minDist) {
            minDist = dist
            closestAxisNode = n
          }
        }
        
        if (closestAxisNode && minDist < 8) {
          const strength = 0.5 + (1 - minDist / 8) * 0.5
          node.addConnection(closestAxisNode, strength)
        }
      }
    }

    // 连接不同环层
    for (let r = 0; r < ringNodes.length - 1; r++) {
      const innerRing = ringNodes[r]
      const outerRing = ringNodes[r + 1]
      const connectionsCount = Math.floor(innerRing.length * 0.5)
      
      for (let i = 0; i < connectionsCount; i++) {
        const innerNode = innerRing[Math.floor(Math.random() * innerRing.length)]
        const outerNode = outerRing[Math.floor(Math.random() * outerRing.length)]
        if (!innerNode.isConnectedTo(outerNode)) {
          innerNode.addConnection(outerNode, 0.6)
        }
      }
    }

    return nodes
  }

  /**
   * 生成超维网格网络
   */
  private static generateHyperdimensionalMesh(densityFactor: number): NetworkNode[] {
    const nodes: NetworkNode[] = []
    
    // 创建根节点
    const rootNode = new NetworkNode(new THREE.Vector3(0, 0, 0), 0, NodeType.CORE)
    rootNode.size = 1.5
    nodes.push(rootNode)

    // 创建4个维度的节点
    const dimensions = 4
    const nodesPerDimension = Math.floor(40 * densityFactor)
    const maxRadius = 20

    const dimensionVectors = [
      new THREE.Vector3(1, 1, 1).normalize(),
      new THREE.Vector3(-1, 1, -1).normalize(),
      new THREE.Vector3(1, -1, -1).normalize(),
      new THREE.Vector3(-1, -1, 1).normalize()
    ]

    for (let d = 0; d < dimensions; d++) {
      const dimVec = dimensionVectors[d]
      
      for (let i = 0; i < nodesPerDimension; i++) {
        const distance = maxRadius * Math.pow(Math.random(), 0.7)
        const randomVec = new THREE.Vector3(
          THREE.MathUtils.randFloatSpread(1),
          THREE.MathUtils.randFloatSpread(1),
          THREE.MathUtils.randFloatSpread(1)
        ).normalize()
        
        const biasedVec = new THREE.Vector3().addVectors(
          dimVec.clone().multiplyScalar(0.6 + Math.random() * 0.4),
          randomVec.clone().multiplyScalar(0.3)
        ).normalize()

        const pos = biasedVec.clone().multiplyScalar(distance)
        const isLeaf = Math.random() < 0.4 || distance > maxRadius * 0.8
        const level = Math.floor(distance / (maxRadius / 4)) + 1
        const newNode = new NetworkNode(pos, level, isLeaf ? NodeType.LEAF : NodeType.CORE)
        newNode.distanceFromRoot = distance
        newNode.dimension = d
        nodes.push(newNode)
        
        if (distance < maxRadius * 0.3) {
          rootNode.addConnection(newNode, 0.7)
        }
      }
    }

    // 连接同维度节点
    for (let d = 0; d < dimensions; d++) {
      const dimNodes = nodes.filter(n => n.dimension === d)
      dimNodes.sort((a, b) => a.distanceFromRoot - b.distanceFromRoot)

      for (let i = 0; i < dimNodes.length; i++) {
        const node = dimNodes[i]
        const connectionsCount = 1 + Math.floor(Math.random() * 3)
        const nearbyNodes = dimNodes.filter(n => n !== node)
          .sort((a, b) => node.position.distanceTo(a.position) - node.position.distanceTo(b.position))
        
        for (let j = 0; j < Math.min(connectionsCount, nearbyNodes.length); j++) {
          if (!node.isConnectedTo(nearbyNodes[j])) {
            node.addConnection(nearbyNodes[j], 0.4 + Math.random() * 0.4)
          }
        }
      }
    }

    return nodes
  }

  /**
   * 生成神经漩涡网络
   */
  private static generateNeuralVortex(densityFactor: number): NetworkNode[] {
    const nodes: NetworkNode[] = []
    
    // 创建根节点
    const rootNode = new NetworkNode(new THREE.Vector3(0, 0, 0), 0, NodeType.CORE)
    rootNode.size = 1.8
    nodes.push(rootNode)

    // 创建螺旋结构
    const numSpirals = 6
    const totalHeight = 30
    const maxRadius = 16
    const nodesPerSpiral = Math.floor(30 * densityFactor)

    for (let s = 0; s < numSpirals; s++) {
      const spiralPhase = (s / numSpirals) * Math.PI * 2
      
      for (let i = 0; i < nodesPerSpiral; i++) {
        const t = i / (nodesPerSpiral - 1)
        const height = (t - 0.5) * totalHeight
        const radiusCurve = Math.sin(t * Math.PI)
        const radius = maxRadius * radiusCurve

        const revolutions = 2.5
        const angle = spiralPhase + t * Math.PI * 2 * revolutions

        const pos = new THREE.Vector3(
          radius * Math.cos(angle),
          height,
          radius * Math.sin(angle)
        )
        pos.add(new THREE.Vector3(
          THREE.MathUtils.randFloatSpread(1.5),
          THREE.MathUtils.randFloatSpread(1.5),
          THREE.MathUtils.randFloatSpread(1.5)
        ))

        const level = Math.floor(t * 5) + 1
        const isLeaf = Math.random() < 0.3 || i > nodesPerSpiral - 3
        const newNode = new NetworkNode(pos, level, isLeaf ? NodeType.LEAF : NodeType.CORE)
        newNode.distanceFromRoot = Math.sqrt(radius * radius + height * height)
        newNode.spiralIndex = s
        newNode.spiralPosition = t
        nodes.push(newNode)
      }
    }

    // 连接螺旋节点
    for (let s = 0; s < numSpirals; s++) {
      const spiralNodes = nodes.filter(n => n.spiralIndex === s)
      rootNode.addConnection(spiralNodes[0], 1.0)
      
      for (let i = 0; i < spiralNodes.length - 1; i++) {
        spiralNodes[i].addConnection(spiralNodes[i + 1], 0.9)
      }
    }

    return nodes
  }

  /**
   * 生成突触云网络
   */
  private static generateSynapticCloud(densityFactor: number): NetworkNode[] {
    const nodes: NetworkNode[] = []
    
    // 创建根节点
    const rootNode = new NetworkNode(new THREE.Vector3(0, 0, 0), 0, NodeType.CORE)
    rootNode.size = 1.5
    nodes.push(rootNode)

    // 创建集群
    const numClusters = 6
    const maxDist = 18
    const clusterNodes: NetworkNode[] = []

    for (let c = 0; c < numClusters; c++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      const distance = maxDist * (0.3 + 0.7 * Math.random())
      const pos = new THREE.Vector3(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.sin(phi) * Math.sin(theta),
        distance * Math.cos(phi)
      )
      
      const clusterNode = new NetworkNode(pos, 1, NodeType.CORE)
      clusterNode.size = 1.2
      clusterNode.distanceFromRoot = distance
      nodes.push(clusterNode)
      clusterNodes.push(clusterNode)
      rootNode.addConnection(clusterNode, 0.9)

      // 为每个集群创建子节点
      const clusterSize = Math.floor(20 * densityFactor)
      const cloudRadius = 7 + Math.random() * 3
      
      for (let i = 0; i < clusterSize; i++) {
        const radius = cloudRadius * Math.pow(Math.random(), 0.5)
        const dir = new THREE.Vector3(
          THREE.MathUtils.randFloatSpread(2),
          THREE.MathUtils.randFloatSpread(2),
          THREE.MathUtils.randFloatSpread(2)
        ).normalize()
        
        const childPos = new THREE.Vector3().copy(pos).add(dir.multiplyScalar(radius))
        const level = 2 + Math.floor(radius / 3)
        const isLeaf = Math.random() < 0.5
        const childNode = new NetworkNode(childPos, level, isLeaf ? NodeType.LEAF : NodeType.CORE)
        childNode.distanceFromRoot = rootNode.position.distanceTo(childPos)
        childNode.clusterRef = clusterNode
        nodes.push(childNode)

        const strength = 0.7 * (1 - radius / cloudRadius)
        clusterNode.addConnection(childNode, strength)
      }
    }

    // 连接集群之间
    for (let i = 0; i < clusterNodes.length; i++) {
      for (let j = i + 1; j < clusterNodes.length; j++) {
        const dist = clusterNodes[i].position.distanceTo(clusterNodes[j].position)
        const probability = 1.0 - (dist / (maxDist * 2))
        if (Math.random() < probability) {
          const strength = 0.5 + 0.5 * (1 - dist / (maxDist * 2))
          clusterNodes[i].addConnection(clusterNodes[j], strength)
        }
      }
    }

    return nodes
  }
}
