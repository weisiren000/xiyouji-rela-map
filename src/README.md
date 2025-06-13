# 西游记3D可视化项目 - 现代化重构

## 项目概述
基于原始的Three.js银河系效果，重构为现代化的React + Three.js西游记角色关系可视化平台。

## 技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **3D引擎**: Three.js + @react-three/fiber + @react-three/drei
- **状态管理**: Zustand
- **包管理器**: pnpm
- **UI组件**: 自定义组件 + lil-gui集成
- **后期处理**: @react-three/postprocessing

## 项目结构
```
src/
├── components/          # React组件
│   ├── ui/             # UI组件
│   └── three/          # Three.js组件
├── scenes/             # 3D场景
├── stores/             # 状态管理
├── types/              # TypeScript类型
├── utils/              # 工具函数
├── hooks/              # 自定义Hook
├── assets/             # 静态资源
└── shaders/            # 着色器文件
```

## 重构目标
1. 保持原始效果的视觉质量
2. 添加现代化的组件架构
3. 集成西游记角色数据
4. 提供可扩展的交互系统
5. 支持多种可视化模式

## 开发阶段
- **阶段1**: 基础架构搭建
- **阶段2**: 核心效果移植
- **阶段3**: 数据集成
- **阶段4**: 交互功能
- **阶段5**: 优化和扩展
