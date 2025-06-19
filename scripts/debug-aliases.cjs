/**
 * 调试别名数据问题
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🔍 开始调试别名数据问题...');

// 检查数据库中的别名数据
const dbPath = path.join(__dirname, '../data/characters.db');
const db = new Database(dbPath);

try {
  // 1. 检查数据库中is_alias字段的分布
  console.log('\n📊 检查is_alias字段分布:');
  const aliasDistribution = db.prepare(`
    SELECT is_alias, COUNT(*) as count 
    FROM characters 
    GROUP BY is_alias
  `).all();
  
  aliasDistribution.forEach(row => {
    console.log(`  is_alias = ${row.is_alias}: ${row.count} 个记录`);
  });

  // 2. 检查所有角色的is_alias和alias_of字段
  console.log('\n📋 检查前10个角色的别名相关字段:');
  const sampleData = db.prepare(`
    SELECT unid, name, is_alias, alias_of 
    FROM characters 
    LIMIT 10
  `).all();
  
  sampleData.forEach(row => {
    console.log(`  ${row.unid} - ${row.name} - is_alias:${row.is_alias} - alias_of:${row.alias_of || 'null'}`);
  });

  // 3. 检查原始JSON文件中是否有别名文件
  console.log('\n📁 检查原始JSON别名文件:');
  const aliasPath = path.join(__dirname, '../docs/data/JSON/character_alias');
  
  if (fs.existsSync(aliasPath)) {
    const aliasFiles = fs.readdirSync(aliasPath).filter(f => f.endsWith('.json'));
    console.log(`  找到 ${aliasFiles.length} 个别名文件`);
    
    if (aliasFiles.length > 0) {
      // 读取第一个别名文件看看结构
      const firstAliasFile = path.join(aliasPath, aliasFiles[0]);
      const aliasData = JSON.parse(fs.readFileSync(firstAliasFile, 'utf-8'));
      console.log(`  示例别名文件 ${aliasFiles[0]}:`);
      console.log(`    unid: ${aliasData.unid}`);
      console.log(`    name: ${aliasData.basic?.name}`);
      console.log(`    isAlias: ${aliasData.isAlias}`);
      console.log(`    aliasOf: ${aliasData.aliasOf}`);
    }
  } else {
    console.log('  ❌ 别名目录不存在');
  }

  // 4. 检查角色文件中的aliases字段
  console.log('\n🏷️ 检查角色文件中的aliases字段:');
  const characterPath = path.join(__dirname, '../docs/data/JSON/character');
  const characterFiles = fs.readdirSync(characterPath).filter(f => f.endsWith('.json'));
  
  let totalAliases = 0;
  for (let i = 0; i < Math.min(5, characterFiles.length); i++) {
    const file = characterFiles[i];
    const filePath = path.join(characterPath, file);
    const charData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const aliases = charData.basic?.aliases || [];
    totalAliases += aliases.length;
    
    console.log(`  ${file}: ${aliases.length} 个别名`);
    if (aliases.length > 0) {
      console.log(`    别名: ${aliases.slice(0, 3).join(', ')}${aliases.length > 3 ? '...' : ''}`);
    }
  }
  
  console.log(`  前5个角色文件总计: ${totalAliases} 个别名`);

} catch (error) {
  console.error('❌ 调试过程中发生错误:', error);
} finally {
  db.close();
}
