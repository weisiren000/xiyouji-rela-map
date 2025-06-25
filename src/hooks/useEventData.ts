import { useState, useEffect, useCallback } from 'react';
import { eventApiService, EventData, EventStats } from '@/services/eventApiService';

/**
 * 事件数据管理Hook
 * 提供事件数据的加载、搜索和状态管理功能
 */
export const useEventData = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [stats, setStats] = useState<EventStats | null>(null);

  /**
   * 加载所有事件数据
   */
  const loadAllEvents = useCallback(async () => {
    if (loading) return; // 防止重复加载
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 正在加载事件数据...');
      const eventData = await eventApiService.getAllEvents();
      setEvents(eventData);
      console.log(`✅ 成功加载 ${eventData.length} 个事件`);
      
      if (!initialized) {
        setInitialized(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载事件数据失败';
      setError(errorMessage);
      console.error('❌ 加载事件数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, initialized]);

  /**
   * 加载事件统计信息
   */
  const loadEventStats = useCallback(async () => {
    try {
      const statsData = await eventApiService.getEventStats();
      setStats(statsData);
      console.log('📊 事件统计信息加载成功:', statsData);
    } catch (err) {
      console.error('❌ 加载事件统计失败:', err);
    }
  }, []);

  /**
   * 根据难次获取特定事件
   */
  const getEventByDifficulty = useCallback(async (nanci: number): Promise<EventData | null> => {
    try {
      return await eventApiService.getEventByDifficulty(nanci);
    } catch (err) {
      console.error(`❌ 获取第${nanci}难失败:`, err);
      return null;
    }
  }, []);

  /**
   * 搜索事件
   */
  const searchEvents = useCallback(async (keyword: string): Promise<EventData[]> => {
    try {
      setLoading(true);
      const results = await eventApiService.searchEvents(keyword);
      return results;
    } catch (err) {
      console.error('❌ 搜索事件失败:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 检查服务器连接状态
   */
  const checkServerConnection = useCallback(async (): Promise<boolean> => {
    try {
      return await eventApiService.checkConnection();
    } catch (err) {
      return false;
    }
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setEvents([]);
    setError(null);
    setInitialized(false);
    setStats(null);
  }, []);

  // 组件挂载时自动加载数据
  useEffect(() => {
    if (!initialized && !loading) {
      loadAllEvents();
      loadEventStats();
    }
  }, [initialized, loading, loadAllEvents, loadEventStats]);

  return {
    // 状态
    events,
    loading,
    error,
    initialized,
    stats,
    
    // 方法
    loadAllEvents,
    loadEventStats,
    getEventByDifficulty,
    searchEvents,
    checkServerConnection,
    reset,
    
    // 计算属性
    eventCount: events.length,
    hasEvents: events.length > 0,
    isReady: initialized && !loading && !error,
  };
};

/**
 * 获取特定事件的Hook
 */
export const useEventDetail = (nanci: number) => {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (nanci < 1 || nanci > 81) {
      setError('难次必须在1-81之间');
      return;
    }

    const loadEvent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const eventData = await eventApiService.getEventByDifficulty(nanci);
        setEvent(eventData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取事件详情失败';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [nanci]);

  return {
    event,
    loading,
    error,
    isFound: event !== null,
  };
};
