/**
 * 数据存储方案性能对比测试
 * 对比JSON文件存储 vs SQLite存储的性能差异
 */

const fs = require('fs').promises;
const path = require('path');
const Database = require('better-sqlite3');

class PerformanceComparator {
  constructor() {
    this.jsonPath = 'D:\\codee\\xiyouji-rela-map\\docs\\data\\JSON\\character';
    this.dbPath = 'D:\\codee\\xiyouji-rela-map\\data\\characters.db';
    this.testResults = [];
  }

  /**
   * JSON文件存储性能测试
   */
  async testJsonPerformance() {
    console.log('📁 测试JSON文件存储性能...');
    
    const tests = {
      loadAll: async () => {
        const files = await fs.readdir(this.jsonPath);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const characters = [];
        
        for (const file of jsonFiles) {
          const content = await fs.readFile(path.join(this.jsonPath, file), 'utf-8');
          characters.push(JSON.parse(content));
        }
        
        return characters;
      },

      searchByName: async (characters, searchTerm) => {
        return characters.filter(char => 
          char.basic.name.includes(searchTerm) || 
          char.basic.pinyin.includes(searchTerm)
        );
      },

      filterByType: async (characters, type) => {
        return characters.filter(char => char.basic.category === type);
      },

      sortByRank: async (characters) => {
        return characters.sort((a, b) => (a.attributes.rank || 0) - (b.attributes.rank || 0));
      },

      getTopPowerful: async (characters, limit = 10) => {
        return characters
          .sort((a, b) => (b.attributes.power || 0) - (a.attributes.power || 0))
          .slice(0, limit);
      }
    };

    const results = {};
    
    // 加载所有数据
    const start = Date.now();
    const allCharacters = await tests.loadAll();
    results.loadAll = Date.now() - start;
    
    console.log(`  📊 加载 ${allCharacters.length} 个角色: ${results.loadAll}ms`);

    // 搜索测试
    const searchStart = Date.now();
    const searchResults = await tests.searchByName(allCharacters, '孙');
    results.searchByName = Date.now() - searchStart;
    console.log(`  🔍 按名称搜索: ${results.searchByName}ms (${searchResults.length} 条结果)`);

    // 类型过滤测试
    const filterStart = Date.now();
    const filterResults = await tests.filterByType(allCharacters, 'protagonist');
    results.filterByType = Date.now() - filterStart;
    console.log(`  🏷️ 按类型过滤: ${results.filterByType}ms (${filterResults.length} 条结果)`);

    // 排序测试
    const sortStart = Date.now();
    await tests.sortByRank(allCharacters);
    results.sortByRank = Date.now() - sortStart;
    console.log(`  📈 按等级排序: ${results.sortByRank}ms`);

    // 获取最强角色测试
    const topStart = Date.now();
    const topResults = await tests.getTopPowerful(allCharacters, 10);
    results.getTopPowerful = Date.now() - topStart;
    console.log(`  💪 获取最强角色: ${results.getTopPowerful}ms (${topResults.length} 条结果)`);

    return { type: 'JSON', results, totalCharacters: allCharacters.length };
  }

