import React from 'react';
import { StatsProps } from '../../types/galaxy';
import './Stats.css';

/**
 * 统计信息组件
 * 显示立方体数量和银河系半径
 */
export const Stats: React.FC<StatsProps> = ({ cubeCount, galaxyRadius }) => {
  const formatCubeCount = (count: number): string => {
    return count.toLocaleString();
  };

  return (
    <div className="stats">
      <p className="stats-item">
        立方体数量: <span className="stats-value">{formatCubeCount(cubeCount)}</span>
      </p>
      <p className="stats-item">
        星系半径: <span className="stats-value">{galaxyRadius}</span>
      </p>
    </div>
  );
};
