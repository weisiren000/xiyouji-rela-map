# MEM12: 关键Bug修复与故障排除方法论记忆

## Vite环境变量访问最佳实践记忆

### 正确的环境变量访问方式
```typescript
// ✅ Vite项目中的正确方式
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
const mode = import.meta.env.MODE

// 带默认值的安全访问
const externalApiUrl = import.meta.env.VITE_API_URL || null
const debugMode = import.meta.env.VITE_DEBUG === 'true'
```

### 错误的环境变量访问方式
```typescript
// ❌ 这些在浏览器环境中会报错
const apiUrl = process.env.VITE_API_URL // ReferenceError: process is not defined
const nodeEnv = process.env.NODE_ENV    // ReferenceError: process is not defined

// ❌ 常见错误场景
if (process.env.NODE_ENV === 'development') { // 浏览器中会报错
  console.log('开发模式')
}
```

### 环境变量验证和调试
```typescript
// 开发环境下的环境变量调试
if (import.meta.env.DEV) {
  console.log('🔧 当前环境变量:')
  console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL)
  console.log('- MODE:', import.meta.env.MODE)
  console.log('- DEV:', import.meta.env.DEV)
  console.log('- PROD:', import.meta.env.PROD)
}

// 环境变量存在性检查
const requiredEnvVars = ['VITE_API_URL']
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName])
if (missingVars.length > 0) {
  console.warn('⚠️ 缺少环境变量:', missingVars)
}
```

## 系统性故障排除方法论记忆

### 问题诊断优先级顺序
```
1. 浏览器控制台错误 (最高优先级)
   - JavaScript运行时错误
   - 网络请求失败
   - 资源加载失败

2. 网络请求状态
   - API响应状态码
   - 请求超时情况
   - CORS错误

3. 服务运行状态
   - 前端服务是否启动
   - 后端服务是否响应
   - 端口占用情况

4. 配置和环境
   - 环境变量设置
   - 构建配置
   - 依赖版本
```

### 浏览器控制台错误分析
```javascript
// 常见错误类型和解决方案
const errorPatterns = {
  'ReferenceError: process is not defined': {
    cause: '在浏览器环境中使用了Node.js特有的process对象',
    solution: '使用import.meta.env替代process.env'
  },
  
  'TypeError: Cannot read property of undefined': {
    cause: '访问未定义对象的属性',
    solution: '添加可选链操作符或空值检查'
  },
  
  'Failed to fetch': {
    cause: 'API请求失败，可能是网络或CORS问题',
    solution: '检查API服务状态和CORS配置'
  },
  
  'Module not found': {
    cause: '模块导入路径错误或依赖未安装',
    solution: '检查导入路径和package.json依赖'
  }
}
```

### 服务状态检查命令记忆
```powershell
# 检查端口占用
netstat -ano | findstr ":3000\|:3001\|:3003"

# 检查Node.js进程
tasklist | findstr node

# 强制清理Node.js进程
taskkill /F /IM node.exe

# 检查特定端口的进程
netstat -ano | findstr ":3000" | findstr "LISTENING"

# 测试API连接
Invoke-WebRequest -Uri "http://localhost:3003/api/stats" -Method GET
```

## 项目服务管理标准流程记忆

### 完整的服务重启流程
```powershell
# 1. 进入项目目录
cd D:\codee\xiyouji-rela-map

# 2. 清理所有相关进程
taskkill /F /IM node.exe

# 3. 清理环境变量（如果需要）
Remove-Item Env:VITE_API_URL -ErrorAction SilentlyContinue

# 4. 启动后端服务
node src/server/dataServer.js

# 5. 启动前端服务（新终端）
pnpm dev

# 6. 验证服务状态
# 后端: http://localhost:3003/api/stats
# 前端: http://localhost:3000
```

### 服务健康检查
```typescript
// API连接健康检查
async function checkServiceHealth() {
  const checks = [
    {
      name: '后端API',
      url: 'http://localhost:3003/api/stats',
      timeout: 3000
    },
    {
      name: '前端服务',
      url: 'http://localhost:3000',
      timeout: 2000
    }
  ]
  
  for (const check of checks) {
    try {
      const response = await fetch(check.url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(check.timeout)
      })
      console.log(`✅ ${check.name}: 正常 (${response.status})`)
    } catch (error) {
      console.log(`❌ ${check.name}: 异常 (${error.message})`)
    }
  }
}
```

## 错误处理和预防机制记忆

### 环境变量安全访问模式
```typescript
// 安全的环境变量访问工具类
class EnvConfig {
  // 获取必需的环境变量
  static getRequired(key: string): string {
    const value = import.meta.env[key]
    if (!value) {
      throw new Error(`必需的环境变量 ${key} 未设置`)
    }
    return value
  }
  
  // 获取可选的环境变量
  static getOptional(key: string, defaultValue: string = ''): string {
    return import.meta.env[key] || defaultValue
  }
  
  // 获取布尔类型环境变量
  static getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = import.meta.env[key]
    if (value === undefined) return defaultValue
    return value === 'true' || value === '1'
  }
  
  // 验证所有必需的环境变量
  static validateRequired(keys: string[]): void {
    const missing = keys.filter(key => !import.meta.env[key])
    if (missing.length > 0) {
      throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`)
    }
  }
}

// 使用示例
const apiUrl = EnvConfig.getOptional('VITE_API_URL', 'http://localhost:3003/api')
const debugMode = EnvConfig.getBoolean('VITE_DEBUG', false)
EnvConfig.validateRequired(['VITE_APP_TITLE'])
```

### 错误边界和降级策略
```typescript
// API请求错误处理模式
async function safeApiRequest<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(endpoint, options)
    
    if (!response.ok) {
      console.error(`API请求失败: ${response.status} ${response.statusText}`)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('API请求异常:', error)
    return null
  }
}

