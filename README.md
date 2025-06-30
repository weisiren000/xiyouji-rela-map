# 西游记关系图谱 - 前端3D可视化界面

这是西游记角色关系3D可视化项目的前端界面，基于React + Three.js构建的沉浸式3D可视化平台。通过银河系风格的3D场景展示西游记中的角色关系和故事情节，包含角色星谱、八十一难银河星谱、角色星图和角色关系图谱等可视化模块。

> **注意**: 这是前端仓库，需要配合[后端API服务](https://github.com/weisiren/xiyouji-rela-map-backend)使用。

## 🌟 项目特色

### 🎨 3D 可视化
- **银河系场景**: 使用密度函数和引力场算法生成逼真的银河系效果
- **角色球体**: 482个角色以发光球体形式分布在3D空间中
- **智能布局**: 基于角色类型和关系的智能空间分布
- **动态特效**: 实时粒子系统和光影效果

### 🎭 角色系统
- **多类型角色**: 主角、神仙、妖魔、龙族等9种角色类型
- **智能检测**: 自动检测和加载角色3D模型
- **特效渲染**: 线框和点特效的高级Shader渲染
- **交互体验**: 点击角色进入局部详情视图

### 📊 数据管理
- **SQLite数据库**: 高性能数据存储，支持482条角色记录
- **实时搜索**: 支持名称、别名、势力等多维度搜索
- **数据可视化**: 角色统计和关系分析
- **批量操作**: 数据导入导出和批量编辑

### 🎛️ 调试工具
- **实时GUI**: 专业的参数调试面板
- **性能监控**: 实时FPS和性能指标显示
- **模型库**: 快速访问已加载的3D模型
- **预设管理**: 保存和加载调试配置

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+
- 现代浏览器（支持WebGL 2.0）

### 安装运行
```bash
# 克隆项目
git clone https://github.com/weisiren000/xiyou-starmap.git
cd xiyou-starmap

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问应用
# 浏览器打开 http://localhost:3001
```

### 项目结构
```
xiyou-starmap/
├── src/
│   ├── components/          # React组件
│   │   ├── controls/        # 控制面板组件
│   │   ├── panels/          # 信息面板组件
│   │   ├── views/           # 视图组件
│   │   ├── dashboard/       # 仪表盘组件
│   │   └── three/           # 3D组件
│   ├── stores/              # 状态管理
│   ├── hooks/               # 自定义Hooks
│   ├── utils/               # 工具函数
│   └── server/              # 后端服务
├── public/
│   ├── models/              # 3D模型文件
│   └── data/                # 数据文件
├── data/                    # SQLite数据库
├── scripts/                 # 构建脚本
└── docs/                    # 文档
```

## 🎮 使用指南

### 基础操作
- **鼠标拖拽**: 旋转视角
- **鼠标滚轮**: 缩放视图
- **右键拖拽**: 平移视图
- **点击角色**: 进入局部详情视图

### 界面布局
- **左上角**: 🎭 模型库 - 快速访问已加载模型
- **中上角**: 🌌 主页面 / ⭐ 空银河系 - 页面切换
- **右上角**: 🎛️ 模型特效调试 - 参数调试面板
- **左下角**: 📊 数据管理 - 数据查看和管理

### 高级功能
- **模型特效**: 在局部视图中调试3D模型的线框和点特效
- **性能优化**: 根据设备性能自动调整渲染质量
- **数据搜索**: 支持复杂的多条件搜索和过滤
- **预设管理**: 保存和分享可视化配置

## 🛠️ 技术栈

### 前端技术
- **React 18**: 现代化的用户界面框架
- **Three.js**: 3D图形渲染引擎
- **@react-three/fiber**: React的Three.js集成
- **@react-three/drei**: Three.js实用工具库
- **TypeScript**: 类型安全的JavaScript
- **Zustand**: 轻量级状态管理
- **Vite**: 快速的构建工具

### 后端技术
- **Node.js**: JavaScript运行时
- **Express**: Web应用框架
- **SQLite**: 轻量级数据库
- **better-sqlite3**: 高性能SQLite驱动

### 开发工具
- **pnpm**: 高效的包管理器
- **ESLint**: 代码质量检查
- **lil-gui**: 调试界面库
- **three-mesh-bvh**: 3D碰撞检测优化

## 📈 性能特性

### 渲染优化
- **InstancedMesh**: 批量渲染优化
- **BVH加速**: 碰撞检测性能提升
- **LOD系统**: 距离级别细节优化
- **Frustum Culling**: 视锥体剔除

### 数据优化
- **SQLite**: 比JSON文件性能提升14倍
- **索引优化**: 快速搜索和查询
- **缓存机制**: 减少重复计算
- **懒加载**: 按需加载资源

## 🎯 版本历史

- **v1.2.1** (2025-06-24): UI布局优化与模型特效调试修复
- **v1.2.0** (2025-06): 模型系统和特效渲染
- **v1.1.1** (2025-06): 数据库优化和性能提升
- **v1.1.0** (2025-06): SQLite数据库集成
- **v1.0.1** (2025-06): 基础功能完善
- **v1.0.0** (2025-06): 项目初始版本

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 开发流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 编写清晰的提交信息
- 添加必要的测试和文档

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 👨‍💻 作者

**weisiren** - [GitHub](https://github.com/weisiren000)

## 🙏 致谢

- 感谢 Three.js 社区提供的优秀3D渲染引擎
- 感谢 React 团队的现代化前端框架
- 感谢所有贡献者和用户的支持

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/weisiren000/xiyou-starmap/issues)
- 发起 [Discussion](https://github.com/weisiren000/xiyou-starmap/discussions)

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
