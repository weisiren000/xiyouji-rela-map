# 西游记关系图谱 - 后端API服务

## 📖 项目简介

这是西游记角色关系3D可视化项目的后端API服务，提供角色数据、事件数据和统计信息的RESTful API接口。

## 🛠️ 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: SQLite (better-sqlite3)
- **跨域**: CORS
- **开发工具**: Nodemon

## 📁 项目结构

```
xiyouji-rela-map-backend/
├── data/                    # 数据库文件
│   ├── characters.db       # 角色数据库
│   ├── events.db          # 事件数据库
│   └── backup/            # 数据备份
├── dataServer.js          # 主服务器文件
├── current-server.js      # 当前服务器实例
├── test.js               # API测试脚本
├── package.json          # 项目配置
└── README.md            # 项目文档
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
# 或
pnpm install
```

### 启动开发服务器
```bash
npm run dev
# 或
pnpm run dev
```

### 启动生产服务器
```bash
npm start
# 或
pnpm start
```

## 📡 API接口

### 基础URL
- 开发环境: `http://localhost:3003/api`
- 生产环境: 根据部署平台而定

### 角色相关接口

#### 获取所有角色
```
GET /api/characters
```

#### 获取所有别名
```
GET /api/aliases
```

#### 获取完整数据
```
GET /api/data/complete
```
返回角色、别名和统计数据的完整集合。

### 事件相关接口

#### 获取所有事件
```
GET /api/events
```

#### 根据ID获取事件
```
GET /api/events?id={eventId}
```

#### 搜索事件
```
GET /api/events?search={keyword}
```

### 统计接口

#### 获取数据统计
```
GET /api/stats
```

## 🗄️ 数据库结构

### characters表
- `id`: 角色ID
- `name`: 角色名称
- `type`: 角色类型（主角、神仙、妖魔等）
- `description`: 角色描述
- `power_level`: 战力等级
- `realm`: 所属境界
- `weapon`: 武器
- `skills`: 技能列表（JSON）
- `relationships`: 关系列表（JSON）
- `appearances`: 出场信息（JSON）

### events表
- `id`: 事件ID
- `title`: 事件标题
- `description`: 事件描述
- `location`: 发生地点
- `characters_involved`: 涉及角色（JSON）
- `difficulty_level`: 难度等级
- `moral_lesson`: 寓意教训
- `sequence_number`: 序号（1-81）

## 🔧 配置说明

### 端口配置
默认端口: `3003`
可通过环境变量 `PORT` 修改

### 数据库配置
- 数据库文件位于 `data/` 目录
- 使用SQLite，支持并发读取
- 自动备份机制

## 🚀 部署指南

### Railway部署
1. 连接GitHub仓库
2. 设置启动命令: `npm start`
3. 配置环境变量（如需要）

### Render部署
1. 连接GitHub仓库
2. 设置构建命令: `npm install`
3. 设置启动命令: `npm start`

### Vercel部署
1. 安装Vercel CLI: `npm i -g vercel`
2. 运行: `vercel`
3. 按提示完成部署

## 🧪 测试

### 运行API测试
```bash
npm test
# 或
node test.js
```

### 手动测试
```bash
# 测试服务器状态
curl http://localhost:3003/api/stats

# 测试角色数据
curl http://localhost:3003/api/characters
```

## 📝 开发说明

### 添加新的API端点
1. 在 `dataServer.js` 中添加路由
2. 实现对应的数据库查询逻辑
3. 添加错误处理和响应格式化
4. 更新API文档

### 数据库维护
- 定期备份数据库文件
- 监控数据库性能
- 必要时进行数据清理和优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [前端仓库](https://github.com/weisiren/xiyouji-rela-map-frontend)
- [项目文档](https://github.com/weisiren/xiyouji-rela-map-frontend/docs)
- [在线演示](https://xiyouji-rela-map.vercel.app)

## 📞 联系方式

- 作者: weisiren
- 邮箱: [你的邮箱]
- GitHub: [@weisiren](https://github.com/weisiren)
