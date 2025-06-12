<template>
  <div class="theme-selector ui-panel">
    <div class="theme-selector-title">西游记主题</div>
    <div class="theme-grid">
      <button
        v-for="(theme, index) in themeNames"
        :key="index"
        class="theme-button"
        :class="{ active: appStore.config.activePaletteIndex === index }"
        :data-theme="index"
        :aria-label="theme"
        @click="selectTheme(index)"
      >
      </button>
    </div>
    <div class="density-controls">
      <div class="density-label">
        <span>密度</span>
        <span>{{ appStore.densityPercentage }}%</span>
      </div>
      <input
        type="range"
        min="20"
        max="100"
        :value="appStore.densityPercentage"
        class="density-slider"
        aria-label="角色密度"
        @input="onDensityChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { themeNames } from '@/utils/data'

const appStore = useAppStore()

function selectTheme(index: number) {
  appStore.setTheme(index)
}

function onDensityChange(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)
  appStore.setDensity(value / 100)
}
</script>

<style scoped>
.theme-selector {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 180px;
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

.theme-selector-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
  color: #FF7832;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.theme-button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, .3);
  cursor: pointer;
  transition: transform .2s, border-color .2s, box-shadow .2s;
  outline: none;
  overflow: hidden;
}

.theme-button:hover, .theme-button:focus {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, .7);
}

.theme-button.active {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, .9);
  box-shadow: 0 0 15px rgba(255, 120, 50, .8);
}

.theme-button:nth-child(1) { 
  background: linear-gradient(45deg, #FFD700, #FF8C00, #FF4500, #DC143C); 
}
.theme-button:nth-child(2) { 
  background: linear-gradient(45deg, #4F46E5, #7C3AED, #C026D3, #DB2777); 
}
.theme-button:nth-child(3) { 
  background: linear-gradient(45deg, #10B981, #A3E635, #FACC15, #FB923C); 
}
.theme-button:nth-child(4) { 
  background: linear-gradient(45deg, #EC4899, #8B5CF6, #6366F1, #3B82F6); 
}

.density-controls {
  margin-top: 15px;
}

.density-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.density-slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, .2);
  outline: none;
  -webkit-appearance: none;
}

.density-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #FF7832;
  cursor: pointer;
}

.density-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #FF7832;
  cursor: pointer;
  border: none;
}

@media (max-width: 768px) {
  .theme-selector {
    top: auto;
    bottom: 100px;
    right: 10px;
    max-width: 140px;
  }

  .theme-button {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 400px) {
  .theme-selector {
    flex-direction: column;
    align-items: center;
    max-width: none;
    width: calc(100% - 20px);
    left: 10px;
    right: 10px;
    bottom: 75px;
  }

  .theme-grid {
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    justify-items: center;
  }

  .density-controls {
    width: 80%;
    margin-top: 15px;
  }
}
</style>
