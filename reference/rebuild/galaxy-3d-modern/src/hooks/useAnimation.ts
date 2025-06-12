import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SpiralCubeData } from '../types/galaxy';

interface UseAnimationProps {
  isAnimating: boolean;
  rotationSpeed: number;
  floatingSpeed: number;
  floatingAmplitude: number;
}

interface UseAnimationReturn {
  galaxyGroupRef: React.RefObject<THREE.Group>;
  spiralCubesRef: React.MutableRefObject<SpiralCubeData[]>;
  updateSpiralArms: () => void;
}

/**
 * 银河系动画Hook
 * 管理银河系的旋转和螺旋臂的浮动动画
 */
export function useAnimation({
  isAnimating,
  rotationSpeed,
  floatingSpeed,
  floatingAmplitude,
}: UseAnimationProps): UseAnimationReturn {
  const galaxyGroupRef = useRef<THREE.Group>(null);
  const spiralCubesRef = useRef<SpiralCubeData[]>([]);

  // 更新螺旋臂动画的函数
  const updateSpiralArms = useCallback(() => {
    if (!isAnimating) return;

    const time = Date.now() * 0.001;
    
    spiralCubesRef.current.forEach((cubeData) => {
      const { mesh, originalY, timeOffset } = cubeData;
      
      // 上下浮动效果
      mesh.position.y = originalY + Math.sin(time * floatingSpeed + timeOffset) * floatingAmplitude;
      
      // 轻微旋转效果
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.004;
    });
  }, [isAnimating, floatingSpeed, floatingAmplitude]);

  // 使用React Three Fiber的useFrame进行动画循环
  useFrame(() => {
    if (!isAnimating) return;

    // 旋转整个银河系
    if (galaxyGroupRef.current) {
      galaxyGroupRef.current.rotation.y += rotationSpeed;
    }

    // 更新螺旋臂动画
    updateSpiralArms();
  });

  return {
    galaxyGroupRef,
    spiralCubesRef,
    updateSpiralArms,
  };
}
