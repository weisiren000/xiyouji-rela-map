import { ref } from 'vue'
import * as THREE from 'three'
import type { PulseUniforms } from '@/types'
import { xiyoujiPalettes } from '@/utils/data'
import { useAppStore } from '@/stores/app'

/**
 * 脉冲系统管理组合式函数
 */
export function usePulseSystem() {
  const appStore = useAppStore()
  
  // 脉冲系统状态
  const pulseUniforms = ref<PulseUniforms>({
    uTime: { value: 0.0 },
    uPulsePositions: { 
      value: [
        new THREE.Vector3(1e3, 1e3, 1e3), 
        new THREE.Vector3(1e3, 1e3, 1e3), 
        new THREE.Vector3(1e3, 1e3, 1e3)
      ] 
    },
    uPulseTimes: { value: [-1e3, -1e3, -1e3] },
    uPulseColors: { 
      value: [
        new THREE.Color(1, 1, 1), 
        new THREE.Color(1, 1, 1), 
        new THREE.Color(1, 1, 1)
      ] 
    },
    uPulseSpeed: { value: 15.0 },
    uBaseNodeSize: { value: 0.5 },
    uActivePalette: { value: 0 }
  })
  
  /**
   * 初始化脉冲系统
   */
  function initPulseSystem() {
    // 脉冲系统已经在创建时初始化
    console.log('脉冲系统初始化完成')
  }
  
  /**
   * 创建脉冲效果
   */
  function createPulse(position: THREE.Vector3) {
    const uniforms = pulseUniforms.value
    
    // 寻找可用的脉冲槽位
    for (let i = 0; i < 3; i++) {
      if (uniforms.uPulseTimes.value[i] < uniforms.uTime.value - 3) {
        uniforms.uPulsePositions.value[i].copy(position)
        uniforms.uPulseTimes.value[i] = uniforms.uTime.value
        
        // 使用当前主题的第一个颜色作为脉冲颜色
        const currentPalette = xiyoujiPalettes[appStore.config.activePaletteIndex]
        uniforms.uPulseColors.value[i] = currentPalette[0].clone()
        
        break
      }
    }
  }
  
  /**
   * 更新脉冲时间
   */
  function updatePulseTime(time: number) {
    pulseUniforms.value.uTime.value = time
  }
  
  /**
   * 获取脉冲系统的uniforms
   */
  function getPulseUniforms(): PulseUniforms {
    return pulseUniforms.value
  }
  
  /**
   * 更新脉冲系统的主题
   */
  function updatePulseTheme(paletteIndex: number) {
    pulseUniforms.value.uActivePalette.value = paletteIndex
  }
  
  return {
    initPulseSystem,
    createPulse,
    updatePulseTime,
    getPulseUniforms,
    updatePulseTheme
  }
}
