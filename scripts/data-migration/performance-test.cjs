/**
 * 性能对比测试脚本
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function testJsonPerformance() {
  console.log('📁 测试JSON文件存储性能...');
  
  const jsonPath = path.join(__dirname, '../../docs/data/JSON/character');
  const results = {};
  
  // 测试1: 加载所有角色
  const loadStart = Date.now();
  const files = fs.readdirSync(jsonPath);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const characters = [];
  
  for (const file of jsonFiles) {
    const content = fs.readFileSync(path.join(jsonPath, file), 'utf-8');
    characters.push(JSON.parse(content));
  }
  results.loadAll = Date.now() - loadStart;
  console.log(`  📊 加载 ${characters.length} 个角色: ${results.loadAll}ms`);

  // 测试2: 按名称搜索
  const searchStart = Date.now();
  const searchResults = characters.filter(char => 
    char.basic.name.includes('孙') || 
    char.basic.pinyin.includes('sun')
  );
  results.searchByName = Date.now() - searchStart;
  console.log(`  🔍 按名称搜索: ${results.searchByName}ms (${searchResults.length} 条结果)`);

  // 测试3: 按类型过滤
  const filterStart = Date.now();
  const filterResults = characters.filter(char => char.basic.category === 'protagonist');
  results.filterByType = Date.now() - filterStart;
  console.log(`  🏷️ 按类型过滤: ${results.filterByType}ms (${filterResults.length} 条结果)`);

  // 测试4: 按等级排序
  const sortStart = Date.now();
  characters.sort((a, b) => (a.attributes.rank || 0) - (b.attributes.rank || 0));
  results.sortByRank = Date.now() - sortStart;
  console.log(`  📈 按等级排序: ${results.sortByRank}ms`);

  // 测试5: 获取最强角色
  const topStart = Date.now();
  const topResults = characters
    .sort((a, b) => (b.attributes.power || 0) - (a.attributes.power || 0))
    .slice(0, 10);
  results.getTopPowerful = Date.now() - topStart;
  console.log(`  💪 获取最强角色: ${results.getTopPowerful}ms (${topResults.length} 条结果)`);

  return { type: 'JSON', results, totalCharacters: characters.length };
}

function testSqlitePerformance() {
  console.log('🗄️ 测试SQLite数据库性能...');
  
  const dbPath = path.join(__dirname, '../../data/characters.db');
  const db = new Database(dbPath);
  const results = {};

  try {
    // 测试1: 加载所有角色
    const loadStart = Date.now();
    const allCharacters = db.prepare(`
      SELECT c.*, m.aliases, m.tags, m.description, m.attributes
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid
    `).all();
    results.loadAll = Date.now() - loadStart;
    console.log(`  📊 加载 ${allCharacters.length} 个角色: ${results.loadAll}ms`);

    // 测试2: 按名称搜索
    const searchStart = Date.now();
    const searchResults = db.prepare(`
      SELECT * FROM characters 
      WHERE name LIKE ? OR pinyin LIKE ?
    `).all('%孙%', '%sun%');
    results.searchByName = Date.now() - searchStart;
    console.log(`  🔍 按名称搜索: ${results.searchByName}ms (${searchResults.length} 条结果)`);

    // 测试3: 按类型过滤
    const filterStart = Date.now();
    const filterResults = db.prepare(`
      SELECT * FROM characters WHERE category = ?
    `).all('protagonist');
    results.filterByType = Date.now() - filterStart;
    console.log(`  🏷️ 按类型过滤: ${results.filterByType}ms (${filterResults.length} 条结果)`);

    // 测试4: 按等级排序
    const sortStart = Date.now();
    const sortResults = db.prepare(`
      SELECT * FROM characters ORDER BY rank
    `).all();
    results.sortByRank = Date.now() - sortStart;
    console.log(`  📈 按等级排序: ${results.sortByRank}ms (${sortResults.length} 条结果)`);

    // 测试5: 获取最强角色
    const topStart = Date.now();
    const topResults = db.prepare(`
      SELECT * FROM characters ORDER BY power DESC LIMIT 10
    `).all();
    results.getTopPowerful = Date.now() - topStart;
    console.log(`  💪 获取最强角色: ${results.getTopPowerful}ms (${topResults.length} 条结果)`);

    // 测试6: 复杂查询
    const complexStart = Date.now();
    const complexResults = db.prepare(`
      SELECT c.name, c.rank, c.power, m.description
      FROM characters c
      JOIN character_metadata m ON c.unid = m.unid
      WHERE c.power > 80 AND c.category = 'protagonist'
      ORDER BY c.power DESC
    `).all();
    results.complexQuery = Date.now() - complexStart;
    console.log(`  🔗 复杂联合查询: ${results.complexQuery}ms (${complexResults.length} 条结果)`);

    return { type: 'SQLite', results, totalCharacters: allCharacters.length };

  } finally {
    db.close();
  }
}

function generateReport(jsonResults, sqliteResults) {
  console.log('\n📊 性能对比报告');
  console.log('='.repeat(50));
  
  const operations = ['loadAll', 'searchByName', 'filterByType', 'sortByRank', 'getTopPowerful'];
  
  console.log('\n⚡ 操作性能对比:');
  operations.forEach(op => {
    const jsonTime = jsonResults.results[op];
    const sqliteTime = sqliteResults.results[op];
    const improvement = Math.round((jsonTime - sqliteTime) / jsonTime * 100);
    const speedup = Math.round(jsonTime / sqliteTime * 10) / 10;
    
    console.log(`  ${op}:`);
    console.log(`    JSON: ${jsonTime}ms`);
    console.log(`    SQLite: ${sqliteTime}ms`);
    console.log(`    提升: ${improvement}% (${speedup}x 倍速)`);
    console.log('');
  });
  
  // 计算平均提升
  const avgImprovement = operations.reduce((sum, op) => {
    const jsonTime = jsonResults.results[op];
    const sqliteTime = sqliteResults.results[op];
    return sum + (jsonTime - sqliteTime) / jsonTime * 100;
  }, 0) / operations.length;
  
  console.log('🎯 总结:');
  console.log(`  平均性能提升: ${Math.round(avgImprovement)}%`);
  
  if (avgImprovement > 50) {
    console.log('  ✅ 性能提升显著，迁移非常成功！');
  } else if (avgImprovement > 20) {
    console.log('  ⚡ 性能有明显提升，迁移成功！');
  } else {
    console.log('  🤔 性能提升有限，需要进一步优化');
  }
  
  // 文件大小对比
  console.log('\n📏 存储空间对比:');
  const jsonPath = path.join(__dirname, '../../docs/data/JSON/character');
  const dbPath = path.join(__dirname, '../../data/characters.db');
  
  // 计算JSON文件总大小
  const files = fs.readdirSync(jsonPath);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  let totalJsonSize = 0;
  
  for (const file of jsonFiles) {
    const stats = fs.statSync(path.join(jsonPath, file));
    totalJsonSize += stats.size;
  }
  
  // SQLite文件大小
  const dbStats = fs.statSync(dbPath);
  const sqliteSize = dbStats.size;
  
  const jsonSizeMB = (totalJsonSize / 1024 / 1024).toFixed(2);
  const sqliteSizeMB = (sqliteSize / 1024 / 1024).toFixed(2);
  const sizeReduction = Math.round((totalJsonSize - sqliteSize) / totalJsonSize * 100);
  
  console.log(`  JSON文件总大小: ${jsonSizeMB}MB (${jsonFiles.length} 个文件)`);
  console.log(`  SQLite文件大小: ${sqliteSizeMB}MB`);
  console.log(`  空间减少: ${sizeReduction}%`);
}

// 执行性能测试
try {
  console.log('🚀 开始性能对比测试...\n');
  
  const jsonResults = testJsonPerformance();
  console.log('');
  
  const sqliteResults = testSqlitePerformance();
  
  generateReport(jsonResults, sqliteResults);
  
} catch (error) {
  console.error('💥 性能测试过程中发生错误:', error);
}
