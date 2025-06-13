# Three.js 密度函数引力场 - React现代化重构

## 项目概述

这是一个基于React + Three.js的银河系密度函数引力场3D可视化项目，将传统的HTML/JavaScript银河系效果重构为现代化的组件架构。项目1:1复刻了原始HTML文件的震撼银河系旋臂效果。

## 🌟 主要特性

- **🌌 银河系效果**: 8000个星球的螺旋臂结构，密度函数引力场
- **🎮 交互体验**: 鼠标拖拽旋转视角，滚轮缩放
- **🎨 视觉效果**: 辉光后处理、雾气粒子、动态动画
- **⚙️ 实时调节**: lil-gui集成的参数调试面板
- **🚀 现代化架构**: React + TypeScript + Three.js组件化设计
- **⚡ 高性能**: InstancedMesh优化渲染，60fps流畅运行

## 🚀 快速开始

### 环境要求

- Node.js 16+
- pnpm (推荐) 或 npm

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看效果

### 构建生产版本

```bash
pnpm build
```

## 🏗️ 项目架构

```
src/
├── components/          # React组件
│   ├── ui/             # UI组件
│   │   ├── ControlPanel.tsx      # 控制面板
│   │   └── CharacterInfoPanel.tsx # 角色信息面板
│   └── three/          # Three.js组件
│       ├── Galaxy.tsx            # 银河系主组件
│       ├── PlanetCluster.tsx     # 星球集群
│       ├── FogParticles.tsx      # 雾气粒子
│       └── CharacterNodes.tsx    # 角色节点
├── scenes/             # 3D场景
│   └── GalaxyScene.tsx          # 主场景
├── stores/             # Zustand状态管理
│   ├── useGalaxyStore.ts        # 银河系状态
│   └── useCharacterStore.ts     # 角色状态
├── types/              # TypeScript类型
│   ├── galaxy.ts               # 银河系类型
│   └── character.ts            # 角色类型
├── utils/              # 工具函数
│   └── galaxyGenerator.ts      # 银河系生成算法
├── data/               # 数据文件
│   └── xiyoujiCharacters.ts    # 西游记角色数据
├── hooks/              # 自定义Hook
├── assets/             # 静态资源
└── shaders/            # 着色器文件
```

## 🎮 使用说明

### 基本操作

- **鼠标拖拽**: 旋转视角
- **滚轮**: 缩放场景
- **点击金色节点**: 查看角色详细信息
- **右侧面板**: 调节银河系参数

### 角色系统

项目包含5个核心西游记角色：

1. **孙悟空** (金色) - 齐天大圣，主要战力
2. **唐僧** (金色) - 取经团队领袖
3. **猪八戒** (金色) - 天蓬元帅转世
4. **沙僧** (金色) - 卷帘大将转世
5. **如来佛祖** (橙红色) - 佛教最高领袖

### 关系网络

- **师徒关系**: 金色连线
- **同门关系**: 青色连线
- **指导关系**: 紫色连线

点击任意角色节点，相关关系连线会自动显示。

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **3D引擎**: Three.js + @react-three/fiber + @react-three/drei
- **状态管理**: Zustand
- **构建工具**: Vite
- **后期处理**: @react-three/postprocessing
- **UI调试**: lil-gui
- **包管理**: pnpm

## 🎨 核心算法

### 银河系生成

```typescript
// 螺旋臂算法
const r = Math.pow(Math.random(), 2) * galaxyRadius
const armIndex = Math.floor(Math.random() * numArms)
let angle = Math.log(r + 1) * armTightness + (armIndex * 2 * Math.PI / numArms)
angle += (Math.random() - 0.5) * armWidth / (r * 0.1 + 1)

// 3D位置计算
const x = r * Math.cos(angle)
const z = r * Math.sin(angle)
const y = waveAmplitude * Math.sin(waveFrequency * r + angle)
```

### 角色布局

角色根据重要性（rank）分布在银河系中：
- 重要角色靠近中心
- 颜色根据类别区分
- 大小根据战力值确定

## 🔧 配置参数

### 银河系配置

- **星球数量**: 1000-20000个
- **银河系半径**: 20-100单位
- **旋臂数量**: 2-8条
- **旋臂紧密度**: 1-20

### 视觉效果

- **雾气不透明度**: 0-1
- **雾气粒子大小**: 1-20
- **辉光阈值**: 0-1
- **辉光强度**: 0-3

## 📊 性能优化

- **InstancedMesh**: 高效渲染8000+星球
- **useMemo**: 缓存复杂计算
- **useFrame**: 优化动画循环
- **代码分割**: 按需加载组件

## 🔮 未来计划

- [ ] 集成完整的150个西游记角色
- [ ] 添加更多布局算法（九重天、时间轴）
- [ ] 实现角色搜索和筛选功能
- [ ] 添加音效和背景音乐
- [ ] 移动端适配优化
- [ ] VR/AR支持

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 原始银河系效果来源于 `beautiful_sun_shader_frog_v2.html`
- Three.js 社区提供的优秀文档和示例
- React Three Fiber 团队的杰出工作
- 西游记原著为角色数据提供了丰富的素材

---

*为了女儿的未来，每一行代码都承载着希望* ✨
