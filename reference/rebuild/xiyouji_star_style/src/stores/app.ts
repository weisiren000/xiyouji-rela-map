import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppConfig, XiyoujiCharacter } from '@/types'
import { formationNames, themeNames } from '@/utils/data'

/**
 * 应用主状态管理
 */
export const useAppStore = defineStore('app', () => {
  // 基础配置状态
  const config = ref<AppConfig>({
    paused: false,
    activePaletteIndex: 1, // 默认佛光普照主题
    currentFormation: 0,   // 默认银河系螺旋布局
    numFormations: 4,
    densityFactor: 1
  })

  // 当前选中的角色信息
  const selectedCharacter = ref<XiyoujiCharacter | null>(null)
  
  // 是否显示角色详情
  const showCharacterDetail = ref(false)

  // 计算属性
  const currentFormationName = computed(() => 
    formationNames[config.value.currentFormation] || '未知布局'
  )

  const currentThemeName = computed(() => 
    themeNames[config.value.activePaletteIndex] || '未知主题'
  )

  const densityPercentage = computed(() => 
    Math.round(config.value.densityFactor * 100)
  )

  // 动作方法
  function togglePause() {
    config.value.paused = !config.value.paused
  }

  function setTheme(index: number) {
    if (index >= 0 && index < themeNames.length) {
      config.value.activePaletteIndex = index
    }
  }

  function nextFormation() {
    config.value.currentFormation = 
      (config.value.currentFormation + 1) % config.value.numFormations
  }

  function setDensity(factor: number) {
    config.value.densityFactor = Math.max(0.2, Math.min(1, factor))
  }

  function selectCharacter(character: XiyoujiCharacter | null) {
    selectedCharacter.value = character
    showCharacterDetail.value = !!character
  }

  function hideCharacterDetail() {
    showCharacterDetail.value = false
    selectedCharacter.value = null
  }

  function resetCamera() {
    // 这个方法会被Three.js组件调用
    // 在这里我们只是触发一个事件标记
  }

  return {
    // 状态
    config,
    selectedCharacter,
    showCharacterDetail,
    
    // 计算属性
    currentFormationName,
    currentThemeName,
    densityPercentage,
    
    // 方法
    togglePause,
    setTheme,
    nextFormation,
    setDensity,
    selectCharacter,
    hideCharacterDetail,
    resetCamera
  }
})
