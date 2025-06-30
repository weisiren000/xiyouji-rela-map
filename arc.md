# 📁 项目架构文档

## 项目结构树

```
xiyouji-rela-map-backend/
├── 📁 data/                    # 数据库文件目录
│   ├── 🗄️ characters.db       # 角色数据库 (482个角色)
│   ├── 🗄️ events.db          # 事件数据库 (81难)
│   ├── 📁 backup/            # 数据备份目录
│   └── 📁 migration-logs/    # 迁移日志
├── 📁 public/                 # 静态文件目录
│   └── 📄 index.html         # API文档界面
├── 📁 node_modules/          # 依赖包目录
├── 🚀 dataServer.js          # 主服务器文件
├── 🔧 current-server.js      # 当前服务器实例
├── 🧪 test.js               # API测试脚本
├── 📦 package.json          # 项目配置文件
├── 📖 README.md            # 项目说明文档
├── 🚀 DEPLOYMENT.md        # 部署指南
└── 📄 LICENSE              # 许可证文件
```

## 核心文件说明

### 🚀 dataServer.js
- **功能**: Express.js服务器主文件
- **端口**: 3003
- **特性**:
  - SQLite数据库连接
  - RESTful API接口
  - 静态文件服务
  - CORS跨域支持
  - 数据缓存机制

### 📄 public/index.html
- **功能**: API文档界面
- **特性**:
  - 响应式设计
  - 完整API说明
  - 调用示例
  - 美观的UI界面

### 🗄️ 数据库文件
- **characters.db**: 482个角色数据
- **events.db**: 81难事件数据
- **格式**: SQLite数据库

## API接口架构

### 🎭 角色相关接口
- `GET /api/characters` - 获取所有角色
- `GET /api/aliases` - 获取所有别名
- `GET /api/characters/search` - 搜索角色

### 📚 事件相关接口
- `GET /api/events` - 获取所有81难事件
- `GET /api/events/{nanci}` - 获取单个事件
- `GET /api/events/search` - 搜索事件

### 📊 数据统计接口
- `GET /api/stats` - 获取数据统计
- `GET /api/data/complete` - 获取完整数据集

### 🔄 缓存管理接口
- `POST /api/cache/refresh` - 刷新缓存

## 技术栈

### 后端技术
- **运行时**: Node.js 18+
- **框架**: Express.js 4.18.2
- **数据库**: SQLite (better-sqlite3)
- **跨域**: CORS 2.8.5

### 前端技术（API文档）
- **HTML5**: 语义化标签
- **CSS3**: 响应式设计、渐变背景
- **JavaScript**: 原生JS，无框架依赖

## 部署架构

### 开发环境
- **地址**: http://localhost:3003
- **数据库**: 本地SQLite文件
- **热重载**: nodemon支持

### 生产环境
- **平台**: Railway/Render/Vercel
- **数据库**: 随项目部署的SQLite文件
- **域名**: 平台分配或自定义域名

## 数据流架构

```
客户端请求 → Express路由 → 数据库查询 → 数据转换 → JSON响应
     ↓
API文档界面 ← 静态文件服务 ← public目录
```

## 缓存策略

- **缓存时间**: 5分钟
- **缓存对象**: 角色数据、别名数据、事件数据
- **缓存刷新**: 手动刷新接口或超时自动刷新

## 错误处理

- **统一格式**: JSON错误响应
- **状态码**: 标准HTTP状态码
- **日志记录**: 控制台输出详细错误信息

## 性能优化

- **数据缓存**: 减少数据库查询
- **静态文件**: Express静态文件服务
- **数据库**: SQLite并发读取优化
- **响应压缩**: 自动JSON压缩
