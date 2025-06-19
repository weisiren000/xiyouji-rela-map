import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

/**
 * 基础模型加载测试
 */
const TestModel: React.FC = () => {
  try {
    const gltf = useLoader(GLTFLoader, '/models/sun_wu_kong.glb')
    console.log('✅ 模型加载成功:', gltf)
    
    return (
      <primitive 
        object={gltf.scene} 
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
      />
    )
  } catch (error) {
    console.error('❌ 模型加载失败:', error)
    return (
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    )
  }
}

/**
 * 模型加载测试页面
 */
export const ModelLoadTest: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{
          position: [0, 5, 10],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Suspense fallback={
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#666666" wireframe />
          </mesh>
        }>
          <TestModel />
        </Suspense>
        
        <OrbitControls />
      </Canvas>
      
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        color: 'white',
        background: 'rgba(0,0,0,0.8)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <h3>模型加载测试</h3>
        <p>路径: /models/sun_wu_kong.glb</p>
        <p>检查控制台输出</p>
      </div>
    </div>
  )
}

export default ModelLoadTest