  /**
   * SQLite数据库性能测试
   */
  async testSqlitePerformance() {
    console.log('🗄️ 测试SQLite数据库性能...');
    
    const db = new Database(this.dbPath);
    const results = {};

    try {
      // 加载所有数据测试
      const loadStart = Date.now();
      const allCharacters = db.prepare(`
        SELECT c.*, m.aliases, m.tags, m.description, m.attributes
        FROM characters c 
        LEFT JOIN character_metadata m ON c.unid = m.unid
      `).all();
      results.loadAll = Date.now() - loadStart;
      console.log(`  📊 加载 ${allCharacters.length} 个角色: ${results.loadAll}ms`);

      // 搜索测试
      const searchStart = Date.now();
      const searchResults = db.prepare(`
        SELECT * FROM characters 
        WHERE name LIKE ? OR pinyin LIKE ?
      `).all('%孙%', '%sun%');
      results.searchByName = Date.now() - searchStart;
      console.log(`  🔍 按名称搜索: ${results.searchByName}ms (${searchResults.length} 条结果)`);

      // 类型过滤测试
      const filterStart = Date.now();
      const filterResults = db.prepare(`
        SELECT * FROM characters WHERE category = ?
      `).all('protagonist');
      results.filterByType = Date.now() - filterStart;
      console.log(`  🏷️ 按类型过滤: ${results.filterByType}ms (${filterResults.length} 条结果)`);

      // 排序测试
      const sortStart = Date.now();
      const sortResults = db.prepare(`
        SELECT * FROM characters ORDER BY rank
      `).all();
      results.sortByRank = Date.now() - sortStart;
      console.log(`  📈 按等级排序: ${results.sortByRank}ms (${sortResults.length} 条结果)`);

      // 获取最强角色测试
      const topStart = Date.now();
      const topResults = db.prepare(`
        SELECT * FROM characters ORDER BY power DESC LIMIT 10
      `).all();
      results.getTopPowerful = Date.now() - topStart;
      console.log(`  💪 获取最强角色: ${results.getTopPowerful}ms (${topResults.length} 条结果)`);

      // 复杂查询测试
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

  /**
   * 内存使用测试
   */
  async testMemoryUsage() {
    console.log('💾 测试内存使用情况...');
    
    const getMemoryUsage = () => {
      const usage = process.memoryUsage();
      return {
        rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100,
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100
      };
    };

    // 基准内存使用
    const baseline = getMemoryUsage();
    console.log(`  📊 基准内存使用: ${baseline.heapUsed}MB`);

    // JSON加载内存测试
    const beforeJson = getMemoryUsage();
    const files = await fs.readdir(this.jsonPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const characters = [];
    
    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(this.jsonPath, file), 'utf-8');
      characters.push(JSON.parse(content));
    }
    
    const afterJson = getMemoryUsage();
    const jsonMemoryDiff = afterJson.heapUsed - beforeJson.heapUsed;
    console.log(`  📁 JSON加载后内存增加: ${jsonMemoryDiff}MB`);

    // 清理内存
    characters.length = 0;
    global.gc && global.gc();

    // SQLite内存测试
    const beforeSqlite = getMemoryUsage();
    const db = new Database(this.dbPath);
    const sqliteCharacters = db.prepare(`
      SELECT c.*, m.aliases, m.tags, m.description, m.attributes
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid
    `).all();
    const afterSqlite = getMemoryUsage();
    const sqliteMemoryDiff = afterSqlite.heapUsed - beforeSqlite.heapUsed;
    console.log(`  🗄️ SQLite加载后内存增加: ${sqliteMemoryDiff}MB`);
    
    db.close();

    return {
      baseline: baseline.heapUsed,
      jsonMemoryUsage: jsonMemoryDiff,
      sqliteMemoryUsage: sqliteMemoryDiff,
      memoryReduction: Math.round((jsonMemoryDiff - sqliteMemoryDiff) / jsonMemoryDiff * 100)
    };
  }

  /**
   * 文件大小对比
   */
  async testFileSize() {
    console.log('📏 测试文件大小...');
    
    // JSON文件总大小
    const files = await fs.readdir(this.jsonPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    let totalJsonSize = 0;
    
    for (const file of jsonFiles) {
      const stats = await fs.stat(path.join(this.jsonPath, file));
      totalJsonSize += stats.size;
    }
    
    // SQLite文件大小
    const dbStats = await fs.stat(this.dbPath);
    const sqliteSize = dbStats.size;
    
    const jsonSizeMB = Math.round(totalJsonSize / 1024 / 1024 * 100) / 100;
    const sqliteSizeMB = Math.round(sqliteSize / 1024 / 1024 * 100) / 100;
    const sizeReduction = Math.round((totalJsonSize - sqliteSize) / totalJsonSize * 100);
    
    console.log(`  📁 JSON文件总大小: ${jsonSizeMB}MB (${jsonFiles.length} 个文件)`);
    console.log(`  🗄️ SQLite文件大小: ${sqliteSizeMB}MB`);
    console.log(`  📉 文件大小减少: ${sizeReduction}%`);
    
    return {
      jsonSize: totalJsonSize,
      sqliteSize: sqliteSize,
      jsonSizeMB,
      sqliteSizeMB,
      sizeReduction
    };
  }

  /**
   * 生成性能报告
   */
  generateReport(jsonResults, sqliteResults, memoryResults, sizeResults) {
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
    
    console.log('💾 内存使用对比:');
    console.log(`  JSON: ${memoryResults.jsonMemoryUsage}MB`);
    console.log(`  SQLite: ${memoryResults.sqliteMemoryUsage}MB`);
    console.log(`  内存减少: ${memoryResults.memoryReduction}%`);
    console.log('');
    
    console.log('📏 存储空间对比:');
    console.log(`  JSON: ${sizeResults.jsonSizeMB}MB`);
    console.log(`  SQLite: ${sizeResults.sqliteSizeMB}MB`);
    console.log(`  空间减少: ${sizeResults.sizeReduction}%`);
    console.log('');
    
    console.log('🎯 总结建议:');
    const avgImprovement = operations.reduce((sum, op) => {
      const jsonTime = jsonResults.results[op];
      const sqliteTime = sqliteResults.results[op];
      return sum + (jsonTime - sqliteTime) / jsonTime * 100;
    }, 0) / operations.length;
    
    console.log(`  平均性能提升: ${Math.round(avgImprovement)}%`);
    console.log(`  内存使用减少: ${memoryResults.memoryReduction}%`);
    console.log(`  存储空间减少: ${sizeResults.sizeReduction}%`);
    
    if (avgImprovement > 30) {
      console.log('  ✅ 强烈推荐迁移到SQLite');
    } else if (avgImprovement > 10) {
      console.log('  ⚡ 建议考虑迁移到SQLite');
    } else {
      console.log('  🤔 性能提升有限，需要综合考虑');
    }
  }

  /**
   * 执行完整的性能对比测试
   */
  async runComparison() {
    try {
      console.log('🚀 开始性能对比测试...\n');
      
      const jsonResults = await this.testJsonPerformance();
      console.log('');
      
      const sqliteResults = await this.testSqlitePerformance();
      console.log('');
      
      const memoryResults = await this.testMemoryUsage();
      console.log('');
      
      const sizeResults = await this.testFileSize();
      
      this.generateReport(jsonResults, sqliteResults, memoryResults, sizeResults);
      
      return {
        json: jsonResults,
        sqlite: sqliteResults,
        memory: memoryResults,
        size: sizeResults
      };
      
    } catch (error) {
      console.error('💥 性能测试过程中发生错误:', error);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const comparator = new PerformanceComparator();
  comparator.runComparison().catch(console.error);
}

module.exports = PerformanceComparator;
