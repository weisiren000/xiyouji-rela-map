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
6. **修复角色球体发光颜色问题** (EXP121) ✅
   - 实现基于category的颜色映射
   - 复制dataServer.js颜色定义到前端
   - 支持新旧数据结构兼容
   - 实现金色发光效果 (临时方案)
   - 确认Three.js InstancedMesh技术限制
7. **实施多InstancedMesh颜色分组方案** (EXP122) ✅
   - 突破Three.js instanceColor技术限制
   - 实现基于角色类型的多颜色渲染
   - 按颜色分组创建独立InstancedMesh
   - 保持高性能和动画效果
   - 支持9种角色类型颜色映射

## 最新技术改进
- **多颜色渲染**: 实现protagonist(金色)、deity(天蓝色)、demon(红色)等9种颜色
- **架构重构**: 采用多InstancedMesh分组方案，避免instanceColor技术障碍
- **性能优化**: 保持InstancedMesh高性能，支持482个角色球体同时渲染
- **代码清理**: 移除旧的instanceColor代码，简化组件架构
- **兼容性**: 支持新旧JSON数据结构，确保数据访问稳定性

## 颜色映射系统
```
protagonist: #FFD700 (金色) - 主角团队 (孙悟空、唐僧等)
deity: #87CEEB (天蓝色) - 神仙 (观音菩萨、如来佛祖等)
demon: #FF6347 (红色) - 妖魔 (牛魔王、白骨精等)
dragon: #00CED1 (青色) - 龙族 (四海龙王等)
buddhist: #DDA0DD (紫色) - 佛教人物
celestial: #F0E68C (卡其色) - 天庭人物
underworld: #696969 (灰色) - 地府人物
human: #FFA500 (橙色) - 人类角色
alias: #CCCCCC (银色) - 别名角色
```

## 下一步计划
1. **视觉效果验证** (立即)
   - 确认不同角色类型的颜色显示效果
   - 验证发光强度和材质配置
   - 检查动画和控制面板功能
2. **交互功能恢复** (高优先级)
   - 重新实现多InstancedMesh的鼠标检测
   - 恢复悬浮高亮和信息卡片功能
   - 适配新的分组渲染架构
3. 进行法宝数据验证和优化
4. 增强角色详情交互功能
5. 优化多组渲染性能监控
6. 扩展事件和地点数据
7. 实现关系图谱的动态过滤和查询

## 当前工作交接状态 (2025-06-18)
- ✅ **多颜色分组渲染已实现** - 基于角色类型的9种颜色映射
- ✅ 代码重构和架构优化完成
- 🔄 等待视觉效果验证 (浏览器测试)
- 🔄 交互功能需要重新实现 (适配多InstancedMesh)
- 🛠️ 开发环境就绪: http://localhost:3005/
- 📊 支持482个角色球体 (150角色 + 332别名)