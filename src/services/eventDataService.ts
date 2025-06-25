import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 西游记事件数据接口 - 对应events.db的event表结构
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

/**
 * 事件数据服务类
 * 负责从SQLite数据库读取西游记八十一难的数据
 */
export class EventDataService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.resolve(__dirname, '../../data/events.db');
  }

  /**
   * 初始化数据库连接
   */
  private initDatabase(): Database.Database {
    if (!this.db) {
      try {
        this.db = new Database(this.dbPath);
        console.log('✅ Events数据库连接成功:', this.dbPath);
      } catch (error) {
        console.error('❌ Events数据库连接失败:', error);
        throw error;
      }
    }
    return this.db;
  }

  /**
   * 获取所有事件数据 (81难)
   */
  async getAllEvents(): Promise<EventData[]> {
    const db = this.initDatabase();
    try {
      const stmt = db.prepare('SELECT * FROM event ORDER BY nanci ASC');
      const events = stmt.all() as EventData[];
      
      console.log(`📚 成功读取 ${events.length} 个事件数据`);
      return events;
    } catch (error) {
      console.error('❌ 读取事件数据失败:', error);
      throw error;
    }
  }

  /**
   * 根据难次获取特定事件
   */
  async getEventByDifficulty(nanci: number): Promise<EventData | null> {
    const db = this.initDatabase();
    try {
      const stmt = db.prepare('SELECT * FROM event WHERE nanci = ?');
      const event = stmt.get(nanci) as EventData | undefined;
      
      return event || null;
    } catch (error) {
      console.error(`❌ 读取第${nanci}难数据失败:`, error);
      return null;
    }
  }

  /**
   * 搜索事件 (支持难名、人物、地点搜索)
   */
  async searchEvents(keyword: string): Promise<EventData[]> {
    const db = this.initDatabase();
    try {
      const stmt = db.prepare(`
        SELECT * FROM event 
        WHERE nanming LIKE ? 
           OR zhuyaorenwu LIKE ? 
           OR didian LIKE ? 
           OR shijianmiaoshu LIKE ?
        ORDER BY nanci ASC
      `);
      
      const searchTerm = `%${keyword}%`;
      const events = stmt.all(searchTerm, searchTerm, searchTerm, searchTerm) as EventData[];
      
      console.log(`🔍 搜索"${keyword}"找到 ${events.length} 个结果`);
      return events;
    } catch (error) {
      console.error('❌ 搜索事件数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取事件统计信息
   */
  async getEventStats(): Promise<{
    totalEvents: number;
    uniqueLocations: number;
    averageDescriptionLength: number;
  }> {
    const db = this.initDatabase();
    try {
      const totalStmt = db.prepare('SELECT COUNT(*) as count FROM event');
      const total = totalStmt.get() as { count: number };

      const locationsStmt = db.prepare('SELECT COUNT(DISTINCT didian) as count FROM event');
      const locations = locationsStmt.get() as { count: number };

      const avgLengthStmt = db.prepare('SELECT AVG(LENGTH(shijianmiaoshu)) as avgLength FROM event');
      const avgLength = avgLengthStmt.get() as { avgLength: number };

      return {
        totalEvents: total.count,
        uniqueLocations: locations.count,
        averageDescriptionLength: Math.round(avgLength.avgLength || 0),
      };
    } catch (error) {
      console.error('❌ 获取事件统计失败:', error);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('🔒 Events数据库连接已关闭');
    }
  }
}

// 导出单例实例
export const eventDataService = new EventDataService();
