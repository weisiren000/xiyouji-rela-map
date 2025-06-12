import React, { useMemo } from 'react';
import { generateSpherePoint } from '../../utils/galaxyMath';

interface GalacticHaloProps {
  starCount: number;
  starSize: number;
  minRadius: number;
  maxRadius: number;
  color: string;
  emissiveIntensity: number;
  onProgress?: (progress: number) => void;
}

/**
 * 星系晕组件
 * 创建银河系外围的稀疏恒星
 */
export const GalacticHalo: React.FC<GalacticHaloProps> = ({
  starCount,
  starSize,
  minRadius,
  maxRadius,
  color,
  emissiveIntensity,
  onProgress,
}) => {
  // 生成星系晕恒星位置数据
  const starData = useMemo(() => {
    const data: Array<{
      position: [number, number, number];
    }> = [];

    for (let i = 0; i < starCount; i++) {
      // 在球体外围生成随机位置
      const position = generateSpherePoint(minRadius, maxRadius);
      
      data.push({ position });

      // 报告进度
      if (onProgress && i % 50 === 0) {
        onProgress(70 + (i / starCount) * 30); // 星系晕占总进度的30%
      }
    }

    return data;
  }, [starCount, minRadius, maxRadius, onProgress]);

  return (
    <group>
      {starData.map((star, index) => (
        <mesh
          key={`halo-star-${index}`}
          position={star.position}
        >
          <sphereGeometry args={[starSize, 8, 8]} />
          <meshPhongMaterial
            color={color}
            emissive="#aaaaaa"
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
      ))}
    </group>
  );
};
