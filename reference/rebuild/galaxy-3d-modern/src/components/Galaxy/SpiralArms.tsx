import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { SpiralCubeData } from '../../types/galaxy';
import { generateSpiralArmPoint, generateRandomColor, generateRandomRotation } from '../../utils/galaxyMath';

interface SpiralArmsProps {
  armCount: number;
  cubesPerArm: number;
  cubeSize: number;
  maxDistance: number;
  minDistance: number;
  hueRange: [number, number];
  verticalSpread: number;
  spiralCubesRef: React.MutableRefObject<SpiralCubeData[]>;
  onProgress?: (progress: number) => void;
}

/**
 * 螺旋臂组件
 * 创建银河系的四条螺旋臂
 */
export const SpiralArms: React.FC<SpiralArmsProps> = ({
  armCount,
  cubesPerArm,
  cubeSize,
  maxDistance,
  minDistance,
  hueRange,
  verticalSpread,
  spiralCubesRef,
  onProgress,
}) => {
  // 生成螺旋臂立方体数据
  const armData = useMemo(() => {
    const data: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      color: THREE.Color;
      originalY: number;
      timeOffset: number;
      armIndex: number;
    }> = [];

    for (let arm = 0; arm < armCount; arm++) {
      for (let i = 0; i < cubesPerArm; i++) {
        // 生成螺旋臂上的点
        const [x, y, z] = generateSpiralArmPoint(
          arm,
          i,
          cubesPerArm,
          minDistance,
          maxDistance,
          armCount
        );

        const rotation = generateRandomRotation();
        
        // 生成蓝紫色调的颜色
        const hue = hueRange[0] + Math.random() * (hueRange[1] - hueRange[0]);
        const cubeColor = generateRandomColor(hue, hue, 0.8, 0.6);
        
        data.push({
          position: [x, y, z],
          rotation,
          color: cubeColor,
          originalY: y,
          timeOffset: Math.random() * Math.PI * 2,
          armIndex: arm,
        });

        // 报告进度
        if (onProgress && (arm * cubesPerArm + i) % 200 === 0) {
          const totalCubes = armCount * cubesPerArm;
          const currentCube = arm * cubesPerArm + i;
          onProgress(30 + (currentCube / totalCubes) * 40); // 螺旋臂占总进度的40%
        }
      }
    }

    return data;
  }, [armCount, cubesPerArm, maxDistance, minDistance, hueRange, onProgress]);

  // 将立方体数据存储到ref中供动画使用
  useEffect(() => {
    // 这里需要在组件渲染后更新ref，所以暂时留空
    // 实际的mesh引用会在渲染时设置
  }, [armData]);

  return (
    <group>
      {armData.map((cube, index) => (
        <mesh
          key={`spiral-cube-${index}`}
          position={cube.position}
          rotation={cube.rotation}
          ref={(mesh) => {
            if (mesh) {
              // 将mesh引用添加到spiralCubesRef中
              const cubeData: SpiralCubeData = {
                mesh,
                originalY: cube.originalY,
                timeOffset: cube.timeOffset,
                armIndex: cube.armIndex,
              };
              
              // 检查是否已存在，避免重复添加
              const existingIndex = spiralCubesRef.current.findIndex(
                (item) => item.mesh === mesh
              );
              
              if (existingIndex === -1) {
                spiralCubesRef.current.push(cubeData);
              }
            }
          }}
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
