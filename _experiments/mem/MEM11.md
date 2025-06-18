# MEM11: 完整外部访问配置技术记忆

## 完整外部访问架构记忆

### Cloudflare Tunnel双服务配置模式
```powershell
# 后端Tunnel配置
cloudflared tunnel --url http://localhost:3003
# 生成: https://donna-zen-eve-nuts.trycloudflare.com

# 前端Tunnel配置  
cloudflared tunnel --url http://localhost:3000
# 生成: https://weapon-mayor-notified-history.trycloudflare.com
```

### 环境变量配置最佳实践
```powershell
# 设置外部后端URL
$env:VITE_API_URL="https://donna-zen-eve-nuts.trycloudflare.com"

# 清除外部配置（回到本地开发）
Remove-Item Env:VITE_API_URL

# 重启前端服务使配置生效
pnpm dev
```

### API智能检测机制记忆
```typescript
// 环境变量优先级配置
const EXTERNAL_API_URL = process.env.VITE_API_URL || null
let API_BASE_URL = EXTERNAL_API_URL || 'http://localhost:3003/api'

// 智能检测流程
async function detectBackendPort() {
  // 1. 优先测试外部URL（如果配置了）
  if (EXTERNAL_API_URL) {
    try {
      const response = await fetch(`${EXTERNAL_API_URL}/stats`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 外部URL更长超时
      })
      if (response.ok) {
        API_BASE_URL = EXTERNAL_API_URL
        return -1 // 特殊值表示使用外部URL
      }
    } catch (error) {
      console.log('❌ 外部API URL不可用:', error.message)
    }
  }
  
  // 2. 回退到本地端口检测
  for (const port of POSSIBLE_PORTS) {
    // 本地端口检测逻辑...
  }
}
```

## 外部访问部署流程记忆

### 完整部署步骤
```powershell
# 1. 启动本地服务
pnpm dev                    # 前端服务 (3000端口)
node src/server/dataServer.js  # 后端服务 (3003端口)

# 2. 创建后端外部访问
cloudflared tunnel --url http://localhost:3003
# 记录生成的URL: https://xxx.trycloudflare.com

# 3. 配置前端使用外部后端
$env:VITE_API_URL="https://xxx.trycloudflare.com"

# 4. 重启前端服务
# 停止当前前端服务
taskkill /PID <前端进程ID> /F
# 重新启动
pnpm dev

# 5. 创建前端外部访问
cloudflared tunnel --url http://localhost:3000
# 记录生成的URL: https://yyy.trycloudflare.com
```

### 服务状态检查命令
```powershell
# 检查端口占用
netstat -ano | findstr ":3000\|:3003"

# 检查进程
tasklist | findstr node

# 测试API连接
Invoke-WebRequest -Uri "http://localhost:3003/api/stats" -Method GET
Invoke-WebRequest -Uri "https://外部URL/api/stats" -Method GET
```

## 环境配置管理记忆

### 开发环境配置
```powershell
# 清除外部配置
Remove-Item Env:VITE_API_URL -ErrorAction SilentlyContinue

# 启动本地开发
pnpm dev

# 验证本地配置
# 前端会自动检测本地3003端口
```

### 外部访问环境配置
```powershell
# 设置外部后端URL
$env:VITE_API_URL="https://后端tunnel地址.trycloudflare.com"

# 启动前端（会使用外部后端）
pnpm dev

# 创建前端外部访问
cloudflared tunnel --url http://localhost:3000
```

### 混合环境配置
```powershell
# 本地前端 + 外部后端
$env:VITE_API_URL="https://外部后端.trycloudflare.com"
pnpm dev
# 访问: http://localhost:3000

# 外部前端 + 本地后端
Remove-Item Env:VITE_API_URL
pnpm dev
cloudflared tunnel --url http://localhost:3000
# 访问: https://前端tunnel.trycloudflare.com
```

## API配置机制记忆

### 手动配置方法
```typescript
// 运行时动态配置外部API
DataApi.setExternalApiUrl('https://新的外部URL.trycloudflare.com')

// 手动设置本地端口
DataApi.setApiPort(3003)

// 获取当前配置
const currentUrl = DataApi.getCurrentApiUrl()
const detectedPort = DataApi.getDetectedPort()
```

