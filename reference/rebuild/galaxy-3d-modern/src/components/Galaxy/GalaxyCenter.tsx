import React, { useMemo } from 'react';
import * as THREE from 'three';
import { generateSpherePoint, generateRandomColor, generateRandomRotation } from '../../utils/galaxyMath';

interface GalaxyCenterProps {
  radius: number;
  cubeCount: number;
  cubeSize: number;
  color: string;
  emissiveColor: string;
  emissiveIntensity: number;
  onProgress?: (progress: number) => void;
}

/**
 * 银河系中心组件
 * 创建中央核球和周围的立方体像素
 */
export const GalaxyCenter: React.FC<GalaxyCenterProps> = ({
  radius,
  cubeCount,
  cubeSize,
  color,
  emissiveColor,
  emissiveIntensity,
  onProgress,
}) => {
  // 生成中心立方体的位置和旋转数据
  const cubeData = useMemo(() => {
    const data: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      color: THREE.Color;
    }> = [];

    for (let i = 0; i < cubeCount; i++) {
      // 在球体内生成随机位置
      const position = generateSpherePoint(4, radius);
      const rotation = generateRandomRotation();
      
      // 生成黄色调的颜色
      const cubeColor = generateRandomColor(0.12, 0.18, 0.9, 0.6);
      
      data.push({
        position,
        rotation,
        color: cubeColor,
      });

      // 报告进度
      if (onProgress && i % 100 === 0) {
        onProgress((i / cubeCount) * 30); // 中心占总进度的30%
      }
    }

    return data;
  }, [radius, cubeCount, onProgress]);

  return (
    <group>
      {/* 中央核心球体 */}
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshPhongMaterial 
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* 中心周围的立方体像素 */}
      {cubeData.map((cube, index) => (
        <mesh
          key={`center-cube-${index}`}
          position={cube.position}
          rotation={cube.rotation}
        >
          <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
          <meshPhongMaterial
            color={cube.color}
            emissive={cube.color.clone().multiplyScalar(0.3)}
            shininess={30}
          />
        </mesh>
      ))}
    </group>
  );
};
