# 神经网络可视化 - Neural Network Visualization

现代化的交互式3D神经网络可视化项目，使用TypeScript + Three.js构建。

## ✨ 特性

- 🧠 **多种网络形态**: 量子皮层、超维网格、神经漩涡、突触云
- 🎨 **动态主题**: 4种精美的颜色主题，实时切换
- ⚡ **交互式脉冲**: 点击创建能量脉冲，观察传播效果
- 🎮 **流畅控制**: 鼠标拖拽旋转视角，滚轮缩放
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🚀 **高性能**: 优化的渲染管线，支持数千个节点
- 🎭 **后处理效果**: 辉光、胶片效果等视觉增强

## 🛠️ 技术栈

- **TypeScript** - 类型安全的JavaScript
- **Three.js** - 3D图形渲染引擎
- **Vite** - 快速的构建工具
- **WebGL** - 硬件加速的图形渲染
- **CSS3** - 现代样式和动画

## 📁 项目结构

```
src/
├── components/          # UI组件
├── core/               # 核心3D引擎
│   ├── NetworkNode.ts      # 网络节点类
│   ├── PulseManager.ts     # 脉冲管理器
│   └── NeuralNetworkApp.ts # 主应用类
├── shaders/            # 着色器文件
│   ├── noise.ts           # 噪声函数
│   ├── nodeShader.ts      # 节点着色器
│   └── connectionShader.ts # 连接线着色器
├── types/              # TypeScript类型定义
├── utils/              # 工具函数和常量
└── styles/             # 样式文件
```

## 🚀 快速开始

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🎮 使用说明

### 基础交互

- **鼠标左键拖拽**: 旋转视角
- **鼠标滚轮**: 缩放视图
- **点击空白处**: 创建能量脉冲
- **双击**: 重置相机位置

### 控制面板

- **主题选择**: 点击颜色按钮切换视觉主题
- **密度控制**: 拖拽滑块调整网络密度
- **形态按钮**: 切换不同的网络结构
- **暂停/播放**: 控制动画播放
- **重置相机**: 恢复初始视角

### 网络形态

1. **量子皮层** - 放射状的多层网络结构
2. **超维网格** - 四维空间投影的网格结构
3. **神经漩涡** - 螺旋状的动态网络
4. **突触云** - 集群化的云状网络

## 🎨 自定义主题

项目支持自定义颜色主题，在 `src/utils/constants.ts` 中修改 `COLOR_PALETTES` 数组：

```typescript
export const COLOR_PALETTES: ColorPalette[] = [
  // 添加你的自定义颜色
  [
    new THREE.Color(0xFF0000), // 红色
    new THREE.Color(0x00FF00), // 绿色
    new THREE.Color(0x0000FF), // 蓝色
    // ... 更多颜色
  ],
]
```

## ⚡ 性能优化

- **LOD系统**: 根据距离自动调整细节层次
- **实例化渲染**: 高效渲染大量相似对象
- **着色器优化**: GPU加速的粒子系统
- **内存管理**: 自动清理不需要的资源
- **帧率监控**: 实时性能监控和自动降级

## 🔧 开发指南

### 添加新的网络形态

1. 在 `src/types/index.ts` 中添加新的枚举值
2. 在 `src/core/NetworkGenerator.ts` 中实现生成函数
3. 在 `src/utils/constants.ts` 中添加名称映射

### 自定义着色器

着色器文件位于 `src/shaders/` 目录，支持：
- 顶点着色器自定义
- 片段着色器效果
- 制服变量传递
- 噪声函数库

### 添加UI组件

在 `src/components/` 目录中创建新的UI组件，支持：
- TypeScript类型检查
- 模块化设计
- 事件系统集成

## 📊 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

需要支持WebGL 2.0的现代浏览器。

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

**约翰** - 高级程序员

## 🙏 致谢

- [Three.js](https://threejs.org/) - 强大的3D图形库
- [Vite](https://vitejs.dev/) - 快速的构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
