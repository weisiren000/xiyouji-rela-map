# MEM10: 全局状态管理架构与外部访问技术记忆

## 全局状态管理最佳实践记忆

### Zustand状态管理模式
```typescript
// 标准的全局状态Store结构
export const useCharacterInfoStore = create<CharacterInfoState>((set) => ({
  // 状态定义
  hoveredCharacter: null,
  mousePosition: new Vector2(0, 0),
  showInfoCard: false,
  
  // 状态更新方法
  setHoveredCharacter: (character) => {
    set({ 
      hoveredCharacter: character,
      showInfoCard: character !== null
    })
  },
  
  // 清理方法
  clearHover: () => {
    set({ 
      hoveredCharacter: null,
      showInfoCard: false
    })
  }
}))
```

### 3D组件与全局状态集成模式
```typescript
// 在3D组件中的标准集成方式
const { setHoveredCharacter, setMousePosition, clearHover } = useCharacterInfoStore()

// 状态同步的正确模式
useEffect(() => {
  if (interactionState.hoveredCharacter) {
    setHoveredCharacter(interactionState.hoveredCharacter)
    setMousePosition(interactionState.mousePosition)
  } else {
    clearHover()
  }
}, [interactionState.hoveredCharacter, interactionState.mousePosition])
```

### App层面UI集成模式
```typescript
// 在App组件中的标准使用方式
const { hoveredCharacter, mousePosition, showInfoCard } = useCharacterInfoStore()

// UI组件渲染
<CharacterInfoOverlay
  character={hoveredCharacter}
  mousePosition={mousePosition}
  visible={showInfoCard}
/>
```

## 角色信息卡片设计与实现记忆

### 卡片样式设计模式
```typescript
// 标准的卡片样式配置
const cardStyle = {
  position: 'fixed',
  left: `${left}px`,
  top: `${top}px`,
  width: '280px',
  background: 'rgba(0, 0, 0, 0.9)',
  border: `2px solid ${character.visual.color}`,
  borderRadius: '12px',
  padding: '16px',
  color: '#ffffff',
  fontSize: '14px',
  zIndex: 10000,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px ${character.visual.color}40`,
  pointerEvents: 'none', // 关键：防止阻挡鼠标事件
  fontFamily: 'Arial, sans-serif'
}
```

### 智能定位算法记忆
```typescript
// 边界检测和位置调整的标准算法
const calculateCardPosition = (mousePosition, cardWidth, cardHeight, offset = 15) => {
  let left = mousePosition.x + offset
  let top = mousePosition.y + offset

  // 右边界检测
  if (left + cardWidth > window.innerWidth) {
    left = mousePosition.x - cardWidth - offset
  }

  // 下边界检测
  if (top + cardHeight > window.innerHeight) {
    top = mousePosition.y - cardHeight - offset
  }

  // 左边界和上边界保护
  if (left < 0) left = offset
  if (top < 0) top = offset

  return { left, top }
}
```

### 信息层次化显示模式
```typescript
// 角色能力等级映射
const getPowerLevel = (power: number) => {
  if (power >= 90) return { text: '至尊', color: '#ffd700' }
  if (power >= 80) return { text: '极强', color: '#ff6b6b' }
  if (power >= 70) return { text: '很强', color: '#4ecdc4' }
  if (power >= 60) return { text: '较强', color: '#45b7d1' }
  if (power >= 50) return { text: '中等', color: '#96ceb4' }
  if (power >= 40) return { text: '较弱', color: '#feca57' }
  return { text: '弱', color: '#ff9ff3' }
}

// 排名颜色区分
const getRankColor = (rank: number) => {
  if (rank <= 10) return '#ffd700' // 金色
  if (rank <= 50) return '#ff6b6b' // 红色
  return '#4ecdc4' // 蓝色
}

