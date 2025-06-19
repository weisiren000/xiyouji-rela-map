/**
 * 数据库汉化脚本
 * 将SQLite数据库中的英文字段批量转换为中文
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseLocalizer {
  constructor(options = {}) {
    this.dbPath = options.dbPath || path.join(__dirname, '../../data/characters.db');
    this.db = null;
    this.dryRun = options.dryRun || false; // 是否只是预览，不实际修改
  }

  /**
   * 初始化数据库连接
   */
  initDatabase() {
    console.log('🔧 连接数据库...');
    console.log(`📍 数据库路径: ${this.dbPath}`);

    try {
      this.db = new Database(this.dbPath);
      console.log(`✅ 数据库连接成功`);

      // 测试数据库连接
      const testQuery = this.db.prepare('SELECT COUNT(*) as count FROM characters').get();
      console.log(`📊 数据库中有 ${testQuery.count} 个角色记录`);
    } catch (error) {
      console.error(`❌ 数据库连接失败:`, error);
      throw error;
    }
  }

  /**
   * 英文到中文的映射表
   */
  getLocalizationMaps() {
    return {
      // 角色类型映射
      category: {
        'protagonist': '主角',
        'antagonist': '反派',
        'deity': '神仙',
        'demon': '妖魔',
        'dragon': '龙族',
        'human': '人类',
        'celestial': '天庭',
        'buddhist': '佛教',
        'underworld': '地府',
        'immortal': '仙人',
        'unknown': '未知'
      },

      // 道德倾向映射
      morality: {
        'lawful_good': '守序善良',
        'neutral_good': '中立善良',
        'chaotic_good': '混乱善良',
        'lawful_neutral': '守序中立',
        'neutral': '绝对中立',
        'chaotic_neutral': '混乱中立',
        'lawful_evil': '守序邪恶',
        'neutral_evil': '中立邪恶',
        'chaotic_evil': '混乱邪恶'
      },

      // 等级类别映射 (在attributes JSON中)
      levelCategory: {
        'immortal': '仙人',
        'buddhist': '佛教',
        'demon': '妖魔',
        'dragon': '龙族',
        'human': '人类',
        'celestial': '天庭',
        'underworld': '地府'
      }
    };
  }

  /**
   * 分析当前数据库中的英文字段
   */
  analyzeCurrentData() {
    console.log('🔍 分析当前数据库中的英文字段...');
    
    const maps = this.getLocalizationMaps();
    const analysis = {
      category: {},
      morality: {},
      levelCategory: {},
      totalRecords: 0
    };

    // 分析基础表中的字段
    const characters = this.db.prepare('SELECT category, morality FROM characters').all();
    analysis.totalRecords = characters.length;

    characters.forEach(char => {
      // 统计category字段
      if (char.category) {
        analysis.category[char.category] = (analysis.category[char.category] || 0) + 1;
      }
      
      // 统计morality字段
      if (char.morality) {
        analysis.morality[char.morality] = (analysis.morality[char.morality] || 0) + 1;
      }
    });

    // 分析metadata表中的attributes JSON字段
    const metadata = this.db.prepare('SELECT attributes FROM character_metadata WHERE attributes IS NOT NULL').all();
    
    metadata.forEach(meta => {
      try {
        const attrs = JSON.parse(meta.attributes);
        if (attrs.level && attrs.level.category) {
          const levelCat = attrs.level.category;
          analysis.levelCategory[levelCat] = (analysis.levelCategory[levelCat] || 0) + 1;
        }
      } catch (error) {
        // 忽略JSON解析错误
      }
    });

    // 打印分析结果
    console.log('\n📊 数据分析结果:');
    console.log(`总记录数: ${analysis.totalRecords}`);
    
    console.log('\n🏷️ Category字段分布:');
    Object.entries(analysis.category).forEach(([key, count]) => {
      const chinese = maps.category[key] || '未映射';
      console.log(`  ${key} -> ${chinese}: ${count}条`);
    });

    console.log('\n⚖️ Morality字段分布:');
    Object.entries(analysis.morality).forEach(([key, count]) => {
      const chinese = maps.morality[key] || '未映射';
      console.log(`  ${key} -> ${chinese}: ${count}条`);
    });

    console.log('\n🎭 Level Category字段分布:');
    Object.entries(analysis.levelCategory).forEach(([key, count]) => {
      const chinese = maps.levelCategory[key] || '未映射';
      console.log(`  ${key} -> ${chinese}: ${count}条`);
    });

    return analysis;
  }

  /**
   * 汉化category字段
   */
  localizeCategoryField() {
    console.log('\n🔄 开始汉化category字段...');
    
    const maps = this.getLocalizationMaps();
    const updateStmt = this.db.prepare('UPDATE characters SET category = ? WHERE category = ?');
    
    let updateCount = 0;
    
    Object.entries(maps.category).forEach(([english, chinese]) => {
      if (this.dryRun) {
        const count = this.db.prepare('SELECT COUNT(*) as count FROM characters WHERE category = ?').get(english).count;
        if (count > 0) {
          console.log(`  [预览] ${english} -> ${chinese}: ${count}条记录`);
          updateCount += count;
        }
      } else {
        const result = updateStmt.run(chinese, english);
        if (result.changes > 0) {
          console.log(`  ✅ ${english} -> ${chinese}: ${result.changes}条记录`);
          updateCount += result.changes;
        }
      }
    });

    console.log(`${this.dryRun ? '[预览]' : '✅'} Category字段汉化完成，共${updateCount}条记录`);
    return updateCount;
  }

  /**
   * 汉化morality字段
   */
  localizeMoralityField() {
    console.log('\n🔄 开始汉化morality字段...');
    
    const maps = this.getLocalizationMaps();
    const updateStmt = this.db.prepare('UPDATE characters SET morality = ? WHERE morality = ?');
    
    let updateCount = 0;
    
    Object.entries(maps.morality).forEach(([english, chinese]) => {
      if (this.dryRun) {
        const count = this.db.prepare('SELECT COUNT(*) as count FROM characters WHERE morality = ?').get(english).count;
        if (count > 0) {
          console.log(`  [预览] ${english} -> ${chinese}: ${count}条记录`);
          updateCount += count;
        }
      } else {
        const result = updateStmt.run(chinese, english);
        if (result.changes > 0) {
          console.log(`  ✅ ${english} -> ${chinese}: ${result.changes}条记录`);
          updateCount += result.changes;
        }
      }
    });

    console.log(`${this.dryRun ? '[预览]' : '✅'} Morality字段汉化完成，共${updateCount}条记录`);
    return updateCount;
  }

  /**
   * 汉化attributes JSON中的level.category字段
   */
  localizeLevelCategoryField() {
    console.log('\n🔄 开始汉化level.category字段...');
    
    const maps = this.getLocalizationMaps();
    const selectStmt = this.db.prepare('SELECT unid, attributes FROM character_metadata WHERE attributes IS NOT NULL');
    const updateStmt = this.db.prepare('UPDATE character_metadata SET attributes = ? WHERE unid = ?');
    
    let updateCount = 0;
    const records = selectStmt.all();

    records.forEach(record => {
      try {
        const attrs = JSON.parse(record.attributes);
        
        if (attrs.level && attrs.level.category) {
          const originalCategory = attrs.level.category;
          const chineseCategory = maps.levelCategory[originalCategory];
          
          if (chineseCategory && chineseCategory !== originalCategory) {
            if (this.dryRun) {
              console.log(`  [预览] ${record.unid}: ${originalCategory} -> ${chineseCategory}`);
              updateCount++;
            } else {
              attrs.level.category = chineseCategory;
              const updatedJson = JSON.stringify(attrs);
              updateStmt.run(updatedJson, record.unid);
              console.log(`  ✅ ${record.unid}: ${originalCategory} -> ${chineseCategory}`);
              updateCount++;
            }
          }
        }
      } catch (error) {
        console.warn(`  ⚠️ 解析JSON失败: ${record.unid}`);
      }
    });

    console.log(`${this.dryRun ? '[预览]' : '✅'} Level Category字段汉化完成，共${updateCount}条记录`);
    return updateCount;
  }

  /**
   * 执行完整的汉化流程
   */
  async localize() {
    try {
      console.log('🎯 开始数据库汉化流程...');
      console.log(`模式: ${this.dryRun ? '预览模式（不会实际修改数据）' : '实际修改模式'}`);
      
      this.initDatabase();
      
      // 分析当前数据
      const analysis = this.analyzeCurrentData();
      
      // 执行汉化
      const categoryCount = this.localizeCategoryField();
      const moralityCount = this.localizeMoralityField();
      const levelCategoryCount = this.localizeLevelCategoryField();
      
      const totalUpdates = categoryCount + moralityCount + levelCategoryCount;
      
      console.log('\n🎉 汉化流程完成!');
      console.log(`📊 总计${this.dryRun ? '预计' : '实际'}更新: ${totalUpdates}条记录`);
      console.log(`  - Category字段: ${categoryCount}条`);
      console.log(`  - Morality字段: ${moralityCount}条`);
      console.log(`  - Level Category字段: ${levelCategoryCount}条`);
      
      if (this.dryRun) {
        console.log('\n💡 这是预览模式，数据未被实际修改');
        console.log('💡 要执行实际修改，请使用: node localize-database.js --execute');
      }
      
      return {
        totalUpdates,
        categoryCount,
        moralityCount,
        levelCategoryCount,
        analysis
      };
      
    } catch (error) {
      console.error('💥 汉化过程中发生错误:', error);
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
        console.log('🔒 数据库连接已关闭');
      }
    }
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const isExecuteMode = args.includes('--execute') || args.includes('-e');
const isDryRun = !isExecuteMode;

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🌏 数据库汉化工具');
  console.log('================');

  try {
    const localizer = new DatabaseLocalizer({ dryRun: isDryRun });
    localizer.localize().catch(error => {
      console.error('❌ 执行失败:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

export default DatabaseLocalizer;
