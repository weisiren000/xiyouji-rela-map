# 🚀 西游记银河系可视化 - 快速启动指南

## 📋 环境要求

- **Node.js**: 16.0+ 
- **pnpm**: 8.0+ (推荐) 或 npm
- **操作系统**: Windows/macOS/Linux
- **浏览器**: Chrome/Firefox/Edge (支持WebGL)

## ⚡ 快速启动 (推荐)

### 方法1: 一键启动脚本 (最简单)
```bash
# 进入项目目录
cd D:\codee\xiyouji-rela-map

# PowerShell版本 (推荐)
pnpm run start:simple

# 如果PowerShell有问题，使用批处理版本
pnpm run start:simple:bat
```

### 方法2: 手动启动 (更可控)
```bash
# 终端1: 启动后端数据服务器
cd D:\codee\xiyouji-rela-map\src\server
node dataServer.js

# 终端2: 启动前端开发服务器
cd D:\codee\xiyouji-rela-map
pnpm dev
```

### 方法3: 最简单手动启动 (如果脚本都有问题)
```bash
# 1. 确保依赖已安装
pnpm install
cd src/server && npm install && cd ../..

# 2. 启动后端 (保持运行)
cd src/server
node dataServer.js

# 3. 新开一个终端，启动前端
cd D:\codee\xiyouji-rela-map
pnpm dev
```

## 🔧 首次安装

如果是第一次运行项目，需要先安装依赖：

```bash
# 1. 安装前端依赖
pnpm install

# 2. 安装后端依赖
cd src/server
npm install
cd ../..
```

## 🌐 访问地址

启动成功后，在浏览器中访问：
- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:3003

## 📊 启动状态检查

### 成功启动的标志
1. **后端服务器**:
   ```
   🚀 数据服务器启动成功
   📡 监听端口: 3003
   📊 数据统计: 加载了 150 个角色, 332 个别名
   ```

2. **前端开发服务器**:
   ```
   ➜  Local:   http://localhost:3000/
   ➜  Network: use --host to expose
   ```

3. **浏览器应用**:
   - 右上角显示绿色端口状态指示器 ✅
   - 能看到银河系3D可视化场景
   - 鼠标悬浮角色球体有高亮效果

## 🛠️ 启动脚本说明

### 可用的启动命令

```bash
# 基础命令
pnpm dev                     # 只启动前端 (需要手动启动后端)
pnpm run server             # 只启动后端

# 简化启动脚本
pnpm run start:simple        # PowerShell版本 (推荐)
pnpm run start:simple:bat    # 批处理版本 (备用)

# 高级启动脚本
pnpm run start:auto          # PowerShell增强版 (端口检测)
pnpm run start:auto:verbose  # 详细输出版本

# 开发工具
pnpm run build              # 构建生产版本
pnpm run preview            # 预览生产版本
pnpm run lint               # 代码检查
```

### 推荐启动流程

1. **日常开发**: 使用 `pnpm run start:simple`
2. **调试问题**: 使用手动启动，观察两个终端的输出
3. **生产部署**: 使用 `pnpm run build` 然后 `pnpm run preview`

## 🔍 故障排除

### 常见问题及解决方案

#### 1. 端口被占用
**现象**: 启动失败，提示端口已被使用
**解决**: 
```bash
# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :3003

# 或者使用不同端口
pnpm dev --port 3001
```

#### 2. 依赖安装失败
**现象**: `pnpm install` 或 `npm install` 报错
**解决**:
```bash
# 清理缓存重新安装
pnpm store prune
rm -rf node_modules
pnpm install

# 或者使用npm
npm cache clean --force
rm -rf node_modules
npm install
```

#### 3. 后端数据加载失败
**现象**: 前端显示"数据加载失败"
**解决**:
```bash
# 检查数据文件是否存在
ls docs/data/JSON/

# 重启后端服务器
cd src/server
node dataServer.js
```

#### 4. 前端白屏或黑屏
**现象**: 浏览器显示空白页面
**解决**:
```bash
# 检查控制台错误
# 按F12打开开发者工具查看Console

# 清理浏览器缓存
# Ctrl+Shift+R 强制刷新

# 检查端口状态指示器
# 右上角应该显示绿色的端口状态
```

#### 5. 鼠标交互不工作
**现象**: 鼠标悬浮没有高亮效果
**解决**:
```bash
# 检查控制台日志
# 应该看到类似信息:
# 🖱️ 绑定鼠标事件到canvas
# 🎯 射线检测命中: ...
# ✅ 悬浮角色: 唐僧

# 如果没有日志，刷新页面重试
```

## 📱 端口自动检测

项目具有智能端口检测功能：
- **自动扫描**: [3003, 3002, 3001, 3000, 8080, 8000]
- **状态显示**: 右上角端口状态指示器
- **手动配置**: 点击状态指示器可手动设置端口

## 🎮 使用说明

### 基本操作
- **鼠标拖拽**: 旋转视角
- **鼠标滚轮**: 缩放场景
- **鼠标悬浮**: 高亮角色，显示信息
- **右键拖拽**: 平移场景

### 控制面板
- **左侧面板**: 银河系参数控制
- **右侧面板**: 角色数据控制
- **底部面板**: 性能监控信息

## 📂 项目结构

```
xiyouji-rela-map/
├── src/
│   ├── components/     # React组件
│   ├── scenes/        # 3D场景
│   ├── hooks/         # 自定义Hook
│   ├── services/      # API服务
│   └── server/        # 后端服务器
├── docs/data/JSON/    # 角色数据文件
├── scripts/           # 启动脚本
└── _experiments/      # 开发记录
```

## 🔗 相关文档

- **端口自动检测**: `README_PORT_AUTO_DETECTION.md`
- **项目架构**: `arc.md`
- **开发记录**: `_experiments/` 目录

## 💡 开发提示

1. **修改代码后**: 前端会自动热重载，后端需要手动重启
2. **数据更新后**: 重启后端服务器加载新数据
3. **性能问题**: 查看右上角端口状态和性能监控
4. **调试信息**: 打开浏览器控制台查看详细日志

## 🎯 快速验证

启动成功后，验证以下功能：
- [ ] 能看到3D银河系场景
- [ ] 右上角端口状态显示绿色
- [ ] 鼠标悬浮角色有高亮效果
- [ ] 控制台有交互日志输出
- [ ] 左右控制面板可以操作

如果以上都正常，说明项目启动成功！🎉

---

**需要帮助？** 查看 `_experiments/` 目录中的详细开发记录，或检查控制台错误信息。
