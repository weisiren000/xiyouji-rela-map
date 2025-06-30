# 🚀 部署指南

## 快速部署

### 1. 本地部署
```bash
# 克隆项目
git clone https://github.com/weisiren000/xiyouji-rela-map.git
cd xiyouji-rela-map-backend

# 安装依赖
npm install

# 启动服务
npm start
```

访问地址：
- API文档: http://localhost:3003
- API接口: http://localhost:3003/api/*

### 2. 生产环境部署

#### Railway 部署
1. 连接GitHub仓库到Railway
2. 设置启动命令: `npm start`
3. 确保数据库文件在 `data/` 目录中
4. 部署完成后，访问分配的域名即可查看API文档

#### Render 部署
1. 连接GitHub仓库到Render
2. 设置构建命令: `npm install`
3. 设置启动命令: `npm start`
4. 确保数据库文件包含在仓库中

#### Vercel 部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

## 📁 项目结构

```
xiyouji-rela-map-backend/
├── data/                    # SQLite数据库文件
│   ├── characters.db       # 角色数据库
│   └── events.db          # 事件数据库
├── public/                 # 静态文件（API文档）
│   └── index.html         # API文档页面
├── dataServer.js          # 主服务器文件
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 🔧 配置说明

### 环境变量
- `PORT`: 服务器端口（默认3003）

### 数据库配置
- 数据库文件位于 `data/` 目录
- 使用SQLite，无需额外配置
- 支持并发读取

## 📡 API文档访问

部署完成后，访问以下地址：
- 根路径: `https://your-domain.com` → 自动跳转到API文档
- API文档: `https://your-domain.com/index.html`
- API接口: `https://your-domain.com/api/*`

## 🔍 测试部署

部署完成后，可以通过以下方式测试：

```bash
# 测试API文档页面
curl https://your-domain.com

# 测试API接口
curl https://your-domain.com/api/stats

# 测试角色数据
curl https://your-domain.com/api/characters
```

## 📝 注意事项

1. **数据库文件**: 确保 `data/` 目录中的数据库文件包含在部署包中
2. **静态文件**: `public/` 目录中的API文档会自动提供服务
3. **CORS**: 已启用跨域支持，可以被前端应用调用
4. **缓存**: API响应包含5分钟缓存，提高性能
5. **错误处理**: 所有API都有统一的错误响应格式

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `data/` 目录是否存在
   - 确认数据库文件路径正确

2. **端口占用**
   - 修改 `PORT` 环境变量
   - 或杀掉占用端口的进程

3. **API文档无法访问**
   - 确认 `public/index.html` 文件存在
   - 检查静态文件服务是否正常

### 日志查看
服务器启动时会显示详细的状态信息：
- 数据库连接状态
- 数据统计信息
- 服务地址和端口
- 功能特性说明
