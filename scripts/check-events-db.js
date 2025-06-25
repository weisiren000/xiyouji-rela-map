import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const dbPath = path.join(__dirname, '../data/events.db');
  const db = new Database(dbPath);
  
  // 查看所有表
  console.log('=== 数据库表结构 ===');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', tables.map(t => t.name));
  
  // 查看每个表的结构和数据
  for (const table of tables) {
    console.log(`\n=== 表: ${table.name} ===`);
    
    // 表结构
    const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log('字段:', schema.map(s => `${s.name}(${s.type})`).join(', '));
    
    // 数据统计
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log('记录数:', count.count);
    
    // 前5条数据
    if (count.count > 0) {
      const samples = db.prepare(`SELECT * FROM ${table.name} LIMIT 5`).all();
      console.log('示例数据:', JSON.stringify(samples, null, 2));
    }
  }
  
  db.close();
} catch (error) {
  console.error('数据库操作错误:', error.message);
}
