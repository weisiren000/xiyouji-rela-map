/**
 * 西游记81难事件数据服务
 * 负责从后端API获取事件数据
 */

import type { 
  EventData, 
  EventsApiResponse, 
  EventApiResponse, 
  EventSearchApiResponse,
  EventsApiError 
} from '@/types/events'

// API基础URL - 从环境变量获取，如果没有则使用Railway部署的端点
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://xiyou-rela-map-backend-production.up.railway.app/api'

/**
 * 获取所有81难事件数据
 */
export async function getAllEvents(): Promise<EventData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: EventsApiResponse | EventsApiError = await response.json()
    
    if (!result.success) {
      throw new Error((result as EventsApiError).error)
    }
    
    return (result as EventsApiResponse).data
    
  } catch (error) {
    console.error('获取81难事件数据失败:', error)
    throw error
  }
}

/**
 * 根据难次获取单个事件
 */
export async function getEventByNanci(nanci: number): Promise<EventData | null> {
  try {
    if (nanci < 1 || nanci > 81) {
      throw new Error('难次必须是1-81之间的数字')
    }
    
    const response = await fetch(`${API_BASE_URL}/events/${nanci}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: EventApiResponse | EventsApiError = await response.json()
    
    if (!result.success) {
      throw new Error((result as EventsApiError).error)
    }
    
    return (result as EventApiResponse).data
    
  } catch (error) {
    console.error(`获取第${nanci}难数据失败:`, error)
    throw error
  }
}

/**
 * 搜索事件
 */
export async function searchEvents(keyword: string): Promise<EventData[]> {
  try {
    if (!keyword.trim()) {
      throw new Error('搜索关键词不能为空')
    }
    
    const response = await fetch(`${API_BASE_URL}/events/search?q=${encodeURIComponent(keyword)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: EventSearchApiResponse | EventsApiError = await response.json()
    
    if (!result.success) {
      throw new Error((result as EventsApiError).error)
    }
    
    return (result as EventSearchApiResponse).data
    
  } catch (error) {
    console.error('搜索事件失败:', error)
    throw error
  }
}

/**
 * 获取事件统计信息
 */
export function getEventsStats(events: EventData[]) {
  return {
    totalEvents: events.length,
    eventsByLocation: events.reduce((acc, event) => {
      acc[event.didian] = (acc[event.didian] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    eventsWithCharacters: events.filter(event => event.zhuyaorenwu.trim().length > 0).length,
    lastUpdated: new Date().toISOString()
  }
}

/**
 * 验证事件数据完整性
 */
export function validateEventData(event: EventData): boolean {
  return !!(
    event.id &&
    event.nanci >= 1 && event.nanci <= 81 &&
    event.nanming &&
    event.shijianmiaoshu
  )
}

/**
 * 格式化事件显示文本
 */
export function formatEventDisplay(event: EventData): string {
  return `第${event.nanci}难: ${event.nanming}`
}

/**
 * 获取事件的简短描述
 */
export function getEventSummary(event: EventData, maxLength: number = 50): string {
  if (event.shijianmiaoshu.length <= maxLength) {
    return event.shijianmiaoshu
  }
  return event.shijianmiaoshu.substring(0, maxLength) + '...'
}
