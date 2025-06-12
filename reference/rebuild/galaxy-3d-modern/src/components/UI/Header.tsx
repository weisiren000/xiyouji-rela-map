import React from 'react';
import { HeaderProps } from '../../types/galaxy';
import './Header.css';

/**
 * 页面头部组件
 * 显示标题和副标题
 */
export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="header">
      <h1 className="header-title">{title}</h1>
      <p className="header-subtitle">{subtitle}</p>
    </div>
  );
};
