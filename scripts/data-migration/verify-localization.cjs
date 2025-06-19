/**
 * 验证数据库汉化结果
 * 检查SQLite数据库中的中文字段是否正确
 */

const Database = require('better-sqlite3');
const path = require('path');

class LocalizationVerifier {
  constructor(options = {}) {
    this.dbPath = options.dbPath || path.join(__dirname, '../../data/characters.db');
    this.db = null;
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
   * 验证category字段汉化
   */
  verifyCategoryLocalization() {
    console.log('\n🔍 验证Category字段汉化结果...');
    
    const categories = this.db.prepare('SELECT category, COUNT(*) as count FROM characters GROUP BY category ORDER BY count DESC').all();
    
    const chineseCategories = ['主角', '神仙', '反派', '仙人', '妖魔', '龙族', '人类', '佛教', '天庭', '地府', '别名'];
    const englishCategories = ['protagonist', 'deity', 'antagonist', 'immortal', 'demon', 'dragon', 'human', 'buddhist', 'celestial', 'underworld', 'alias'];
    
    let chineseCount = 0;
    let englishCount = 0;
    let otherCount = 0;
    
    console.log('Category字段分布:');
    categories.forEach(cat => {
      if (chineseCategories.includes(cat.category)) {
        chineseCount += cat.count;
        console.log(`  ✅ ${cat.category}: ${cat.count}条 (已汉化)`);
      } else if (englishCategories.includes(cat.category)) {
        englishCount += cat.count;
        console.log(`  ❌ ${cat.category}: ${cat.count}条 (未汉化)`);
      } else {
        otherCount += cat.count;
        console.log(`  ⚠️ ${cat.category}: ${cat.count}条 (其他)`);
      }
    });
    
    console.log(`\n📊 Category字段汉化统计:`);
    console.log(`  已汉化: ${chineseCount}条`);
    console.log(`  未汉化: ${englishCount}条`);
    console.log(`  其他: ${otherCount}条`);
    
    return { chineseCount, englishCount, otherCount };
  }

  /**
   * 验证morality字段汉化
   */
  verifyMoralityLocalization() {
    console.log('\n🔍 验证Morality字段汉化结果...');
    
    const moralities = this.db.prepare('SELECT morality, COUNT(*) as count FROM characters GROUP BY morality ORDER BY count DESC').all();
    
    const chineseMoralities = ['守序善良', '中立善良', '混乱善良', '守序中立', '绝对中立', '混乱中立', '守序邪恶', '中立邪恶', '混乱邪恶', '至善'];
    const englishMoralities = ['lawful_good', 'neutral_good', 'chaotic_good', 'lawful_neutral', 'neutral', 'chaotic_neutral', 'lawful_evil', 'neutral_evil', 'chaotic_evil', 'true_neutral'];
    
    let chineseCount = 0;
    let englishCount = 0;
    let otherCount = 0;
    
    console.log('Morality字段分布:');
    moralities.forEach(mor => {
      if (chineseMoralities.includes(mor.morality)) {
        chineseCount += mor.count;
        console.log(`  ✅ ${mor.morality}: ${mor.count}条 (已汉化)`);
      } else if (englishMoralities.includes(mor.morality)) {
        englishCount += mor.count;
        console.log(`  ❌ ${mor.morality}: ${mor.count}条 (未汉化)`);
      } else {
        otherCount += mor.count;
        console.log(`  ⚠️ ${mor.morality}: ${mor.count}条 (其他)`);
      }
    });
    
    console.log(`\n📊 Morality字段汉化统计:`);
    console.log(`  已汉化: ${chineseCount}条`);
    console.log(`  未汉化: ${englishCount}条`);
    console.log(`  其他: ${otherCount}条`);
    
    return { chineseCount, englishCount, otherCount };
  }

  /**
   * 验证level.category字段汉化
   */
  verifyLevelCategoryLocalization() {
    console.log('\n🔍 验证Level Category字段汉化结果...');
    
    const metadata = this.db.prepare('SELECT attributes FROM character_metadata WHERE attributes IS NOT NULL').all();
    
    const chineseLevelCategories = ['仙人', '佛教', '妖魔', '龙族', '人类', '天庭', '地府', '神圣', '佛陀', '道教', '菩萨', '罗汉', '山神', '时间', '守护', '圣人', '神兽', '凡人', '皇室'];
    const englishLevelCategories = ['immortal', 'buddhist', 'demon', 'dragon', 'human', 'celestial', 'underworld', 'divine', 'buddha', 'taoist', 'bodhisattva', 'arhat', 'mountain', 'time', 'guardian', 'sage', 'beast', 'mortal', 'royal'];
    
    const levelCategoryStats = {};
    let chineseCount = 0;
    let englishCount = 0;
    let otherCount = 0;
    
    metadata.forEach(meta => {
      try {
        const attrs = JSON.parse(meta.attributes);
        if (attrs.level && attrs.level.category) {
          const levelCat = attrs.level.category;
          levelCategoryStats[levelCat] = (levelCategoryStats[levelCat] || 0) + 1;
        }
      } catch (error) {
        // 忽略JSON解析错误
      }
    });
    
    console.log('Level Category字段分布:');
    Object.entries(levelCategoryStats).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
      if (chineseLevelCategories.includes(category)) {
        chineseCount += count;
        console.log(`  ✅ ${category}: ${count}条 (已汉化)`);
      } else if (englishLevelCategories.includes(category)) {
        englishCount += count;
        console.log(`  ❌ ${category}: ${count}条 (未汉化)`);
      } else {
        otherCount += count;
        console.log(`  ⚠️ ${category}: ${count}条 (其他)`);
      }
    });
    
