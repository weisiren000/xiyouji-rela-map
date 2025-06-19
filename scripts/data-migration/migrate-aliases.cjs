/**
 * 补充迁移别名数据到SQLite数据库
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function migrateAliases() {
  console.log('🎯 开始迁移别名数据...');
  
  // 路径配置
  const aliasPath = path.join(__dirname, '../../docs/data/JSON/character_alias');
  const dbPath = path.join(__dirname, '../../data/characters.db');
  
  console.log('📁 别名路径:', aliasPath);
  console.log('🗄️ 数据库路径:', dbPath);
  
  // 检查别名目录是否存在
  if (!fs.existsSync(aliasPath)) {
    console.error('❌ 别名目录不存在:', aliasPath);
    return;
  }
  
  // 初始化数据库
  console.log('🔧 连接SQLite数据库...');
  const db = new Database(dbPath);
  
  try {
    // 读取别名文件
    console.log('🚀 开始迁移别名数据...');
    const files = fs.readdirSync(aliasPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    console.log(`📊 找到 ${jsonFiles.length} 个别名文件`);
    
    // 准备插入语句
    const insertCharacter = db.prepare(`
      INSERT OR REPLACE INTO characters 
      (unid, name, pinyin, type, category, rank, power, influence, morality, first_appearance, is_alias, alias_of)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMetadata = db.prepare(`
      INSERT OR REPLACE INTO character_metadata 
      (unid, aliases, tags, source_chapters, attributes, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let successCount = 0;
    let errorCount = 0;

    // 开始事务
    const transaction = db.transaction(() => {
      for (const fileName of jsonFiles) {
        try {
          const filePath = path.join(aliasPath, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const jsonData = JSON.parse(fileContent);
          
          // 转换数据
          const basic = jsonData.basic || {};
          const attributes = jsonData.attributes || {};
          const metadata = jsonData.metadata || {};

          // 基础信息
          const characterData = {
            unid: jsonData.unid || '',
            name: basic.name || '',
            pinyin: basic.pinyin || '',
            type: basic.type || 'character_alias',
            category: basic.category || 'alias',
            rank: attributes.rank || 0,
            power: attributes.power || 0,
            influence: attributes.influence || 0,
            morality: attributes.morality || 'neutral',
            first_appearance: metadata.firstAppearance || 0,
            is_alias: jsonData.isAlias ? 1 : 0,
            alias_of: metadata.originalCharacter || null  // 这里是关键！
          };

          // 扩展信息
          const metadataData = {
            unid: jsonData.unid || '',
            aliases: JSON.stringify(basic.aliases || []),
            tags: JSON.stringify(metadata.tags || []),
            source_chapters: JSON.stringify(metadata.sourceChapters || []),
            attributes: JSON.stringify(attributes),
            description: metadata.description || ''
          };
          
          // 插入基础数据
          insertCharacter.run(
            characterData.unid,
            characterData.name,
            characterData.pinyin,
            characterData.type,
            characterData.category,
            characterData.rank,
            characterData.power,
            characterData.influence,
            characterData.morality,
            characterData.first_appearance,
            characterData.is_alias,
            characterData.alias_of
          );

          // 插入扩展数据
          insertMetadata.run(
            metadataData.unid,
            metadataData.aliases,
            metadataData.tags,
            metadataData.source_chapters,
            metadataData.attributes,
            metadataData.description
          );

          successCount++;
          
          if (successCount % 10 === 0) {
            console.log(`📈 已迁移 ${successCount} 个别名...`);
          }
          
        } catch (error) {
          console.error(`❌ 迁移失败: ${fileName}`, error.message);
          errorCount++;
        }
      }
    });

    // 执行事务
    transaction();

    console.log(`✅ 别名迁移完成! 成功: ${successCount}, 失败: ${errorCount}`);
    
    // 验证迁移结果
    console.log('🔍 验证别名迁移结果...');
    
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM characters').get().count;
    const aliasCount = db.prepare('SELECT COUNT(*) as count FROM characters WHERE is_alias = 1').get().count;
    const characterCount = db.prepare('SELECT COUNT(*) as count FROM characters WHERE is_alias = 0').get().count;
    
    console.log(`📊 总记录数: ${totalCount}`);
    console.log(`📊 角色数量: ${characterCount}`);
    console.log(`📊 别名数量: ${aliasCount}`);
    
    // 检查别名关联
    const aliasWithoutOriginal = db.prepare(`
      SELECT unid, name, alias_of 
      FROM characters 
      WHERE is_alias = 1 AND alias_of IS NULL
    `).all();
    
    if (aliasWithoutOriginal.length > 0) {
      console.warn(`⚠️ 发现 ${aliasWithoutOriginal.length} 个别名没有关联原角色`);
    } else {
      console.log('✅ 所有别名都正确关联到原角色');
    }
    
    // 显示一些示例别名数据
    const sampleAliases = db.prepare(`
      SELECT name, pinyin, alias_of 
      FROM characters 
      WHERE is_alias = 1 
      LIMIT 5
    `).all();
    
    console.log('📋 示例别名数据:');
    sampleAliases.forEach(alias => {
      console.log(`  - ${alias.name} (${alias.pinyin}) -> 原角色: ${alias.alias_of}`);
    });
    
    console.log('🎉 别名数据迁移完成!');
    console.log(`📍 数据库文件位置: ${dbPath}`);
    
    // 显示数据库文件大小
    const stats = fs.statSync(dbPath);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`📏 数据库文件大小: ${fileSizeMB} MB`);
    
    return { successCount, errorCount, totalCount, characterCount, aliasCount };
    
  } catch (error) {
    console.error('💥 别名迁移过程中发生错误:', error);
    throw error;
  } finally {
    db.close();
  }
}

// 执行别名迁移
try {
  migrateAliases();
} catch (error) {
  console.error('别名迁移失败:', error);
  process.exit(1);
}
