/**
 * 事件数据API服务
 * 负责与后端事件数据API交互
 */

export interface EventData {
  id: number;
  nanci: number; // 难次 (1-81)
  nanming: string; // 难名
  zhuyaorenwu: string; // 主要人物
  didian: string; // 地点
  shijianmiaoshu: string; // 事件描述
  xiangzhengyi: string; // 象征意义
  wenhuaneihan: string; // 文化内涵
}

export interface EventApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  timestamp: string;
}

export interface EventStats {
  totalEvents: number;
  uniqueLocations: number;
  averageDescriptionLength: number;
}

class EventApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:3003/api/events';
  }

  /**
   * 获取所有事件数据 (81难)
   */
  async getAllEvents(): Promise<EventData[]> {
    try {
      const response = await fetch(this.baseUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: EventApiResponse<EventData[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '获取事件数据失败');
      }
      
      console.log(`📚 成功获取 ${result.data.length} 个事件数据`);
      return result.data;
    } catch (error) {
      console.error('❌ 获取事件数据失败:', error);
      throw error;
    }
  }

  /**
   * 根据难次获取特定事件
   */
  async getEventByDifficulty(nanci: number): Promise<EventData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${nanci}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: EventApiResponse<EventData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '获取事件数据失败');
      }
      
      return result.data;
    } catch (error) {
      console.error(`❌ 获取第${nanci}难数据失败:`, error);
      throw error;
    }
  }

  /**
   * 搜索事件数据
   */
  async searchEvents(keyword: string, limit: number = 50): Promise<EventData[]> {
    try {
      const params = new URLSearchParams({
        keyword,
        limit: limit.toString()
      });
      
      const response = await fetch(`${this.baseUrl}/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: EventApiResponse<EventData[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '搜索事件数据失败');
      }
      
      console.log(`🔍 搜索"${keyword}"找到 ${result.data.length} 个结果`);
      return result.data;
    } catch (error) {
      console.error('❌ 搜索事件数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取事件统计信息
   */
  async getEventStats(): Promise<EventStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: EventApiResponse<EventStats> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '获取统计数据失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('❌ 获取事件统计失败:', error);
      throw error;
    }
  }

  /**
   * 检查服务器连接
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5秒超时
      });
      return response.ok;
    } catch (error) {
      console.warn('⚠️ 事件数据服务器连接检查失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const eventApiService = new EventApiService();
