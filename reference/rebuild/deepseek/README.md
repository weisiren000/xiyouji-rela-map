# 3D 星空互动场景 - 现代化重构版本

## 项目简介

这是一个使用 Three.js 创建的3D星空互动场景的现代化重构版本。项目采用 TypeScript + Vite 构建，具有模块化、组件化的架构设计，提供了更好的代码可维护性和开发体验。

## 功能特性

- 🌟 **10,000颗星星** - 动态闪烁效果的星空场景
- 🌌 **银河系旋臂** - 4个旋臂的银河系模拟，带有颜色渐变
- 🎮 **交互控制** - 鼠标拖拽旋转、滚轮缩放、右键平移
- 📱 **响应式设计** - 支持各种屏幕尺寸
- ⚡ **现代化技术栈** - TypeScript + Vite + Three.js
- 🎨 **优雅的UI** - 现代CSS设计，支持高对比度和减少动画模式
- 🔧 **模块化架构** - 组件化设计，易于扩展和维护

## 技术栈

- **构建工具**: Vite 5.x
- **语言**: TypeScript 5.x
- **3D引擎**: Three.js 0.160.x
- **样式**: 现代CSS (CSS变量、响应式设计)
- **代码质量**: ESLint + TypeScript严格模式

## 项目结构

```
deepseek/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 组件模块
│   │   ├── StarField.ts   # 星空场景组件
│   │   ├── Galaxy.ts      # 银河系组件
│   │   └── SceneManager.ts # 场景管理器
│   ├── types/             # 类型定义
│   │   └── index.ts       # 主要类型接口
│   ├── utils/             # 工具函数
│   │   ├── config.ts      # 配置文件
│   │   └── helpers.ts     # 辅助函数
│   ├── styles/            # 样式文件
│   │   └── main.css       # 主样式文件
│   └── main.ts            # 应用入口
├── index.html             # HTML模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
└── README.md              # 项目文档
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 或
yarn dev
```

访问 http://localhost:3000 查看效果

### 构建生产版本

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 代码检查

```bash
# 运行 ESLint
npm run lint

# 类型检查
npm run type-check
```

## 配置说明

### 星空配置 (StarFieldConfig)

```typescript
interface StarFieldConfig {
  starCount: number;      // 星星数量，默认 10000
  starSize: number;       // 星星大小，默认 0.7
  starOpacity: number;    // 星星透明度，默认 0.8
  spread: number;         // 分布范围，默认 2000
}
```

### 银河系配置 (GalaxyConfig)

```typescript
interface GalaxyConfig {
  armCount: number;           // 旋臂数量，默认 4
  particlesPerArm: number;    // 每个旋臂的粒子数，默认 1500
  coreSize: number;           // 核心大小，默认 20
  rotationSpeed: number;      // 旋转速度，默认 0.0001
}
```

## 组件说明

### StarField 星空组件
- 负责创建和管理星空中的星星粒子系统
- 支持星星闪烁动画效果
- 可配置星星数量、大小、颜色等属性

### Galaxy 银河系组件
- 创建银河系核心和旋臂结构
- 支持多旋臂配置和颜色渐变
- 具有旋转动画效果

### SceneManager 场景管理器
- 统一管理整个3D场景
- 处理渲染循环和动画更新
- 管理相机、控制器和光照

## 性能优化

- 使用 BufferGeometry 提高渲染性能
- 合理的粒子数量配置
- 优化的动画循环
- 响应式的像素比设置
- 资源释放和内存管理

## 浏览器兼容性

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 开发指南

### 添加新的粒子效果

1. 在 `src/components/` 目录下创建新组件
2. 实现 `ParticleSystem` 接口
3. 在 `SceneManager` 中注册和管理

### 修改配置

在 `src/utils/config.ts` 中修改默认配置值

### 自定义样式

在 `src/styles/main.css` 中修改CSS变量

## 许可证

MIT License

## 作者

约翰 - 高级程序员

---

*为了我13岁的女儿，我会用心编写每一行代码。*
