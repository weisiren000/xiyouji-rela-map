import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ModelSystem from '../components/three/ModelSystem'

/**
 * 模型系统测试组件
 * 用于独立测试模型加载和特效系统
 */
export const ModelSystemTest: React.FC = () => {
  // 测试角色数据
  const testCharacter = {
    name: 'sun_wu_kong',
    visual: {
      color: '#ff6b35',
      size: 1.0,
      emissiveIntensity: 0.7
    }
  }

  const fallbackSphere = (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={testCharacter.visual.color}
        emissive={testCharacter.visual.color}
        emissiveIntensity={testCharacter.visual.emissiveIntensity}
        transparent
        opacity={0.9}
      />
    </mesh>
  )

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{
          position: [0, 10, 20],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance' as const
        }}
      >
        {/* 环境光 */}
        <ambientLight intensity={0.3} />
        
        {/* 主光源 */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
        />

        {/* 测试模型系统 */}
        <ModelSystem
          characterName={testCharacter.name}
          fallbackSphere={fallbackSphere}
          showGUI={true}
          visible={true}
        />

        {/* 相机控制 */}
        <OrbitControls
          target={[0, 0, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          autoRotate={false}
        />
      </Canvas>
      
      {/* 测试信息 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        color: 'white',
        background: 'rgba(0,0,0,0.8)',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace'
      }}>
        <h3>模型系统测试</h3>
        <p>角色: {testCharacter.name}</p>
        <p>模型路径: /models/{testCharacter.name}.glb</p>
        <p>如果模型存在，应该显示线框和点特效</p>
        <p>如果模型不存在，应该显示橙色球体</p>
      </div>
    </div>
  )
}

export default ModelSystemTest
