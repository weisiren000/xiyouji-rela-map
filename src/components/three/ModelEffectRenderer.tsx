import React, { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  vertexShader,
  fragmentShader,
  edgeVertexShader,
  edgeFragmentShader,
  colorPalettes,
  createPulseUniforms
} from './shaders/ModelShaders'

interface ModelEffectRendererProps {
  model: THREE.Group
  visible?: boolean
  config: ModelEffectConfig
}

export interface ModelEffectConfig {
  // 全局设置
  showWireframe: boolean
  showPoints: boolean
  activePaletteIndex: number
  
  // 点特效参数
  pointSize: number
  pointBrightness: number
  pointOpacity: number
  pulseIntensity: number
  
  // 线框特效参数
  wireframeBrightness: number
  wireframeOpacity: number
  
  // 动画参数
  rotationSpeed: number
  pulseSpeed: number
  
  // 模型变换
  modelScale: number
  modelRotationX: number
  modelRotationY: number
  modelRotationZ: number
}

const defaultConfig: ModelEffectConfig = {
  showWireframe: true,
  showPoints: true,
  activePaletteIndex: 1,
  pointSize: 1.0,
  pointBrightness: 0.7,
  pointOpacity: 0.8,
  pulseIntensity: 0.8,
  wireframeBrightness: 0.7,
  wireframeOpacity: 0.8,
  rotationSpeed: 0.0005,
  pulseSpeed: 3.0,
  modelScale: 18.0,
  modelRotationX: 0,
  modelRotationY: 0,
  modelRotationZ: 0
}

/**
 * 模型特效渲染器
 * 功能：
 * - 从GLB模型提取顶点和边
 * - 渲染点特效和线框特效
 * - 支持脉冲动画和颜色变化
 * - 可配置的参数系统
 */
