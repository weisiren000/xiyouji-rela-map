# 项目想法

## 技术栈 _选择项_
    1. Three.js
    2. React + Vite + Zustand(状态管理) / React + Three.js + (数据处理库)
        - 需要有 src/ 目录用来集中存放源代码
        - 创建 components/3d/ 用来存储 Three.js 组件
    3. Python （待定项）
        - FastAPI / Flask 
        - 数据库：Redis / SQLite / PostgreSQL
    4. 包管理器：
        - 前端：npm / pnpm / bun （挑选项）
        - 后端：uv / pip （待定项）
    5. 数据处理
        - NLP工具选择： DeepSeek （通过DeepSeek等大模型对数据进行处理，输出指定格式的模型）
    6. 其他备选方案
        - Html5 + Three.js + WebGL（挑选项）
---
## 前端核心 _确定版本_
    1. 框架：React（框架） + Vite（构建工具）
    2. 3D引擎：Three.js + @react-three/fiber（渲染引擎）
    3. 状态管理：Zustand（状态管理）
    4. 包管理：pnpm（包管理器）
    5. 类型检查：TypeScript

## 功能
    1. 前端留一个接口用来自定义调节color、shape、size等
    2. 定义渲染风格,预设制作不同的Shader Material


## 后端核心
    1. 阶段一：静态JSON数据 + GitHub Pages
    2. 阶段二：Node.js + Express (如果需要API)
    3. 阶段三：Python FastAPI

## 数据处理
    1. 阶段一：研发NLP工具，方便解决JSON格式数据 （基于AI的）

## 项目目标
### 主要目标 _主线_
    1. 处理当前的西游记数据
    2. 实现西游记可视化

### 次要目标 （先实现主要目标后续拓展实现）
    1. 创建一个基于 Three.js 的 3D 可视化平台 
    2. 支持用户上传数据并进行可视化 
    3. 提供数据处理和分析功能 
    4. 支持多种数据格式和类型 
    5. 提供友好的用户界面和交互体验 
     
## 项目可视化表现（基于西游记关系数据）_选择性主线_
    1. 3D星空
    2. 银河系旋臂
    3. 渲染风格定义 （待挑选渲染风格）
    4. 想法一：
       1. 现在有一个想法是刚开始进入的界面是一个银河系旋臂的效果，以一个中心向外扩散，然后角色、物品...等点可以点击进入然后进入另一个局部视图效果展示阶段
       2. 可以分为九重天，刚好 "水金地火木土天海" + "太阳" 刚好八个,其实角色可以分成八圈

## 项目规划
    1. 功能模块区分，区分好不同的模块，主动分离模块，避免单个代码文件冗长
    2. 区分好前后端目录文件
        - src/backend
        - src/frontend
    3. 组件化思维，不管是前端项目还是后端项目都需要有良好的组件化思维
    4. 命名可读性，文件名、文件夹名、变量名、函数名、类名等都要有意义

## 数据用法
    1. web可以上传或者读取json数据加载节点
    2. 需要使得程序能够处理指定格式得json数据然后进行可视化

## MVP计划
### 必须实现（MVP）
- 西游记核心角色可视化
- 基础3D交互
- 角色信息展示

### 计划阶段一
    1. 搭建React + Vite + Three.js项目
    2. 实现基本的3D场景渲染
    3. 显示10个核心角色节点
    4. 基础鼠标控制（旋转、缩放）
### 计划阶段二
    1. 整理五十个角色关系数据
    2. 实现基于关系的节点连线显示
    3. 添加节点点击信息面板
    4. 简单的筛选功能
### 计划阶段三
    1. 节点分类着色
    2. 关系类型区分（视图/敌对/友好/...）
    3. 搜索功能
    4. 响应式布局

### 项目架构图
```
xyj-visualization/
├── public/                  # 静态资源
│   ├── data/                # 示例JSON数据集
│   │   └── xyj-characters.json
│   └── shaders/             # 公共着色器文件
│       ├── galaxy.frag
│       └── galaxy.vert
│
├── src/
│   ├── backend/             # 后端服务
│   │   ├── data-processor/  # 数据处理模块
│   │   │   ├── nlp-tool/    # NLP处理工具
│   │   │   └── adapters/    # 数据格式适配器
│   │   └── server/          # 服务端入口
│   │       └── index.ts     # Express/FastAPI 入口
│   │
│   ├── frontend/
│   │   ├── assets/          # 静态资源
│   │   │   └── textures/    # 3D纹理素材
│   │   │
│   │   ├── components/      # 可复用组件
│   │   │   ├── ui/          # UI组件
│   │   │   │   ├── ControlPanel.tsx
│   │   │   │   ├── InfoCard.tsx
│   │   │   │   └── SearchBar.tsx
│   │   │   │
│   │   │   └── three/       # Three.js组件
│   │   │       ├── nodes/
│   │   │       │   ├── CharacterNode.tsx
│   │   │       │   └── CelestialBody.tsx
│   │   │       ├── effects/
│   │   │       │   ├── StarField.tsx
│   │   │       │   └── GalaxyArms.tsx
│   │   │       ├── materials/
│   │   │       │   ├── CustomShaderMaterial.tsx
│   │   │       │   └── materialPresets.ts
│   │   │       └── utils/
│   │   │           ├── ThreeUtils.ts
│   │   │           └── OrbitControls.tsx
│   │   │
│   │   ├── scenes/          # 3D场景组件
│   │   │   ├── GalaxyScene.tsx      # 银河系主场景
│   │   │   ├── CelestialScene.tsx   # 九重天场景
│   │   │   └── CharacterScene.tsx   # 角色关系场景
│   │   │
│   │   ├── stores/          # Zustand状态管理
│   │   │   ├── useVisualizationStore.ts
│   │   │   ├── useCharacterStore.ts
│   │   │   └── useShaderStore.ts
│   │   │
│   │   ├── types/           # TypeScript类型定义
│   │   │   ├── character.d.ts
│   │   │   ├── scene.d.ts
│   │   │   └── shader.d.ts
│   │   │
│   │   ├── utils/           # 工具函数
│   │   │   ├── dataParser.ts
│   │   │   ├── colorUtils.ts
│   │   │   └── layoutCalculators.ts
│   │   │
│   │   ├── hooks/           # 自定义Hook
│   │   │   ├── useThreeSetup.ts
│   │   │   ├── useDataLoader.ts
│   │   │   └── useCelestialLayout.ts
│   │   │
│   │   ├── App.tsx          # 主应用组件
│   │   └── main.tsx         # 应用入口
│   │
│   └── shared/              # 前后端共享代码
│       ├── types/           # 共享类型定义
│       └── constants/       # 共享常量
│           └── celestialConstants.ts
│
├── .eslintrc                # ESLint配置
├── .prettierrc              # Prettier配置
├── tsconfig.json            # TypeScript配置
├── vite.config.ts           # Vite配置
├── package.json
└── README.md
```