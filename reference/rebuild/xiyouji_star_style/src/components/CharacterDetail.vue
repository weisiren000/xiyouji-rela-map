<template>
  <div class="character-detail ui-panel" v-if="character">
    <div class="character-title">{{ character.name }}</div>
    <div class="character-info">
      <div class="info-item">
        <strong>类型:</strong> {{ getTypeDisplayName(character.type) }}
      </div>
      <div class="info-item">
        <strong>天体:</strong> {{ getCelestialBodyName(character.celestial) }}
      </div>
      <div class="info-item">
        <strong>重要性:</strong> {{ Math.round(character.importance * 100) }}%
      </div>
      <div class="info-item" v-if="character.aliases.length > 0">
        <strong>别名:</strong> {{ character.aliases.join(', ') }}
      </div>
      <div class="info-item" v-else>
        <strong>别名:</strong> 无
      </div>
    </div>
    <button class="close-button" @click="closeDetail">
      返回
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { getTypeDisplayName, celestialBodies } from '@/utils/data'
import type { CelestialBodyType } from '@/types'

const appStore = useAppStore()

const character = computed(() => appStore.selectedCharacter)

function getCelestialBodyName(celestial: CelestialBodyType): string {
  return celestialBodies[celestial]?.name || '未知天体'
}

function closeDetail() {
  appStore.hideCharacterDetail()
}
</script>

<style scoped>
.character-detail {
  position: absolute;
  top: 20px;
  left: 20px;
  max-width: 320px;
  z-index: 20;
}

.ui-panel {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, .8);
  border-radius: 12px;
  border: 1px solid rgba(255, 120, 50, .5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, .7);
  padding: 20px;
  color: #eee;
  font-family: 'Inter', sans-serif;
}

.character-title {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 15px;
  color: #FF7832;
  text-align: center;
}

.character-info {
  margin-bottom: 15px;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.info-item strong {
  color: #FFB366;
  margin-right: 8px;
}

.close-button {
  width: 100%;
  background: rgba(255, 120, 50, .6);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.close-button:hover {
  background: rgba(255, 120, 50, .8);
  transform: translateY(-1px);
}

.close-button:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .character-detail {
    max-width: calc(100% - 40px);
    top: 10px;
    left: 10px;
    right: 10px;
  }
}

@media (max-width: 400px) {
  .character-detail {
    max-width: none;
    width: calc(100% - 20px);
    left: 10px;
    right: 10px;
  }
}
</style>
