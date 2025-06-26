/**
 * 西游记81难事件相关类型定义
 */

/**
 * 事件数据接口
 */
export interface EventData {
  id: number
  nanci: number              // 难次 (1-81)
  nanming: string           // 难名
  zhuyaorenwu: string       // 主要人物
  didian: string            // 地点
  shijianmiaoshu: string    // 事件描述
  xiangzhengyi: string      // 象征意义
  wenhuaneihan: string      // 文化内涵
  metadata: {
    source: string
    lastModified: string
    verified: boolean
  }
}

/**
 * API响应接口
 */
export interface EventsApiResponse {
  success: boolean
  data: EventData[]
  cached?: boolean
  source: string
  timestamp: string
}

/**
 * 单个事件API响应接口
 */
export interface EventApiResponse {
  success: boolean
  data: EventData
  source: string
  timestamp: string
}

/**
 * 事件搜索API响应接口
 */
export interface EventSearchApiResponse {
  success: boolean
  data: EventData[]
  query: Record<string, string>
  count: number
  source: string
  timestamp: string
}

/**
 * API错误响应接口
 */
export interface EventsApiError {
  success: false
  error: string
  timestamp: string
}