### 配置验证方法
```typescript
// 检查服务器连接
const isOnline = await DataApi.checkConnection()

// 获取服务器状态
const status = await DataApi.getServerStatus()
// 返回: { online: boolean, timestamp?: string, error?: string }
```

### 错误处理模式
```typescript
// API请求自动重试机制
async function apiRequest(endpoint, options) {
  try {
    // 1. 尝试当前配置的URL
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
    
    if (!response.ok && (response.status === 0 || response.status >= 500)) {
      // 2. 连接失败，重新检测端口
      const newPort = await detectBackendPort()
      if (newPort && newPort !== detectedPort) {
        // 3. 用新配置重试
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, options)
        // 处理重试结果...
      }
    }
  } catch (error) {
    // 4. 错误处理和日志记录
    console.error(`API请求失败 [${endpoint}]:`, error)
    throw error
  }
}
```

## Cloudflare Tunnel管理记忆

### Tunnel生命周期管理
```powershell
# 启动Tunnel
cloudflared tunnel --url http://localhost:PORT

# 监控Tunnel状态
# 查看控制台输出中的连接状态信息
# 注意: "Registered tunnel connection" 表示连接成功

# 停止Tunnel
# Ctrl+C 或关闭命令行窗口

# 重启Tunnel
# 重新运行启动命令，会生成新的URL
```

### Tunnel URL管理
```
URL格式: https://随机名称.trycloudflare.com
特点:
- 每次启动生成新的随机URL
- URL在Tunnel运行期间保持有效
- 停止Tunnel后URL失效
- 重启Tunnel会生成新URL
```

### Tunnel监控要点
```
关键日志信息:
✅ "Your quick Tunnel has been created! Visit it at: https://xxx.trycloudflare.com"
✅ "Registered tunnel connection"
❌ "Connection failed" 或类似错误信息

性能监控:
- 响应时间: 通常比本地访问慢100-500ms
- 稳定性: 依赖网络连接质量
- 限制: 免费Tunnel有使用限制
```

## 故障排除记忆

### 常见问题和解决方案
```powershell
# 问题1: 环境变量不生效
# 解决: 重启前端服务
taskkill /PID <前端PID> /F
pnpm dev

# 问题2: Tunnel连接失败
# 解决: 检查本地服务是否运行
netstat -ano | findstr ":3000\|:3003"

# 问题3: API请求失败
# 解决: 验证URL和端点
Invoke-WebRequest -Uri "https://tunnel-url/api/stats" -Method GET

# 问题4: CORS错误
# 解决: 检查后端CORS配置
# 后端已配置: app.use(cors())
```

### 调试检查清单
```
□ 本地前端服务运行正常 (3000端口)
□ 本地后端服务运行正常 (3003端口)
□ 后端API端点可访问 (/api/stats)
□ 环境变量VITE_API_URL设置正确
□ 前端服务重启以应用环境变量
□ Cloudflare Tunnel创建成功
□ 外部URL可以访问
□ API请求返回正确数据
```

### 性能优化记忆
```typescript
// 外部访问超时配置
const timeoutConfig = {
  external: 5000,  // 外部URL使用5秒超时
  local: 2000      // 本地端口使用2秒超时
}

// 缓存策略
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存
// 外部访问时适当延长缓存时间减少请求

// 错误重试策略
const retryConfig = {
  maxRetries: 2,
  retryDelay: 1000,
  exponentialBackoff: true
}
```

## 项目管理流程记忆

### 实验记录更新流程
```
每次重要工作完成后:
1. 创建EXP文件记录技术实现细节
2. 创建SUM文件总结工作成果
3. 创建MEM文件记录技术要点
4. 更新arc.md项目架构文档
```

### 任务交接要点
```
交接信息包含:
- 当前外部访问URL (前端+后端)
- 环境变量配置状态
- 服务运行状态
- 待验证功能列表
- 下一步优先任务
```

### 成功模式复用
```
外部访问配置模式:
1. 本地服务 → Cloudflare Tunnel → 外部URL
2. 环境变量 → 自动检测 → 智能切换
3. 错误处理 → 自动重试 → 降级策略
4. 文档记录 → 经验总结 → 模式复用
```

这次的完整外部访问配置实现是项目基础设施的重要突破，建立了稳定可靠的外部访问架构，为后续所有功能开发和用户体验提升提供了坚实的技术基础。