// 环境变量访问错误处理
function getEnvWithFallback(key: string, fallback: string): string {
  try {
    return import.meta.env[key] || fallback
  } catch (error) {
    console.warn(`环境变量访问失败 ${key}:`, error)
    return fallback
  }
}
```

## 调试技巧和工具记忆

### 浏览器开发者工具使用
```javascript
// 控制台调试技巧
console.group('🔧 环境信息')
console.log('当前URL:', window.location.href)
console.log('用户代理:', navigator.userAgent)
console.log('环境变量:', import.meta.env)
console.groupEnd()

// 网络请求监控
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('🌐 API请求:', args[0])
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('✅ API响应:', response.status, args[0])
      return response
    })
    .catch(error => {
      console.error('❌ API错误:', error, args[0])
      throw error
    })
}
```

### Vite开发服务器调试
```typescript
// Vite HMR状态监控
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    console.log('🔄 HMR更新:', payload)
  })
  
  import.meta.hot.on('vite:error', (payload) => {
    console.error('❌ HMR错误:', payload)
  })
}

// 开发环境特有的调试信息
if (import.meta.env.DEV) {
  // 性能监控
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('⏱️ 性能指标:', entry.name, entry.duration)
    }
  })
  observer.observe({ entryTypes: ['navigation', 'resource'] })
}
```

## 常见问题快速解决方案记忆

### 白屏问题排查清单
```
□ 检查浏览器控制台是否有JavaScript错误
□ 检查网络面板是否有资源加载失败
□ 检查前端服务是否正常启动 (http://localhost:3000)
□ 检查后端服务是否正常响应 (http://localhost:3003/api/stats)
□ 检查环境变量是否正确设置
□ 检查依赖是否正确安装 (pnpm install)
□ 检查TypeScript编译是否有错误
□ 检查Vite配置是否正确
```

### 环境变量问题快速修复
```typescript
// 1. 检查当前环境变量
console.log('当前环境变量:', import.meta.env)

// 2. 验证关键变量
const criticalVars = ['VITE_API_URL', 'VITE_APP_TITLE']
criticalVars.forEach(varName => {
  const value = import.meta.env[varName]
  console.log(`${varName}:`, value || '❌ 未设置')
})

// 3. 修复常见错误
// 错误: process.env.VITE_API_URL
// 正确: import.meta.env.VITE_API_URL
```

### API连接问题快速诊断
```powershell
# 1. 检查后端服务状态
curl http://localhost:3003/api/stats
# 或
Invoke-WebRequest -Uri "http://localhost:3003/api/stats"

# 2. 检查端口占用
netstat -ano | findstr ":3003"

# 3. 重启后端服务
taskkill /F /IM node.exe
cd D:\codee\xiyouji-rela-map
node src/server/dataServer.js
```

## 预防性措施记忆

### 代码质量检查
```json
// .eslintrc.js 添加环境变量检查规则
{
  "rules": {
    "no-undef": "error",
    "no-process-env": "warn"
  },
  "globals": {
    "import": "readonly"
  }
}
```

### TypeScript配置优化
```json
// tsconfig.json 严格模式配置
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 启动时验证
```typescript
// 应用启动时的环境验证
function validateEnvironment() {
  const requiredVars = ['VITE_API_URL']
  const missing = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ 缺少必需的环境变量:', missing)
    throw new Error(`应用启动失败: 缺少环境变量 ${missing.join(', ')}`)
  }
  
  console.log('✅ 环境变量验证通过')
}

// 在应用入口调用
validateEnvironment()
```

这次的Bug修复经历提供了宝贵的经验，建立了完整的故障排除方法论和预防机制。这些记忆将帮助快速识别和解决类似问题，提高开发效率和项目稳定性。

# 记忆 - 西游记法宝JSON文件创建进度

## 已完成法宝
截至目前，已完成了43个西游记法宝的JSON文件创建，占总数的64%。这些法宝按照unid编号从a0001到a0043进行了系统化整理。

## 特殊处理情况
1. **同名法宝处理**：
   - 芭蕉扇有三个版本（a0014、a0036、a0043），分别属于铁扇公主、文殊菩萨和地藏王菩萨
   - 玉净瓶有两个版本（a0026、a0039），分别属于文殊菩萨和普贤菩萨
   - 紫金红葫芦有两个版本（a0008、a0031），属于不同所有者
   - 七星剑/七星宝剑（a0016、a0032）为不同等级版本

2. **特殊类型**：
   - 哮天犬（a0037）被归类为"artifact_creature"，既是生物又被视为二郎神的法宝

## 文件命名规则
- 基本格式：`artifact_<unid>_<pinyin>.json`
- 同名法宝：在拼音后添加序号区分，如`ba_jiao_shan_2`、`ba_jiao_shan_3`

## 数据结构
所有法宝JSON文件遵循统一的数据结构：
```
{
    "unid": "aXXXX",
    "isAlias": false,
    "basic": { ... },
    "attributes": { ... },
    "relationships": { ... },
    "metadata": { ... }
}
```

## 待完成工作
还有24个法宝（a0044-a0067）需要创建，其中有几个可能与已创建的法宝重复，需要特别检查：
- a0048 混元金斗（与a0041比较）
- a0052 金铙（与a0005比较）
- a0055 幌金绳（与a0010比较）
- a0064 金铃（与a0023比较）
- a0067 混元金斗（与a0041和a0048比较）

## 进度追踪
进度在docs/data/TODO_artifact_creation.md文件中持续更新。
