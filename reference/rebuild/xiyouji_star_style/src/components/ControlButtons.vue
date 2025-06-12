<template>
  <div class="control-buttons">
    <button 
      class="control-button" 
      @click="changeFormation"
    >
      {{ appStore.currentFormationName }}
    </button>
    <button 
      class="control-button" 
      @click="togglePause"
    >
      {{ appStore.config.paused ? '播放' : '暂停' }}
    </button>
    <button 
      class="control-button" 
      @click="resetCamera"
    >
      重置视角
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 定义事件发射器，用于与Three.js组件通信
const emit = defineEmits<{
  resetCamera: []
}>()

function changeFormation() {
  appStore.nextFormation()
}

function togglePause() {
  appStore.togglePause()
}

function resetCamera() {
  emit('resetCamera')
}
</script>

<style scoped>
.control-buttons {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  z-index: 10;
  background: rgba(0, 0, 0, .6);
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid rgba(255, 120, 50, .3);
  backdrop-filter: blur(10px);
}

.control-button {
  background: rgba(255, 120, 50, .2);
  color: #eee;
  border: 1px solid rgba(255, 150, 50, .3);
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 90px;
  text-align: center;
  font-family: 'Inter', sans-serif;
}

.control-button:hover, 
.control-button:focus {
  background: rgba(255, 120, 50, .4);
  outline: none;
  transform: translateY(-1px);
}

.control-button:active {
  background: rgba(255, 120, 50, .6);
  transform: scale(0.95);
}

.control-button.active {
  background: rgba(255, 120, 50, .6);
  border-color: rgba(255, 150, 50, .8);
  box-shadow: 0 0 10px rgba(255, 120, 50, .4);
}

@media (max-width: 768px) {
  .control-buttons {
    bottom: 10px;
    gap: 10px;
    padding: 8px 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .control-button {
    padding: 8px 12px;
    font-size: 12px;
    min-width: 70px;
  }
}

@media (max-width: 400px) {
  .control-buttons {
    width: calc(100% - 20px);
    justify-content: space-around;
  }
}
</style>
