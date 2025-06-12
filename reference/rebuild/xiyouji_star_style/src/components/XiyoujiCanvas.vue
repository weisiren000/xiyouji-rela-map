<template>
  <canvas ref="canvasRef" class="xiyouji-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useThreeScene } from '@/composables/useThreeScene'

const canvasRef = ref<HTMLCanvasElement>()
const appStore = useAppStore()

// 使用Three.js场景组合式函数
const {
  initScene,
  animate,
  handleResize,
  handleClick,
  updateTheme,
  updateDensity,
  updateFormation,
  resetCamera,
  cleanup
} = useThreeScene()

onMounted(async () => {
  if (canvasRef.value) {
    // 初始化Three.js场景
    await initScene(canvasRef.value)
    
    // 开始动画循环
    animate()
    
    // 添加事件监听器
    window.addEventListener('resize', handleResize)
    canvasRef.value.addEventListener('click', handleClick)
  }
})

onUnmounted(() => {
  // 清理资源
  cleanup()
  window.removeEventListener('resize', handleResize)
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('click', handleClick)
  }
})

// 监听状态变化
watch(() => appStore.config.activePaletteIndex, (newIndex) => {
  updateTheme(newIndex)
})

watch(() => appStore.config.densityFactor, (newDensity) => {
  updateDensity(newDensity)
})

watch(() => appStore.config.currentFormation, (newFormation) => {
  updateFormation(newFormation)
})

// 暴露重置相机方法给父组件
defineExpose({
  resetCamera
})
</script>

<style scoped>
.xiyouji-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
