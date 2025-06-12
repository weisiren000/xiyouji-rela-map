import React from 'react';
import { InfoPanelProps } from '../../types/galaxy';
import './InfoPanel.css';

/**
 * 信息面板组件
 * 显示银河系结构信息
 */
export const InfoPanel: React.FC<InfoPanelProps> = ({ title, items }) => {
  return (
    <div className="info-panel">
      <h3 className="info-panel-title">{title}</h3>
      {items.map((item, index) => (
        <p key={index} className="info-panel-item">
          {item}
        </p>
      ))}
    </div>
  );
};
