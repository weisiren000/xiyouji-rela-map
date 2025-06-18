# 西游记关系图谱3D可视化项目架构

## 项目概述
基于西游记角色数据的3D可视化项目，实现角色关系的交互式展示。

## 核心技术栈
- **前端**: React + TypeScript + Three.js + Vite
- **状态管理**: Zustand
- **3D渲染**: @react-three/fiber + @react-three/drei
- **后端**: Node.js + Express
- **包管理**: pnpm

## 项目结构

```
src/
├── components/           # React组件
│   ├── three/           # 3D相关组件
│   │   ├── CharacterSpheresSimple.tsx    # 角色球体渲染（当前使用）
│   │   └── CharacterSpheres.tsx          # 原始组件（已禁用）
│   ├── ui/              # UI界面组件
│   │   ├── CharacterInfoOverlay.tsx      # 角色信息卡片
│   │   └── Controls.tsx                  # 控制面板
│   └── dashboard/       # 仪表板组件
├── stores/              # 全局状态管理
│   ├── useCharacterInfoStore.ts          # 角色信息状态
│   ├── useDataStore.ts                   # 数据状态
│   └── useGalaxyStore.ts                 # 银河系状态
├── hooks/               # 自定义Hooks
│   ├── useCharacterInteraction.ts        # 角色交互逻辑
│   ├── useDataLoader.ts                  # 数据加载
│   └── usePerformanceMonitor.ts          # 性能监控
├── services/            # 服务层
│   └── dataApi.ts                        # API服务
├── types/               # TypeScript类型定义
│   ├── character.ts                      # 角色类型
│   ├── galaxy.ts                         # 银河系类型
│   └── dashboard.ts                      # 仪表板类型
├── scenes/              # 3D场景
│   └── GalaxyScene.tsx                   # 主场景组件
├── utils/               # 工具函数
│   ├── dataLoader.ts                     # 数据加载工具
│   └── galaxyGenerator.ts               # 银河系生成器
├── server/              # 后端服务
│   ├── dataServer.js                     # 数据服务器
│   └── package.json                      # 后端依赖
└── App.tsx              # 主应用组件
```

## 核心功能模块

### 1. 3D可视化系统
- **CharacterSpheresSimple**: 角色球体渲染和交互
- **GalaxyScene**: 3D场景管理
- **BeautifulHighlight**: 高亮效果系统

### 2. 交互系统
- **鼠标悬浮**: 角色高亮和信息显示
- **智能定位**: 信息卡片边界检测
- **状态同步**: 3D组件与UI组件状态管理

### 3. 数据管理
- **角色数据**: 从JSON文件加载角色信息
- **别名系统**: 支持角色别名映射
- **实时加载**: 动态数据加载和更新

### 4. 外部访问
- **前端访问**: Cloudflare Tunnel支持
- **API配置**: 支持外部后端URL配置
- **跨域处理**: CORS和主机配置

## 当前状态

### ✅ 已实现功能
- 3D角色球体渲染
- 鼠标悬浮高亮效果
- 角色信息卡片显示
- 全局状态管理架构
- 环境变量访问机制修复
- 智能卡片定位算法
- 系统性故障排除流程

### 🔄 需要重新配置
- 外部访问Cloudflare Tunnel配置
- 外部环境功能完整性验证

### 📋 待开发功能
- 点击交互功能
- 多选功能
- 角色关系可视化
- 性能优化改进

## 技术架构亮点

### 全局状态管理
使用Zustand实现3D组件与UI组件的解耦：
```typescript
// 3D组件负责交互检测
setHoveredCharacter(character)

// UI组件负责信息显示
<CharacterInfoOverlay character={hoveredCharacter} />
```

### 避免Portal冲突
采用分离关注点的设计，避免在3D组件中直接使用Portal渲染，确保渲染稳定性。

### 智能边界检测
信息卡片具备智能定位算法，自动调整位置避免超出屏幕边界。

## 部署配置

### 本地开发
- 前端: `pnpm dev` (端口3000)
- 后端: `node src/server/dataServer.js` (端口3003)

### 外部访问
- 前端: Cloudflare Tunnel已配置
- 后端: 待配置Cloudflare Tunnel

## 项目管理

### 实验记录系统
- `_experiments/exp/`: 技术实现记录
- `_experiments/sum/`: 工作总结
- `_experiments/mem/`: 技术要点记忆

### 最新进展
- EXP112: 关键Bug修复与项目状态恢复
- SUM17: 环境变量访问错误修复工作总结
- MEM12: 故障排除方法论与最佳实践记忆

## 下一步计划
1. 基于修复后代码重新配置外部访问
2. 验证所有功能在外部环境中的完整性
3. 实现点击交互功能
4. 开发角色关系可视化
5. 完善错误处理和监控机制
