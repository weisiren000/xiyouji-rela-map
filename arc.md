# 西游记关系图谱 - 项目结构

## 项目概述
本项目旨在构建《西游记》小说中角色、事件、地点和物品之间的关系图谱，并通过3D星空图的方式进行可视化展示。

## 目录结构

```
xiyouji-rela-map/
├── _experiments/          # 实验记录和总结
│   ├── exp/               # 经验记录
│   ├── mem/               # 记忆文件
│   └── sum/               # 对话总结
├── src/                   # 源代码目录
│   ├── components/        # 组件
│   │   ├── dashboard/     # 数据仪表盘组件
│   │   ├── three/         # Three.js 3D渲染组件
│   │   └── ui/            # 用户界面组件
│   ├── hooks/             # React Hooks
│   ├── scenes/            # 场景组件
│   ├── server/            # 后端服务
│   ├── services/          # 服务层
│   ├── stores/            # 状态管理
│   ├── types/             # 类型定义
│   └── utils/             # 工具函数
├── data/                  # 数据文件
│   └── examples/          # 示例数据
├── docs/                  # 文档
│   ├── api.md             # API文档
│   ├── data/              # 数据相关文档
│   │   ├── JSON/          # JSON数据文件
│   │   │   ├── artifact/  # 法宝数据 (67个文件)
│   │   │   ├── character/ # 角色数据
│   │   │   └── event/     # 事件数据
│   │   ├── dict/          # 字典定义
│   │   └── _JSON_Schema/  # JSON Schema定义
│   └── implementation/    # 实现相关文档
├── reference/             # 参考资料
│   ├── rebuild/           # 重建参考
│   └── refer/             # 其他参考
├── scripts/               # 脚本工具
└── tools/                 # 工具程序
    ├── nlp_tools/         # 自然语言处理工具
    └── updata_tools/      # 数据更新工具
```

## 核心组件

### 前端
- **App.tsx**: 应用入口
- **GalaxyScene.tsx**: 3D星空场景
- **CharacterMapper.tsx**: 角色映射组件
- **CharacterDetailScene.tsx**: 角色详情场景
- **CharacterControlPanel.tsx**: 角色控制面板
- **CharacterDataPanel.tsx**: 角色数据面板

### 数据
- **dataApi.ts**: 数据API服务
- **dataLoader.ts**: 数据加载器
- **useDataStore.ts**: 数据状态管理
- **useCharacterInfoStore.ts**: 角色信息状态管理
- **useGalaxyStore.ts**: 星空状态管理

### 服务
- **dataServer.js**: 数据服务器

## 数据结构

### 主要数据类型
- **角色(Character)**: 西游记中的人物
- **事件(Event)**: 西游记中的重要事件
- **法宝(Artifact)**: 西游记中的法宝和物品
- **地点(Location)**: 西游记中的地点

### 数据关系
- 角色-角色: 表示角色间的关系(师徒、朋友、敌人等)
- 角色-事件: 表示角色参与的事件
- 角色-法宝: 表示角色拥有或使用的法宝
- 角色-地点: 表示角色与地点的关联

## 当前进展
1. 完成基础3D星空可视化框架
2. 实现角色数据加载和展示
3. 构建部分角色关系图谱
4. 完成数据仪表盘基础功能
5. 完成法宝数据重建工作(100%, 67/67个文件)

## 下一步计划
1. 进行法宝数据验证和优化
2. 增强角色详情交互功能
3. 优化3D渲染性能
4. 扩展事件和地点数据
5. 实现关系图谱的动态过滤和查询