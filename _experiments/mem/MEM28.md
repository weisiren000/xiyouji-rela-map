# MEM28 - 银河系项目黑屏问题修复记忆

## 记忆时间
2025年1月8日

## 核心记忆

### 关键技术问题
- **React Three Fiber规则**: `useFrame` Hook只能在Canvas组件内部使用，在外部使用会导致组件崩溃
- **性能监控架构**: 应该使用原生`requestAnimationFrame`而不是Three.js特定的Hook来实现FPS监控
- **导入路径一致性**: 项目中必须统一使用配置好的路径别名，避免混用不同格式

### 错误诊断方法
- **工具化检测**: 使用Playwright等工具自动检测浏览器控制台错误比手动检查更高效
- **第一性原理**: 从基础事实出发分析问题，不被表面现象误导
- **最小修改原则**: 紧急修复时只修改必要的代码，避免引入新问题

### 代码架构经验
- **性能监控系统**: 应该独立于渲染系统，使用Web标准API而不是框架特定API
- **模块导入规范**: 统一使用`@/`前缀的路径别名，确保与构建工具配置一致
- **类型安全**: WebGL相关代码需要正确的类型转换，避免TypeScript编译错误

## 技术细节记忆

### usePerformanceMonitor重构
```typescript
// 错误的实现 (导致崩溃)
import { useFrame } from '@react-three/fiber'
export const usePerformanceMonitor = () => {
  useFrame(() => { /* FPS计算 */ })
}

// 正确的实现
import { useRef, useEffect, useState } from 'react'
export const usePerformanceMonitor = () => {
  useEffect(() => {
    const updateFPS = () => {
      // FPS计算逻辑
      animationFrameId.current = requestAnimationFrame(updateFPS)
    }
    // 启动和清理逻辑
  }, [])
}
```

### 导入路径修复
```typescript
// 错误的导入
import { useGalaxyStore } from '@stores/useGalaxyStore'

// 正确的导入
import { useGalaxyStore } from '@/stores/useGalaxyStore'
```

### WebGL类型处理
```typescript
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
```

## 问题解决流程记忆

### 1. 快速诊断步骤
1. 确认服务器运行状态
2. 检查浏览器控制台错误
3. 使用工具自动化检测
4. 分析错误堆栈定位具体组件

### 2. 根因分析方法
1. 基于第一性原理思考
2. 检查最近的代码变更
3. 验证框架使用规则
4. 确认模块导入路径

### 3. 修复验证流程
1. 修复代码错误
2. 重启开发服务器
3. 检查控制台错误消除
4. 验证功能完整性

## 用户偏好记忆
- **稳定性第一**: 用户最重视项目的稳定运行，不能容忍黑屏等严重问题
- **快速响应**: 希望问题能够快速定位和解决，不影响开发进度
- **功能保持**: 修复过程中不能破坏现有的功能和性能优化成果
- **开发连续性**: 重视开发流程的连续性，避免长时间的开发阻塞

## 项目架构记忆

### 性能优化系统架构
- **分级配置**: 低配/中等/高配/极致四个性能等级
- **自动检测**: 基于设备硬件自动选择合适的性能等级
- **实时监控**: 使用独立的FPS监控系统，不依赖Three.js
- **用户控制**: 提供手动控制选项，满足不同用户需求

### 组件结构记忆
- **GalaxyScene**: 主3D场景组件，包含Canvas和相机控制
- **Galaxy**: 银河系主组件，包含星球集群和雾气效果
- **PlanetCluster**: 使用InstancedMesh优化的星球渲染组件
- **PerformanceDisplay**: 性能监控显示组件，位于Canvas外部
- **ControlPanel**: lil-gui控制面板，提供参数调节功能

## 错误类型记忆

### React Three Fiber相关错误
- **useFrame在Canvas外使用**: 导致Hook规则违反，组件崩溃
- **Three.js对象生命周期**: 需要正确管理Three.js对象的创建和销毁
- **渲染性能**: 大量对象渲染需要使用InstancedMesh等优化技术

### 模块系统错误
- **路径别名不一致**: 导致模块解析失败，组件无法导入
- **TypeScript类型错误**: WebGL等API需要正确的类型转换
- **构建配置**: vite.config.ts和tsconfig.json的路径配置必须一致

## 预防措施记忆

### 开发规范
- 建立React Three Fiber使用检查清单
- 统一项目导入路径规范
- 制定代码审查标准流程

### 质量保证
- 添加组件渲染测试
- 实施持续集成检查
- 建立错误边界机制

### 监控机制
- 定期检查浏览器控制台
- 建立自动化错误检测
- 实施代码质量监控

## 工具使用记忆

### Playwright用于错误检测
- 可以自动检测浏览器控制台错误
- 支持截图验证页面状态
- 比手动检查更高效和准确

### 开发工具配置
- vite.config.ts: 路径别名配置
- tsconfig.json: TypeScript路径映射
- package.json: 项目脚本和依赖

## 经验教训记忆

### 技术架构
- 严格遵守框架使用规则，不要试图绕过限制
- 保持代码架构的一致性和可维护性
- 重视类型安全和错误处理机制

### 问题解决
- 第一性原理分析比经验猜测更可靠
- 工具化检测比手动检查更高效
- 最小修改原则可以降低引入新问题的风险

### 项目管理
- 建立完善的代码质量检查机制
- 重视开发环境的稳定性维护
- 制定标准化的紧急问题处理流程

---
*记忆者：约翰*
*每一次错误都是学习的机会，每一次修复都让我们更加专业*
*🧠 技术记忆：积累经验，避免重复错误，持续改进！*
