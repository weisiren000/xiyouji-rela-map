/**
 * 西游记事件数据接口
 */
export interface JourneyEventData {
  id: number;
  nanci: number; // 难次
  nanming: string; // 难名
  zhuyaorenwu: string; // 主要人物
  didian: string; // 地点
  shijianmiaoshu: string; // 事件描述
  xiangzhengyi: string; // 象征意义
  wenhuaneihan: string; // 文化内涵
}

/**
 * API响应接口
 */
interface EventsApiResponse {
  success: boolean;
  data: JourneyEventData[];
  count: number;
  source: string;
  timestamp: string;
}

/**
 * 从API获取九九八十一难的事件数据
 */
export async function fetchJourneyEventsData(): Promise<JourneyEventData[]> {
  try {
    // 从后端API获取数据
    const response = await fetch('http://localhost:3003/api/events');
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const result: EventsApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error(`API返回错误: ${result}`);
    }
    
    console.log(`✅ 成功从API获取${result.count}个事件数据`);
    return result.data;
    
  } catch (error) {
    console.error('❌ 获取事件数据失败:', error);
    
    // 如果API获取失败，返回一个空数组或者默认数据
    console.warn('⚠️ 使用默认的事件数据结构');
    return generateDefaultEventData();
  }
}

/**
 * 生成默认的事件数据（当API不可用时使用）
 */
function generateDefaultEventData(): JourneyEventData[] {
  const events: JourneyEventData[] = [];
  
  for (let i = 1; i <= 81; i++) {
    events.push({
      id: i,
      nanci: i,
      nanming: `第${i}难`,
      zhuyaorenwu: '唐僧师徒',
      didian: '取经路上',
      shijianmiaoshu: `西游记第${i}难的事件描述`,
      xiangzhengyi: '修行路上的考验',
      wenhuaneihan: '佛教文化内涵'
    });
  }
  
  return events;
}
