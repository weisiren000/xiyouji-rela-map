/**
 * 测试汉化脚本
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌏 数据库汉化工具测试');
console.log('================');

const dbPath = path.join(__dirname, '../../data/characters.db');
console.log(`📍 数据库路径: ${dbPath}`);

try {
  const db = new Database(dbPath);
  console.log('✅ 数据库连接成功');
  
  // 测试查询
  const count = db.prepare('SELECT COUNT(*) as count FROM characters').get();
  console.log(`📊 角色总数: ${count.count}`);
  
  // 查看category字段分布
  const categories = db.prepare('SELECT category, COUNT(*) as count FROM characters GROUP BY category').all();
  console.log('\n🏷️ Category字段分布:');
  categories.forEach(cat => {
    console.log(`  ${cat.category}: ${cat.count}条`);
  });
  
  // 查看morality字段分布
  const moralities = db.prepare('SELECT morality, COUNT(*) as count FROM characters GROUP BY morality').all();
  console.log('\n⚖️ Morality字段分布:');
  moralities.forEach(mor => {
    console.log(`  ${mor.morality}: ${mor.count}条`);
  });
  
  // 查看attributes中的level.category
  const metadata = db.prepare('SELECT attributes FROM character_metadata WHERE attributes IS NOT NULL LIMIT 5').all();
  console.log('\n🎭 Attributes样本:');
  metadata.forEach((meta, index) => {
    try {
      const attrs = JSON.parse(meta.attributes);
      if (attrs.level && attrs.level.category) {
        console.log(`  样本${index + 1}: level.category = ${attrs.level.category}`);
      }
    } catch (error) {
      console.log(`  样本${index + 1}: JSON解析失败`);
    }
  });
  
  db.close();
  console.log('\n✅ 测试完成');
  
} catch (error) {
  console.error('❌ 错误:', error);
}
