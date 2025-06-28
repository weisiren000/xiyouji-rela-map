import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { InstancedMesh, Object3D, Color } from 'three'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import { StarField } from '../../Galaxy'
import { EventCharacterGraph } from './components'
import { EventCharacterGraphGUI } from '@/components/controls/EventCharacterGraphGUI'

/**
 * 单个事件球体组件
 * 在详情视图中显示选中的事件点
 */
const SingleEventSphere: React.FC = () => {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])
  const { selectedEvent } = useGalaxyStore()

  // 根据难次生成颜色
  const getEventColor = (nanci: number) => {
    const progress = (nanci - 1) / 80 // 0-1之间
    if (progress < 0.33) {
      // 蓝色到紫色
      const r = Math.round(100 + progress * 3 * 155) / 255
      const g = Math.round(150 - progress * 3 * 100) / 255
      const b = 1
      return new Color(r, g, b)
    } else if (progress < 0.66) {
      // 紫色到粉色
      const localProgress = (progress - 0.33) / 0.33
      const r = 1
      const g = Math.round(50 + localProgress * 100) / 255
      const b = Math.round(255 - localProgress * 100) / 255
      return new Color(r, g, b)
    } else {
      // 粉色到金色
      const localProgress = (progress - 0.66) / 0.34
      const r = 1
      const g = Math.round(150 + localProgress * 105) / 255
      const b = Math.round(155 - localProgress * 155) / 255
      return new Color(r, g, b)
    }
  }

  useFrame(() => {
    if (!meshRef.current || !selectedEvent) return

    const time = Date.now() * 0.001

    // 设置球体位置（居中）
    tempObject.position.set(0, 0, 0)
    
    // 添加轻微的浮动效果
    tempObject.position.y += Math.sin(time * 2) * 0.2
    
    // 添加缓慢旋转
    tempObject.rotation.y = time * 0.5
    tempObject.rotation.x = Math.sin(time * 0.3) * 0.1
    
    // 设置大小（比正常大一些，因为是焦点）
    const baseSize = 2.0
    const pulseScale = 1 + Math.sin(time * 3) * 0.1
    tempObject.scale.setScalar(baseSize * pulseScale)

    tempObject.updateMatrix()
    meshRef.current.setMatrixAt(0, tempObject.matrix)

    // 设置颜色
    if (meshRef.current.instanceColor) {
      const color = getEventColor(selectedEvent.nanci)
      meshRef.current.setColorAt(0, color)
      meshRef.current.instanceColor.needsUpdate = true
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!selectedEvent) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 1]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        emissive={getEventColor(selectedEvent.nanci)}
        emissiveIntensity={0.3}
        metalness={0.2}
        roughness={0.4}
        transparent
        opacity={1}
      />
    </instancedMesh>
  )
}

/**
 * 详情场景相机控制组件
 */
interface DetailSceneCameraProps {
  enabled?: boolean
}

const DetailSceneCamera: React.FC<DetailSceneCameraProps> = ({ enabled = true }) => {
  return (
    <OrbitControls
      enabled={enabled}
      enablePan={enabled}
      enableZoom={enabled}
      enableRotate={enabled}
      minDistance={3}
      maxDistance={15}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      autoRotate={false}
      autoRotateSpeed={0.5}
    />
  )
}

/**
 * 事件详情场景组件
 * 功能：
 * - 独立的3D场景，只显示选中的事件球体
 * - 显示事件相关角色的关系图谱
 * - 保持星空背景
 * - 固定的最佳观察相机角度
 * - 专门用于事件详情展示
 */
export const EventDetailScene: React.FC = () => {
  const { selectedEvent } = useGalaxyStore()
  const [showCharacterGraph, setShowCharacterGraph] = useState(true)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [dragStatus, setDragStatus] = useState<string>('')
  const [controlsEnabled, setControlsEnabled] = useState(true)

  if (!selectedEvent) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#000' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%', 
          color: '#fff' 
        }}>
          未选择事件
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', position: 'relative' }}>
      {/* 关系图谱控制按钮 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setShowCharacterGraph(!showCharacterGraph)}
          style={{
            padding: '8px 16px',
            backgroundColor: showCharacterGraph ? '#4CAF50' : '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'background-color 0.3s'
          }}
        >
          {showCharacterGraph ? '隐藏关系图谱' : '显示关系图谱'}
        </button>

        {/* 重置位置按钮 */}
        <button
          onClick={() => setResetTrigger(prev => prev + 1)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#FF9800',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'background-color 0.3s'
          }}
          title="重置角色位置"
        >
          🔄 重置位置
        </button>
      </div>

      {/* 拖拽状态指示器 */}
      {dragStatus && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 215, 0, 0.9)',
          color: '#000',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          🎯 {dragStatus}
        </div>
      )}

      {/* 相机控制状态指示器 */}
      {!controlsEnabled && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 69, 0, 0.9)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          🔒 视角控制已禁用
        </div>
      )}

      {/* 交互说明 */}
      {showCharacterGraph && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '320px',
          lineHeight: '1.4'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>💡 交互提示</div>
          <div>• <strong>长按拖拽</strong>：长按角色球体300ms后拖动可改变位置</div>
          <div>• <strong>双击进入</strong>：双击角色球体进入角色详情视图</div>
          <div>• <strong>重置位置</strong>：点击右上角重置按钮恢复原始布局</div>
          <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
            💡 <strong>拖拽特性</strong>：基于当前视角的平移，移动方向跟随视角
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
            🎯 <strong>视觉提示</strong>：长按时球体变金色，拖拽时明显放大
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
            🔒 <strong>注意</strong>：拖拽时视角控制会自动禁用，释放后恢复
          </div>
        </div>
      )}

      <Canvas
        camera={{
          position: [0, 2, 8],
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
        <ambientLight intensity={0.2} />
        
        {/* 主光源 */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          color="#ffffff"
        />
        
        {/* 辅助光源 */}
        <pointLight
          position={[-5, 3, -5]}
          intensity={0.5}
          color="#4facfe"
        />

        {/* 背景星空 */}
        <StarField />

        {/* 选中的事件球体 */}
        <SingleEventSphere />

        {/* 事件角色关系图谱 */}
        <EventCharacterGraph
          event={selectedEvent}
          visible={showCharacterGraph}
          resetTrigger={resetTrigger}
          onDragStatusChange={setDragStatus}
          onControlsEnabledChange={setControlsEnabled}
        />

        {/* 相机控制 */}
        <DetailSceneCamera enabled={controlsEnabled} />
      </Canvas>

      {/* 关系图谱GUI控制面板 */}
      <EventCharacterGraphGUI
        visible={showCharacterGraph}
        position={{ bottom: 20, left: 20 }}
      />
    </div>
  )
}

export default EventDetailScene
