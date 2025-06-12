# Glumpy风格演示

这个文件夹包含了基于Glumpy风格的粒子效果演示，适用于西游记关系图谱项目的视觉效果参考。

## 文件说明

### 1. `demo.html` - 完整粒子系统演示
**特点**：
- 2000个动态粒子
- 鼠标交互引力系统
- 点击创建引力源
- 实时FPS显示
- 自定义着色器效果
- 霓虹色彩风格

**交互方式**：
- 🖱️ **鼠标移动**: 粒子被鼠标吸引
- 🖱️ **点击**: 创建临时引力源
- ⌨️ **空格键**: 重置所有粒子

### 2. `simple_demo.html` - 简单爆炸效果演示
**特点**：
- 点击创建粒子爆炸
- 重力物理效果
- 发光材质
- 星空背景
- 简单易懂的代码结构

**交互方式**：
- 🖱️ **点击**: 在鼠标位置创建粒子爆炸

## 技术特点

### 🎨 **Glumpy风格特征**
1. **霓虹色彩**: 高饱和度的HSL颜色系统
2. **发光效果**: 使用UnrealBloomPass后处理
3. **加法混合**: AdditiveBlending创造发光感
4. **动态着色器**: 实时颜色和大小变化
5. **科技感UI**: 终端风格的界面设计

### ⚡ **性能优化**
- BufferGeometry高效几何体
- 自定义着色器减少CPU计算
- 粒子生命周期管理
- 适当的粒子数量控制

### 🔧 **核心算法**

#### 粒子物理系统
```javascript
// 引力计算
const force = attractorPosition.clone().sub(particlePosition);
const distance = force.length();
force.normalize().multiplyScalar(strength / (distance * 0.1 + 1));

// 速度更新
particle.velocity.add(force.multiplyScalar(deltaTime));
particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
```

#### 颜色动画
```javascript
// 基于速度的动态颜色
const speed = particle.velocity.length();
const hue = (time * 0.1 + speed * 0.5) % 1.0;
const color = new THREE.Color().setHSL(hue, 0.8, 0.5 + speed * 0.3);
```

## 应用到西游记项目

### 🌟 **全局银河视图**
- 使用demo.html的粒子系统作为基础
- 每个粒子代表一个角色或事件
- 鼠标交互选择和聚焦

### 🔍 **局部关系视图**
- 使用simple_demo.html的爆炸效果
- 展示角色关系的动态连接
- 点击触发关系展开动画

### 🎯 **具体实现建议**
1. **数据映射**: 将西游记角色数据映射到粒子属性
2. **颜色编码**: 不同角色类型使用不同颜色
3. **交互增强**: 添加悬停提示和详情面板
4. **动画过渡**: 实现视图间的平滑切换

## 浏览器兼容性
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 依赖
- Three.js r160
- WebGL 2.0支持
- ES6模块支持

---

**作者**: 约翰 (为了女儿的医疗费用而努力编程的父亲)
**创建时间**: 2024年
**用途**: 西游记关系图谱可视化项目参考