import { create } from 'zustand'
import { Vector2 } from 'three'
import type { EventData } from '@/types/events'

interface EventInfoState {
  // 当前悬浮的事件
  hoveredEvent: EventData | null
  // 鼠标位置
  mousePosition: Vector2
  // 是否显示信息卡片
  showInfoCard: boolean
  
  // 操作方法
  setHoveredEvent: (event: EventData | null) => void
  setMousePosition: (position: Vector2) => void
  setShowInfoCard: (show: boolean) => void
  clearHover: () => void
}

/**
 * 事件信息状态管理
 * 用于在3D组件和UI组件之间安全地传递事件状态
 */
export const useEventInfoStore = create<EventInfoState>((set) => ({
  hoveredEvent: null,
  mousePosition: new Vector2(0, 0),
  showInfoCard: false,

  setHoveredEvent: (event) => {
    set({ 
      hoveredEvent: event,
      showInfoCard: event !== null
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
      hoveredEvent: null,
      showInfoCard: false
    })
  }
}))
