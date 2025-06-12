import React from 'react';
import { ToggleButtonProps } from '../../types/galaxy';
import { UI_TEXTS } from '../../utils/constants';
import './ToggleButton.css';

/**
 * 动画切换按钮组件
 * 控制银河系动画的播放/暂停
 */
export const ToggleButton: React.FC<ToggleButtonProps> = ({ isAnimating, onToggle }) => {
  return (
    <button 
      className="toggle-button"
      onClick={onToggle}
      aria-label={isAnimating ? '暂停动画' : '开始动画'}
    >
      {isAnimating ? UI_TEXTS.toggleButton.pause : UI_TEXTS.toggleButton.resume}
    </button>
  );
};
