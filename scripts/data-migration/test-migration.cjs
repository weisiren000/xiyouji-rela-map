/**
 * 测试SQLite迁移脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始测试迁移...');

try {
  // 测试路径
  const jsonPath = path.join(__dirname, '../../docs/data/JSON/character');
  const dbPath = path.join(__dirname, '../../data/characters.db');
  
  console.log('📁 JSON路径:', jsonPath);
  console.log('🗄️ 数据库路径:', dbPath);
  
  // 检查JSON目录
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`JSON目录不存在: ${jsonPath}`);
  }
  
  // 读取文件列表
  const files = fs.readdirSync(jsonPath);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  console.log(`📊 找到 ${jsonFiles.length} 个JSON文件`);
  
  // 测试读取第一个文件
  if (jsonFiles.length > 0) {
    const firstFile = jsonFiles[0];
    const filePath = path.join(jsonPath, firstFile);
    console.log(`📖 测试读取文件: ${firstFile}`);
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    console.log('✅ JSON解析成功');
    console.log('📋 示例数据:');
    console.log(`  - unid: ${jsonData.unid}`);
    console.log(`  - name: ${jsonData.basic?.name}`);
    console.log(`  - pinyin: ${jsonData.basic?.pinyin}`);
    console.log(`  - category: ${jsonData.basic?.category}`);
  }
  
  // 测试SQLite模块
  console.log('🔧 测试SQLite模块...');
  const Database = require('better-sqlite3');
  console.log('✅ SQLite模块加载成功');
  
  // 创建测试数据库
  const testDb = new Database(':memory:');
  console.log('✅ 内存数据库创建成功');
  
  // 创建测试表
  testDb.exec(`
    CREATE TABLE test_table (
      id INTEGER PRIMARY KEY,
      name TEXT,
      value INTEGER
    )
  `);
  console.log('✅ 测试表创建成功');
  
  // 插入测试数据
  const insert = testDb.prepare('INSERT INTO test_table (name, value) VALUES (?, ?)');
  insert.run('test', 123);
  console.log('✅ 测试数据插入成功');
  
  // 查询测试数据
  const result = testDb.prepare('SELECT * FROM test_table').all();
  console.log('✅ 测试数据查询成功:', result);
  
  testDb.close();
  console.log('✅ 数据库关闭成功');
  
  console.log('🎉 所有测试通过！可以开始正式迁移');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  console.error('详细错误:', error);
}
