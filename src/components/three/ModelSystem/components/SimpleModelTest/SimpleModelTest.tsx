import React, { Suspense } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

interface SimpleModelTestProps {
  characterName: string
}

/**
 * 简单模型测试组件
 * 用于测试基本的模型加载功能
 */
const SimpleModel: React.FC<{ path: string }> = ({ path }) => {
  const gltf = useLoader(GLTFLoader, path)
  
  return (
    <primitive 
      object={gltf.scene} 
      scale={[1, 1, 1]}
      position={[0, 0, 0]}
    />
  )
}

export const SimpleModelTest: React.FC<SimpleModelTestProps> = ({ characterName }) => {
  const modelPath = `/models/${characterName}.glb`
  
  return (
    <Suspense fallback={
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
    }>
      <SimpleModel path={modelPath} />
    </Suspense>
  )
}

export default SimpleModelTest