// 类别名称映射
const getCategoryName = (category: string) => {
  const categoryMap = {
    'protagonist': '主角团队',
    'deity': '神仙',
    'demon': '妖魔',
    'dragon': '龙族',
    'buddhist': '佛教',
    'celestial': '天庭',
    'underworld': '地府',
    'human': '人类'
  }
  return categoryMap[category] || category
}
```

### 卡片组件结构模式
```typescript
// 标准的信息卡片组件结构
<div style={cardStyle}>
  {/* 标题区域 */}
  <div style={{ borderBottom: `1px solid ${character.visual.color}40` }}>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color: character.visual.color }}>
      {character.name}
      {character.isAlias && <span style={{ fontSize: '12px', color: '#888' }}>(别名)</span>}
    </div>
    <div style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>
      {character.pinyin}
    </div>
  </div>

  {/* 基本信息区域 */}
  <div style={{ margin: '12px 0' }}>
    <InfoRow label="类别" value={getCategoryName(character.category)} color={character.visual.color} />
    <InfoRow label="阵营" value={character.faction} />
    <InfoRow label="类型" value={character.type} />
  </div>

  {/* 数值信息区域 */}
  <div>
    <InfoRow label="排名" value={`#${character.rank}`} color={getRankColor(character.rank)} />
    <InfoRow label="能力" value={`${character.power} (${getPowerLevel(character.power).text})`} />
    <InfoRow label="影响力" value={character.influence} />
  </div>

  {/* 特殊信息区域 */}
  {character.isAlias && character.originalCharacter && (
    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${character.visual.color}40` }}>
      <span style={{ fontSize: '12px', color: '#888' }}>原角色：{character.originalCharacter}</span>
    </div>
  )}
</div>
```

### 响应式设计记忆
```typescript
// 响应式卡片尺寸调整
const getResponsiveCardSize = () => {
  const screenWidth = window.innerWidth

  if (screenWidth < 768) {
    // 移动设备
    return { width: 240, height: 180, fontSize: '12px' }
  } else if (screenWidth < 1024) {
    // 平板设备
    return { width: 260, height: 190, fontSize: '13px' }
  } else {
    // 桌面设备
    return { width: 280, height: 200, fontSize: '14px' }
  }
}
```

## 避免Portal渲染冲突的技术记忆

### 错误模式（导致黑屏）
```typescript
// ❌ 错误：在3D组件中直接使用Portal
{interactionState.hoveredCharacter && createPortal(
  <CharacterInfoCard />,
  document.body
)}
```

### 正确模式（稳定可靠）
```typescript
// ✅ 正确：分离关注点
// 3D组件：只负责状态更新
setHoveredCharacter(character)

// App组件：负责UI渲染
<CharacterInfoOverlay />
```

### 关键原则
1. **3D组件职责**: 只负责交互检测和状态更新
2. **UI组件职责**: 只负责信息显示和用户界面
3. **状态管理**: 通过全局状态连接两者
4. **渲染分离**: 3D渲染在Canvas，UI渲染在DOM

## 外部访问配置技术记忆

### Cloudflare Tunnel最佳实践
```powershell
# 前端外部访问
cloudflared tunnel --url http://localhost:3000

# 后端外部访问
cloudflared tunnel --url http://localhost:3003
```

### Vite外部访问配置
```typescript
// vite.config.ts的正确配置
server: {
  port: 3000,
  host: '0.0.0.0', // 允许外部访问
  open: true,
  allowedHosts: true, // Vite 5的正确语法
}
```

### API外部URL配置模式
```typescript
// 环境变量方式
const EXTERNAL_API_URL = process.env.VITE_API_URL || null
let API_BASE_URL = EXTERNAL_API_URL || 'http://localhost:3003/api'

// 手动配置方式
static setExternalApiUrl(url: string): void {
  API_BASE_URL = url.endsWith('/api') ? url : `${url}/api`
  console.log(`🌐 手动设置外部API URL为: ${API_BASE_URL}`)
}
```

### 外部访问问题诊断模式
1. **前端可访问，后端不可访问**: 需要为后端创建独立tunnel
2. **主机名被阻止**: 配置allowedHosts或使用Cloudflare Tunnel
3. **CORS问题**: 在服务器配置中启用CORS
4. **端口不匹配**: 确保tunnel指向正确的本地端口

## 调试和监控技术记忆

### 多层次日志系统
```typescript
// 3D组件层面
console.log('🖱️ 检测到悬浮:', character.name)
console.log('🌐 更新全局状态')

// App组件层面
console.log('📱 App层接收到角色信息:', character.name)
console.log('💳 显示信息卡片:', showInfoCard)

// API层面
console.log('🌐 测试外部API URL:', EXTERNAL_API_URL)
console.log('✅ 外部API URL可用')
```

### 状态变化追踪模式
```typescript
// 使用useEffect追踪状态变化
useEffect(() => {
  if (hoveredCharacter) {
    console.log('📱 App层接收到角色信息:', hoveredCharacter.name)
    console.log('📍 鼠标位置:', mousePosition.x, mousePosition.y)
    console.log('💳 显示信息卡片:', showInfoCard)
  }
}, [hoveredCharacter, mousePosition, showInfoCard])
```

## 渐进式开发方法记忆

### 安全的功能集成步骤
1. **第一步**: 只添加导入，测试是否有冲突
2. **第二步**: 添加状态管理逻辑，测试基础功能
3. **第三步**: 添加UI渲染，测试完整功能
4. **第四步**: 优化和增强，测试性能和体验

### 错误处理和回滚策略
```typescript
// 每次修改后立即验证
// 1. 检查编译错误
// 2. 测试基础功能（悬浮高亮）
// 3. 测试新功能（信息卡片）
// 4. 检查控制台错误
// 5. 如有问题立即回滚
```

### 功能验证清单
- [ ] 悬浮高亮效果正常
- [ ] 所有视角都有交互
- [ ] 信息卡片正确显示
- [ ] 卡片位置跟随鼠标
- [ ] 控制台无错误信息
- [ ] 外部访问正常工作

## 组件架构设计记忆

### 成功的分层架构
```
App层 (UI集成)
├── CharacterInfoOverlay (信息显示)
└── GalaxyScene
    └── CharacterSpheresSimple (3D交互)
        ├── InstancedMesh (3D渲染)
        ├── BeautifulHighlight (高亮效果)
        └── useCharacterInteraction (交互检测)

全局状态层
└── useCharacterInfoStore (状态管理)
```

### 数据流向设计
```
用户交互 → 射线检测 → 交互状态 → 全局状态 → UI响应 → 视觉反馈
```

### 职责分离原则
- **3D组件**: 渲染、交互检测、状态更新
- **UI组件**: 信息显示、用户界面、视觉反馈
- **状态管理**: 数据存储、状态同步、事件通知
- **App组件**: 组件集成、全局配置、生命周期管理

## 性能优化技术记忆

### 状态更新优化
```typescript
// 避免不必要的状态更新
useEffect(() => {
  if (interactionState.hoveredCharacter) {
    // 只在有变化时更新
    setHoveredCharacter(interactionState.hoveredCharacter)
  } else {
    // 清理状态
    clearHover()
  }
}, [interactionState.hoveredCharacter]) // 精确的依赖数组
```

### 渲染性能优化
- **条件渲染**: 只在需要时渲染UI组件
- **状态缓存**: 利用React的状态优化机制
- **事件节流**: 控制交互检测频率
- **内存管理**: 及时清理不需要的状态

## 外部访问部署记忆

### 完整的外部访问配置流程
1. **前端配置**: 修改vite.config.ts支持外部主机
2. **前端tunnel**: 创建前端的Cloudflare Tunnel
3. **后端tunnel**: 创建后端的Cloudflare Tunnel
4. **API配置**: 设置前端使用外部后端URL
5. **功能验证**: 测试外部环境的完整功能

### 环境变量配置模式
```powershell
# 设置外部后端URL
$env:VITE_API_URL="https://backend-tunnel-url.trycloudflare.com"

# 重启前端服务
pnpm dev
```

### 故障排除清单
- [ ] 前端tunnel正常运行
- [ ] 后端tunnel正常运行
- [ ] 环境变量正确设置
- [ ] API URL配置正确
- [ ] CORS配置正确
- [ ] 端口映射正确

## 项目管理和交接记忆

### 实验记录系统
- **EXP文件**: 记录具体的技术实现和问题解决
- **SUM文件**: 总结工作内容和成果
- **MEM文件**: 记录技术要点和最佳实践

### 任务交接要点
1. **当前状态**: 明确已完成和进行中的任务
2. **技术背景**: 说明关键技术决策和架构
3. **下一步计划**: 列出优先级和具体步骤
4. **风险提示**: 标识潜在问题和注意事项

### 成功模式复用
- **全局状态管理**: 可应用于其他交互功能
- **外部访问配置**: 可用于其他部署需求
- **渐进式开发**: 适用于所有新功能开发
- **错误处理策略**: 通用的问题解决方法

这次的全局状态管理实现是一个重要的技术突破，建立了稳定可靠的架构模式，为后续所有功能开发提供了坚实的技术基础。
