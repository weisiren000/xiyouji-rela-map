import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Galaxy } from '../Galaxy/Galaxy';
import { 
  DEFAULT_CAMERA_CONFIG, 
  DEFAULT_SCENE_CONFIG, 
  DEFAULT_LIGHT_CONFIG,
  PERFORMANCE_CONFIG,
  CONTROLS_CONFIG 
} from '../../utils/constants';
import { GalaxyProps } from '../../types/galaxy';

interface SceneProps extends Omit<GalaxyProps, 'config'> {
  config: GalaxyProps['config'];
  isAnimating: boolean;
}

/**
 * 3D场景组件
 * 设置相机、光源、控制器和银河系
 */
export const Scene: React.FC<SceneProps> = ({ 
  config, 
  onProgress, 
  onComplete,
  isAnimating 
}) => {
  return (
    <Canvas
      camera={{
        position: DEFAULT_CAMERA_CONFIG.position,
        fov: DEFAULT_CAMERA_CONFIG.fov,
        near: DEFAULT_CAMERA_CONFIG.near,
        far: DEFAULT_CAMERA_CONFIG.far,
      }}
      gl={{
        antialias: PERFORMANCE_CONFIG.antialias,
        alpha: PERFORMANCE_CONFIG.alpha,
        powerPreference: PERFORMANCE_CONFIG.powerPreference,
      }}
      dpr={PERFORMANCE_CONFIG.pixelRatio}
      style={{ width: '100%', height: '100vh' }}
    >
      {/* 场景背景和雾效 */}
      <color attach="background" args={[DEFAULT_SCENE_CONFIG.background]} />
      <fog 
        attach="fog" 
        args={[
          DEFAULT_SCENE_CONFIG.fog.color, 
          DEFAULT_SCENE_CONFIG.fog.near, 
          DEFAULT_SCENE_CONFIG.fog.far
        ]} 
      />

      {/* 光源设置 */}
      <ambientLight 
        color={DEFAULT_LIGHT_CONFIG.ambient.color}
        intensity={DEFAULT_LIGHT_CONFIG.ambient.intensity}
      />
      
      <directionalLight
        color={DEFAULT_LIGHT_CONFIG.directional.color}
        intensity={DEFAULT_LIGHT_CONFIG.directional.intensity}
        position={DEFAULT_LIGHT_CONFIG.directional.position}
      />
      
      <pointLight
        color={DEFAULT_LIGHT_CONFIG.center.color}
        intensity={DEFAULT_LIGHT_CONFIG.center.intensity}
        distance={DEFAULT_LIGHT_CONFIG.center.distance}
        position={[0, 0, 0]}
      />

      {/* 轨道控制器 */}
      <OrbitControls
        enableDamping={CONTROLS_CONFIG.enableDamping}
        dampingFactor={CONTROLS_CONFIG.dampingFactor}
        rotateSpeed={CONTROLS_CONFIG.rotateSpeed}
        zoomSpeed={CONTROLS_CONFIG.zoomSpeed}
        panSpeed={CONTROLS_CONFIG.panSpeed}
        maxDistance={CONTROLS_CONFIG.maxDistance}
        minDistance={CONTROLS_CONFIG.minDistance}
      />

      {/* 银河系 */}
      <Galaxy
        config={config}
        isAnimating={isAnimating}
        onProgress={onProgress}
        onComplete={onComplete}
      />
    </Canvas>
  );
};