export const ModelEffectRenderer: React.FC<ModelEffectRendererProps> = ({
  model,
  visible = true,
  config
}) => {
  const pointsRef = useRef<THREE.Points>(null)
  const wireframeRef = useRef<THREE.LineSegments>(null)
  const modelGroupRef = useRef<THREE.Group>(null)
  
  const [extractedVertices, setExtractedVertices] = useState<any[]>([])
  const [extractedEdges, setExtractedEdges] = useState<any[]>([])
  const [lastPulseIndex, setLastPulseIndex] = useState(0)

  // 创建Uniform变量
  const pointsUniforms = useMemo(() => {
    const uniforms = createPulseUniforms()
    return {
      ...uniforms,
      pointSize: { value: config.pointSize },
      uBrightness: { value: config.pointBrightness },
      uOpacity: { value: config.pointOpacity },
      pulseIntensity: { value: config.pulseIntensity }
    }
  }, [])

  const edgeUniforms = useMemo(() => {
    const uniforms = createPulseUniforms()
    return {
      ...uniforms,
      uBrightness: { value: config.wireframeBrightness },
      uOpacity: { value: config.wireframeOpacity },
      pulseIntensity: { value: config.pulseIntensity }
    }
  }, [])

  // 从模型提取几何数据
  const extractGeometryFromModel = (model: THREE.Group) => {
    const vertices: any[] = []
    const edges: any[] = []
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geometry = child.geometry
        const positionAttribute = geometry.getAttribute('position')
        
        if (!positionAttribute) return
        
        // 提取顶点
        const meshVertices = []
        for (let i = 0; i < positionAttribute.count; i++) {
          const vertex = new THREE.Vector3()
          vertex.fromBufferAttribute(positionAttribute, i)
          
          // 转换到世界坐标
          vertex.applyMatrix4(child.matrixWorld)
          
          meshVertices.push({
            position: vertex.clone(),
            size: THREE.MathUtils.randFloat(0.1, 0.3)
          })
        }
        
        // 提取边（如果有索引）
        if (geometry.index) {
          const indices = geometry.index.array
          
          for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i]
            const b = indices[i + 1]
            const c = indices[i + 2]
            
            if (meshVertices[a] && meshVertices[b] && meshVertices[c]) {
              // 创建三角形的边
              edges.push({
                from: meshVertices[a].position.clone(),
                to: meshVertices[b].position.clone(),
                strength: THREE.MathUtils.randFloat(0.5, 1.0)
              })
              edges.push({
                from: meshVertices[b].position.clone(),
                to: meshVertices[c].position.clone(),
                strength: THREE.MathUtils.randFloat(0.5, 1.0)
              })
              edges.push({
                from: meshVertices[c].position.clone(),
                to: meshVertices[a].position.clone(),
                strength: THREE.MathUtils.randFloat(0.5, 1.0)
              })
            }
          }
        }
        
        vertices.push(...meshVertices)
      }
    })
    
    console.log(`🔍 提取了 ${vertices.length} 个顶点和 ${edges.length} 条边`)
    setExtractedVertices(vertices)
    setExtractedEdges(edges)
  }

  // 当模型改变时提取几何数据
  useEffect(() => {
    if (model) {
      extractGeometryFromModel(model)
    }
  }, [model])

  // 创建点特效几何体
  const pointsGeometry = useMemo(() => {
    if (extractedVertices.length === 0) return null
    
    const geometry = new THREE.BufferGeometry()
    const positions = []
    const sizes = []
    const colors = []
    
    for (const vertex of extractedVertices) {
      positions.push(vertex.position.x, vertex.position.y, vertex.position.z)
      sizes.push(vertex.size * 0.6) // 减小点大小
      
      // 根据调色板获取颜色
      const palette = colorPalettes[config.activePaletteIndex]
      const distanceFromCenter = vertex.position.length()
      const colorIndex = Math.floor(Math.min(distanceFromCenter, palette.length - 1))
      const color = palette[colorIndex % palette.length].clone()
      
      // 添加颜色变化
      color.offsetHSL(
        THREE.MathUtils.randFloatSpread(0.05),
        THREE.MathUtils.randFloatSpread(0.1),
        THREE.MathUtils.randFloatSpread(0.1)
      )
      
      // 降低亮度
      color.multiplyScalar(0.7)
      
      colors.push(color.r, color.g, color.b)
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3))
    
    return geometry
  }, [extractedVertices, config.activePaletteIndex])

  // 创建线框几何体
  const wireframeGeometry = useMemo(() => {
    if (extractedEdges.length === 0) return null
    
    const geometry = new THREE.BufferGeometry()
    const positions = []
    const colors = []
    const strengths = []
    
    for (const edge of extractedEdges) {
      // 创建线段
      positions.push(edge.from.x, edge.from.y, edge.from.z)
      positions.push(edge.to.x, edge.to.y, edge.to.z)
      
      // 根据调色板获取颜色
      const palette = colorPalettes[config.activePaletteIndex]
      const avgPos = new THREE.Vector3().addVectors(edge.from, edge.to).multiplyScalar(0.5)
      const distanceFromCenter = avgPos.length()
      const colorIndex = Math.floor(Math.min(distanceFromCenter, palette.length - 1))
      const color = palette[colorIndex % palette.length].clone()
      
      // 添加颜色变化
      color.offsetHSL(
        THREE.MathUtils.randFloatSpread(0.05),
        THREE.MathUtils.randFloatSpread(0.1),
        THREE.MathUtils.randFloatSpread(0.1)
      )
      
      // 为线段的两个顶点使用相同颜色
      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
      
      // 连接强度
      strengths.push(edge.strength)
      strengths.push(edge.strength)
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('connectionStrength', new THREE.Float32BufferAttribute(strengths, 1))
    
    return geometry
  }, [extractedEdges, config.activePaletteIndex])

  // 创建点材质
  const pointsMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: pointsUniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }, [pointsUniforms])

  // 创建线框材质
  const wireframeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: edgeUniforms,
      vertexShader: edgeVertexShader,
      fragmentShader: edgeFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }, [edgeUniforms])

  // 更新配置参数
  useEffect(() => {
    if (pointsUniforms) {
      pointsUniforms.pointSize.value = config.pointSize
      pointsUniforms.uBrightness.value = config.pointBrightness
      pointsUniforms.uOpacity.value = config.pointOpacity
      pointsUniforms.pulseIntensity.value = config.pulseIntensity
      pointsUniforms.uPulseSpeed.value = config.pulseSpeed
    }
    
    if (edgeUniforms) {
      edgeUniforms.uBrightness.value = config.wireframeBrightness
      edgeUniforms.uOpacity.value = config.wireframeOpacity
      edgeUniforms.pulseIntensity.value = config.pulseIntensity
      edgeUniforms.uPulseSpeed.value = config.pulseSpeed
    }
  }, [config, pointsUniforms, edgeUniforms])

  // 动画循环
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // 更新时间uniform
    if (pointsUniforms) {
      pointsUniforms.uTime.value = time
    }
    if (edgeUniforms) {
      edgeUniforms.uTime.value = time
    }
    
    // 模型旋转
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.x = config.modelRotationX
      modelGroupRef.current.rotation.y += config.rotationSpeed
      modelGroupRef.current.rotation.z = config.modelRotationZ
      modelGroupRef.current.scale.setScalar(config.modelScale)
    }
  })

  if (!model || extractedVertices.length === 0) {
    return null
  }

  return (
    <group ref={modelGroupRef} visible={visible}>
      {/* 点特效 */}
      {config.showPoints && pointsGeometry && (
        <points
          ref={pointsRef}
          geometry={pointsGeometry}
          material={pointsMaterial}
        />
      )}
      
      {/* 线框特效 */}
      {config.showWireframe && wireframeGeometry && (
        <lineSegments
          ref={wireframeRef}
          geometry={wireframeGeometry}
          material={wireframeMaterial}
        />
      )}
    </group>
  )
}

export default ModelEffectRenderer
