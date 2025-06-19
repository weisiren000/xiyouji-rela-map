/**
 * 修复版JSON到SQLite数据迁移脚本
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function migrateData() {
  console.log('🎯 开始数据迁移流程...');
  
  // 路径配置
  const jsonPath = path.join(__dirname, '../../docs/data/JSON/character');
  const dbPath = path.join(__dirname, '../../data/characters.db');
  
  console.log('📁 JSON路径:', jsonPath);
  console.log('🗄️ 数据库路径:', dbPath);
  
  // 确保数据目录存在
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 创建数据目录:', dataDir);
  }
  
  // 初始化数据库
  console.log('🔧 初始化SQLite数据库...');
  const db = new Database(dbPath);
  
  try {
    // 创建角色基础信息表
    db.exec(`
      CREATE TABLE IF NOT EXISTS characters (
        unid TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        pinyin TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        rank INTEGER,
        power INTEGER,
        influence INTEGER,
        morality TEXT,
        first_appearance INTEGER,
        is_alias INTEGER DEFAULT 0,
        alias_of TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建角色扩展信息表
    db.exec(`
      CREATE TABLE IF NOT EXISTS character_metadata (
        unid TEXT PRIMARY KEY,
        aliases TEXT,
        tags TEXT,
        source_chapters TEXT,
        attributes TEXT,
        description TEXT,
        FOREIGN KEY (unid) REFERENCES characters(unid)
      );
    `);

    // 创建索引
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_characters_type ON characters(type);
      CREATE INDEX IF NOT EXISTS idx_characters_category ON characters(category);
      CREATE INDEX IF NOT EXISTS idx_characters_rank ON characters(rank);
      CREATE INDEX IF NOT EXISTS idx_characters_power ON characters(power);
      CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
      CREATE INDEX IF NOT EXISTS idx_characters_pinyin ON characters(pinyin);
    `);

    console.log('✅ 数据库初始化完成');
    
    // 读取JSON文件
    console.log('🚀 开始迁移角色数据...');
    const files = fs.readdirSync(jsonPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    console.log(`📊 找到 ${jsonFiles.length} 个角色文件`);
    
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
          const filePath = path.join(jsonPath, fileName);
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
            type: basic.type || 'character',
            category: basic.category || 'unknown',
            rank: attributes.rank || 0,
            power: attributes.power || 0,
            influence: attributes.influence || 0,
            morality: attributes.morality || 'neutral',
            first_appearance: metadata.firstAppearance || 0,
            is_alias: jsonData.isAlias ? 1 : 0,
            alias_of: jsonData.aliasOf || null
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
            console.log(`📈 已迁移 ${successCount} 个角色...`);
          }
          
        } catch (error) {
          console.error(`❌ 迁移失败: ${fileName}`, error.message);
          errorCount++;
        }
      }
    });

    // 执行事务
    transaction();

    console.log(`✅ 迁移完成! 成功: ${successCount}, 失败: ${errorCount}`);
    
    // 验证迁移结果
    console.log('🔍 验证迁移结果...');
    
    const characterCount = db.prepare('SELECT COUNT(*) as count FROM characters').get().count;
    const metadataCount = db.prepare('SELECT COUNT(*) as count FROM character_metadata').get().count;
    
    console.log(`📊 角色数量: ${characterCount}`);
    console.log(`📊 扩展信息数量: ${metadataCount}`);
    
    // 检查数据完整性
    const missingMetadata = db.prepare(`
      SELECT c.unid, c.name 
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid 
      WHERE m.unid IS NULL
    `).all();
    
    if (missingMetadata.length > 0) {
      console.warn(`⚠️ 发现 ${missingMetadata.length} 个角色缺少扩展信息`);
    } else {
      console.log('✅ 数据完整性检查通过');
    }
    
    // 显示一些示例数据
    const sampleCharacters = db.prepare('SELECT name, pinyin, category, rank FROM characters LIMIT 5').all();
    console.log('📋 示例角色数据:');
    sampleCharacters.forEach(char => {
      console.log(`  - ${char.name} (${char.pinyin}) - ${char.category} - 等级:${char.rank}`);
    });
    
    console.log('🎉 数据迁移完成!');
    console.log(`📍 数据库文件位置: ${dbPath}`);
    
    // 显示数据库文件大小
    const stats = fs.statSync(dbPath);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`📏 数据库文件大小: ${fileSizeMB} MB`);
    
    return { successCount, errorCount, characterCount, metadataCount };
    
  } catch (error) {
    console.error('💥 迁移过程中发生错误:', error);
    throw error;
  } finally {
    db.close();
  }
}

// 执行迁移
try {
  migrateData();
} catch (error) {
  console.error('迁移失败:', error);
  process.exit(1);
}