    console.log(`\n📊 Level Category字段汉化统计:`);
    console.log(`  已汉化: ${chineseCount}条`);
    console.log(`  未汉化: ${englishCount}条`);
    console.log(`  其他: ${otherCount}条`);
    
    return { chineseCount, englishCount, otherCount };
  }

  /**
   * 生成汉化报告
   */
  generateReport() {
    console.log('\n📋 生成汉化验证报告...');
    
    const categoryResult = this.verifyCategoryLocalization();
    const moralityResult = this.verifyMoralityLocalization();
    const levelCategoryResult = this.verifyLevelCategoryLocalization();
    
    const totalChinese = categoryResult.chineseCount + moralityResult.chineseCount + levelCategoryResult.chineseCount;
    const totalEnglish = categoryResult.englishCount + moralityResult.englishCount + levelCategoryResult.englishCount;
    const totalOther = categoryResult.otherCount + moralityResult.otherCount + levelCategoryResult.otherCount;
    const totalRecords = totalChinese + totalEnglish + totalOther;
    
    console.log('\n🎯 汉化验证总结:');
    console.log('================');
    console.log(`📊 总记录数: ${totalRecords}`);
    console.log(`✅ 已汉化: ${totalChinese}条 (${(totalChinese/totalRecords*100).toFixed(1)}%)`);
    console.log(`❌ 未汉化: ${totalEnglish}条 (${(totalEnglish/totalRecords*100).toFixed(1)}%)`);
    console.log(`⚠️ 其他: ${totalOther}条 (${(totalOther/totalRecords*100).toFixed(1)}%)`);
    
    if (totalEnglish === 0) {
      console.log('\n🎉 恭喜！所有英文字段都已成功汉化！');
    } else {
      console.log(`\n⚠️ 还有 ${totalEnglish} 条记录需要汉化`);
    }
    
    return {
      totalRecords,
      totalChinese,
      totalEnglish,
      totalOther,
      categoryResult,
      moralityResult,
      levelCategoryResult
    };
  }

  /**
   * 执行验证流程
   */
  async verify() {
    try {
      console.log('🎯 开始验证数据库汉化结果...');
      
      this.initDatabase();
      const report = this.generateReport();
      
      console.log('\n✅ 验证完成!');
      return report;
      
    } catch (error) {
      console.error('💥 验证过程中发生错误:', error);
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
        console.log('🔒 数据库连接已关闭');
      }
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('🔍 数据库汉化验证工具');
  console.log('==================');
  
  const verifier = new LocalizationVerifier();
  verifier.verify().catch(error => {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  });
}

module.exports = LocalizationVerifier;
