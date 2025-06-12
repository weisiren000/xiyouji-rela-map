import React from 'react';
import { ControlsProps } from '../../types/galaxy';
import './Controls.css';

/**
 * 控制说明组件
 * 显示鼠标操作说明
 */
export const Controls: React.FC<ControlsProps> = ({ instructions }) => {
  return (
    <div className="controls">
      {instructions.map((instruction, index) => (
        <p key={index} className="controls-instruction">
          {instruction}
        </p>
      ))}
    </div>
  );
};
