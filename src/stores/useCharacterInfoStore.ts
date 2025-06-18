import { create } from 'zustand'
import { Vector2 } from 'three'

interface CharacterData {
  id: string
  name: string
  pinyin: string
  type: string
  category: string
  faction: string
  rank: number
  power: number
  influence: number
  visual: {
    color: string
    size: number
    emissiveIntensity: number
  }
  isAlias?: boolean
  originalCharacter?: string
}

interface CharacterInfoState {
  // 当前悬浮的角色
  hoveredCharacter: CharacterData | null
  // 鼠标位置
  mousePosition: Vector2
  // 是否显示信息卡片
  showInfoCard: boolean
  
  // 操作方法
  setHoveredCharacter: (character: CharacterData | null) => void
  setMousePosition: (position: Vector2) => void
  setShowInfoCard: (show: boolean) => void
  clearHover: () => void
}

/**
 * 角色信息状态管理
 * 用于在3D组件和UI组件之间安全地传递状态
 */
export const useCharacterInfoStore = create<CharacterInfoState>((set) => ({
  hoveredCharacter: null,
  mousePosition: new Vector2(0, 0),
  showInfoCard: false,

  setHoveredCharacter: (character) => {
    set({ 
      hoveredCharacter: character,
      showInfoCard: character !== null
    })
  },

  setMousePosition: (position) => {
    set({ mousePosition: position })
  },

  setShowInfoCard: (show) => {
    set({ showInfoCard: show })
  },

  clearHover: () => {
    set({ 
      hoveredCharacter: null,
      showInfoCard: false
    })
  }
}))
