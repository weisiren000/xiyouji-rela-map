import React from 'react';
import { LoadingProps } from '../../types/galaxy';
import { UI_TEXTS } from '../../utils/constants';
import './Loading.css';

/**
 * 加载组件
 * 显示加载进度和进度条
 */
export const Loading: React.FC<LoadingProps> = ({ progress, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-container">
      <div className="loading-text">{UI_TEXTS.loading}</div>
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-text">{Math.round(progress)}%</div>
    </div>
  );
};
