import React, { useEffect } from 'react';
import { GalaxyProps } from '../../types/galaxy';
import { useAnimation } from '../../hooks/useAnimation';
import { GalaxyCenter } from './GalaxyCenter';
import { SpiralArms } from './SpiralArms';
import { GalacticHalo } from './GalacticHalo';

interface ExtendedGalaxyProps extends GalaxyProps {
  isAnimating: boolean;
}

/**
 * 主银河系组件
 * 组合中心、螺旋臂和星系晕
 */
export const Galaxy: React.FC<ExtendedGalaxyProps> = ({
  config,
  onProgress,
  onComplete,
  isAnimating
}) => {
  const { galaxyGroupRef, spiralCubesRef } = useAnimation({
    isAnimating,
    rotationSpeed: config.animation.rotationSpeed,
    floatingSpeed: config.animation.floatingSpeed,
    floatingAmplitude: config.animation.floatingAmplitude,
  });

  // 处理加载完成
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onProgress) onProgress(100);
      if (onComplete) onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onProgress, onComplete]);

  return (
    <group ref={galaxyGroupRef}>
      {/* 银河系中心 */}
      <GalaxyCenter
        radius={config.center.radius}
        cubeCount={config.center.cubeCount}
        cubeSize={config.center.cubeSize}
        color={config.center.color}
        emissiveColor={config.center.emissiveColor}
        emissiveIntensity={config.center.emissiveIntensity}
        onProgress={onProgress}
      />

      {/* 螺旋臂 */}
      <SpiralArms
        armCount={config.spiralArms.armCount}
        cubesPerArm={config.spiralArms.cubesPerArm}
        cubeSize={config.spiralArms.cubeSize}
        maxDistance={config.spiralArms.maxDistance}
        minDistance={config.spiralArms.minDistance}
        hueRange={config.spiralArms.hueRange}
        verticalSpread={config.spiralArms.verticalSpread}
        spiralCubesRef={spiralCubesRef}
        onProgress={onProgress}
      />

      {/* 星系晕 */}
      <GalacticHalo
        starCount={config.halo.starCount}
        starSize={config.halo.starSize}
        minRadius={config.halo.minRadius}
        maxRadius={config.halo.maxRadius}
        color={config.halo.color}
        emissiveIntensity={config.halo.emissiveIntensity}
        onProgress={onProgress}
      />
    </group>
  );
};
