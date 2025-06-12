<template>
  <div id="app">
    <!-- 主要的Three.js画布组件 -->
    <XiyoujiCanvas />
    
    <!-- UI面板组件 -->
    <InstructionsPanel />
    <ThemeSelector />
    <ControlButtons />
    
    <!-- 角色详情弹窗 -->
    <CharacterDetail v-if="appStore.showCharacterDetail" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import XiyoujiCanvas from '@/components/XiyoujiCanvas.vue'
import InstructionsPanel from '@/components/InstructionsPanel.vue'
import ThemeSelector from '@/components/ThemeSelector.vue'
import ControlButtons from '@/components/ControlButtons.vue'
import CharacterDetail from '@/components/CharacterDetail.vue'

const appStore = useAppStore()

onMounted(() => {
  // 应用初始化逻辑
  console.log('西游记星图应用已启动')
})
</script>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000000;
  font-family: 'Inter', sans-serif;
  color: #eee;
}
</style>
