import * as THREE from 'three'
import { NetworkNode as INetworkNode, NodeConnection, NodeType } from '@/types'

/**
 * 神经网络节点类
 * 表示网络中的单个节点，包含位置、连接和属性信息
 */
export class NetworkNode implements INetworkNode {
  public position: THREE.Vector3
  public connections: NodeConnection[] = []
  public level: number
  public type: NodeType
  public size: number
  public distanceFromRoot: number
  
  // 可选属性，用于特定网络形态
  public dimension?: number
  public spiralIndex?: number
  public spiralPosition?: number
  public clusterRef?: NetworkNode

  /**
   * 创建网络节点
   * @param position 节点位置
   * @param level 节点层级
   * @param type 节点类型
   */
  constructor(position: THREE.Vector3, level: number = 0, type: NodeType = NodeType.CORE) {
    this.position = position.clone()
    this.level = level
    this.type = type
    this.size = type === NodeType.CORE 
      ? THREE.MathUtils.randFloat(0.7, 1.2) 
      : THREE.MathUtils.randFloat(0.4, 0.9)
    this.distanceFromRoot = 0
  }

  /**
   * 添加连接到另一个节点
   * @param node 目标节点
   * @param strength 连接强度 (0.0 - 1.0)
   */
  public addConnection(node: NetworkNode, strength: number = 1.0): void {
    if (!this.isConnectedTo(node)) {
      this.connections.push({ node, strength })
      node.connections.push({ node: this, strength })
    }
  }

  /**
   * 检查是否已连接到指定节点
   * @param node 要检查的节点
   * @returns 是否已连接
   */
  public isConnectedTo(node: NetworkNode): boolean {
    return this.connections.some(conn => conn.node === node)
  }

  /**
   * 移除与指定节点的连接
   * @param node 要断开连接的节点
   */
  public removeConnection(node: NetworkNode): void {
    this.connections = this.connections.filter(conn => conn.node !== node)
    node.connections = node.connections.filter(conn => conn.node !== this)
  }

  /**
   * 获取所有连接的节点
   * @returns 连接的节点数组
   */
  public getConnectedNodes(): NetworkNode[] {
    return this.connections.map(conn => conn.node as NetworkNode)
  }

  /**
   * 获取到指定节点的连接强度
   * @param node 目标节点
   * @returns 连接强度，如果未连接则返回0
   */
  public getConnectionStrength(node: NetworkNode): number {
    const connection = this.connections.find(conn => conn.node === node)
    return connection ? connection.strength : 0
  }

  /**
   * 更新连接强度
   * @param node 目标节点
   * @param strength 新的连接强度
   */
  public updateConnectionStrength(node: NetworkNode, strength: number): void {
    const connection = this.connections.find(conn => conn.node === node)
    if (connection) {
      connection.strength = Math.max(0, Math.min(1, strength))
      
      // 同时更新对方节点的连接强度
      const reverseConnection = node.connections.find(conn => conn.node === this)
      if (reverseConnection) {
        reverseConnection.strength = connection.strength
      }
    }
  }

  /**
   * 计算到另一个节点的距离
   * @param node 目标节点
   * @returns 欧几里得距离
   */
  public distanceTo(node: NetworkNode): number {
    return this.position.distanceTo(node.position)
  }

  /**
   * 获取节点的邻居节点（直接连接的节点）
   * @param maxDistance 最大距离限制（可选）
   * @returns 邻居节点数组
   */
  public getNeighbors(maxDistance?: number): NetworkNode[] {
    let neighbors = this.getConnectedNodes()
    
    if (maxDistance !== undefined) {
      neighbors = neighbors.filter(node => this.distanceTo(node) <= maxDistance)
    }
    
    return neighbors
  }

  /**
   * 克隆节点（不包含连接关系）
   * @returns 新的节点实例
   */
  public clone(): NetworkNode {
    const cloned = new NetworkNode(this.position, this.level, this.type)
    cloned.size = this.size
    cloned.distanceFromRoot = this.distanceFromRoot
    cloned.dimension = this.dimension
    cloned.spiralIndex = this.spiralIndex
    cloned.spiralPosition = this.spiralPosition
    return cloned
  }

  /**
   * 获取节点的调试信息
   * @returns 调试信息字符串
   */
  public getDebugInfo(): string {
    return `Node[Level:${this.level}, Type:${this.type}, Connections:${this.connections.length}, Position:(${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}, ${this.position.z.toFixed(2)})]`
  }
}
