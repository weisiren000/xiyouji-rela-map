<template>
  <div class="instructions-container ui-panel">
    <div class="instruction-title">西游记关系图谱</div>
    <div class="instruction-content">
      点击角色节点创建能量脉冲，拖拽旋转视角。体验银河系中的西游记世界。
    </div>
  </div>
</template>

<script setup lang="ts">
// 这个组件是纯展示组件，不需要额外的逻辑
</script>

<style scoped>
.instructions-container {
  position: absolute;
  top: 20px;
  left: 20px;
  max-width: 280px;
}

.ui-panel {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, .7);
  border-radius: 12px;
  border: 1px solid rgba(255, 120, 50, .3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, .5);
  z-index: 10;
  padding: 15px;
  color: #eee;
  font-family: 'Inter', sans-serif;
}

.instruction-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #FF7832;
}

.instruction-content {
  font-size: 14px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .instructions-container {
    max-width: calc(100% - 40px);
    font-size: 13px;
    top: 10px;
    left: 10px;
  }
}
</style>
