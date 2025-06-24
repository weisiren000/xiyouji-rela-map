import React, { useRef, useEffect, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
// import { Suspense } from 'react' // 暂时注释
import * as THREE from 'three'
import { useModelExists } from '@/hooks/useSmartModelDetection'
import { enableBVHForModel } from '@/utils/three/bvhUtils'

interface ModelLoaderProps {
  characterName: string
  onModelLoad?: (model: THREE.Group) => void
  onModelError?: (error: Error) => void
  visible?: boolean
}

/**
 * 模型加载器组件
 * 功能：
 * - 根据角色名称加载对应的.glb模型
 * - 自动居中和缩放模型
 * - 处理加载错误
 * - 支持显示/隐藏控制
 */
export const ModelLoader: React.FC<ModelLoaderProps> = ({
  characterName,
  onModelLoad,
  // onModelError, // 暂时注释
  visible = true
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const [modelPath, setModelPath] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<Error | null>(null)

  // 使用智能模型检测
  const { exists: modelExists, modelPath: detectedPath, matchInfo } = useModelExists(characterName)

  // 设置模型路径
  useEffect(() => {
    if (modelExists && detectedPath) {
      setModelPath(detectedPath)
      setLoadError(null)
      console.log(`🎯 智能匹配成功: ${characterName} -> ${detectedPath} (${matchInfo?.type}, 置信度: ${matchInfo?.confidence})`)
    } else {
      setModelPath(null)
      console.log(`❌ 未找到模型: ${characterName}`)
    }
  }, [characterName, modelExists, detectedPath, matchInfo])

  // 加载模型 - 使用Suspense边界保护
  const gltf = modelPath ? useLoader(GLTFLoader, modelPath) : null

  // 处理模型加载完成
  useEffect(() => {
    if (gltf && groupRef.current) {
      const model = gltf.scene.clone()
      
      // 清除之前的模型
      groupRef.current.clear()
      
      // 居中模型
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      
      // 缩放模型到合适大小
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      if (maxDim > 2) {
        const scale = 2 / maxDim
        model.scale.set(scale, scale, scale)
      }
      
      // 为模型启用BVH优化
      enableBVHForModel(model, {
        maxDepth: 30,
        maxLeafTris: 8,
        verbose: false
      })
      console.log(`🌳 为模型 ${characterName} 启用BVH优化`)

      // 添加到组中
      groupRef.current.add(model)

      // 通知父组件模型已加载
      if (onModelLoad) {
        onModelLoad(model)
      }

      console.log(`✅ 模型加载成功: ${characterName}.glb`)
    }
  }, [gltf, characterName, onModelLoad])

  // 如果没有模型路径或加载错误，返回null
  if (!modelPath || loadError) {
    return null
  }

  return (
    <group ref={groupRef} visible={visible}>
      {/* 模型将在useEffect中动态添加 */}
    </group>
  )
}



export default ModelLoader
