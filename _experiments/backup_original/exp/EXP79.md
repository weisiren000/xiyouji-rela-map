# EXP79: 解决控制面板重叠问题

## 问题描述
用户反馈Character Control面板和数据管理面板重叠了，影响了界面的使用体验。

## 第一性原理分析

### 核心问题
- 多个控制面板在同一区域显示，造成视觉冲突和功能干扰
- 需要合理规划界面布局，确保各面板不重叠且易于访问

### 基础事实
1. 项目中有三个主要面板：
   - ControlPanel (主控制面板)
   - CharacterControlPanel (角色控制面板) 
   - CharacterDataPanel (角色数据面板)

2. 原始布局存在冲突：
   - ControlPanel: 右上角 (top: 10, right: 10)
   - CharacterDataPanel: 右侧 (top: 120, right: 20) - 可能与ControlPanel重叠

### 逻辑推导
- 面板应该按功能重要性和使用频率分配位置
- 主控制面板应保持在最显眼的位置
- 角色相关面板可以分布在不同区域避免冲突

## 解决方案

### 布局重新设计
1. **CharacterControlPanel** - 左上角 (top: 10, left: 10, z-index: 999)
   - 角色渲染控制，使用频率中等
   - 放在左侧避免与右侧面板冲突

2. **ControlPanel** - 右上角 (top: 10, right: 10, z-index: 1000)
   - 主控制面板，最高优先级
   - 保持原位置，最高z-index

3. **CharacterDataPanel** - 右侧中下 (top: 200, right: 20, z-index: 998)
   - 角色数据管理，使用频率较低
   - 移到下方避免与主控制面板重叠

### 技术实现
1. 调整CharacterControlPanel的z-index为999
2. 调整CharacterDataPanel的top值从120px增加到200px
3. 调整CharacterDataPanel的z-index为998
4. 更新响应式设计中的移动端布局

## 实施步骤
1. ✅ 修改CharacterControlPanel.tsx的z-index
2. ✅ 修改CharacterDataPanel.css的位置和z-index
3. ✅ 更新响应式设计的移动端布局
4. ✅ 更新arc.md文档中的界面布局说明
5. ✅ 启动开发服务器验证效果

## 验证结果
- 项目成功启动在 http://localhost:3001/
- 三个面板现在有明确的层级和位置分离
- 避免了重叠问题，提升了用户体验

## 经验总结
1. **界面布局设计原则**：
   - 按功能重要性分配位置和层级
   - 考虑用户使用频率和习惯
   - 预留足够空间避免重叠

2. **z-index管理策略**：
   - 主功能面板使用最高z-index
   - 辅助功能面板使用递减的z-index
   - 保持层级关系清晰

3. **响应式设计考虑**：
   - 移动端需要调整布局适应小屏幕
   - 保持各设备上的一致体验

## 技术要点
- CSS position: fixed/absolute的层级管理
- z-index的合理分配和管理
- 响应式设计中的位置调整
- React组件的样式隔离和管理
