/**
 * 简化的JSON到SQLite数据迁移脚本
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

class SimpleMigrator {
  constructor() {
    this.jsonPath = path.join(__dirname, '../../docs/data/JSON/character');
    this.dbPath = path.join(__dirname, '../../data/characters.db');

    console.log('📁 JSON路径:', this.jsonPath);
    console.log('🗄️ 数据库路径:', this.dbPath);

    // 检查路径是否存在
    if (!fs.existsSync(this.jsonPath)) {
      throw new Error(`JSON目录不存在: ${this.jsonPath}`);
    }

    // 确保数据目录存在
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 创建数据目录:', dataDir);
    }
  }

  /**
   * 初始化数据库
   */
  initDatabase() {
    console.log('🔧 初始化SQLite数据库...');
    
    this.db = new Database(this.dbPath);
    
    // 创建角色基础信息表
    this.db.exec(`
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
        is_alias BOOLEAN DEFAULT FALSE,
        alias_of TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建角色扩展信息表
    this.db.exec(`
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
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_characters_type ON characters(type);
      CREATE INDEX IF NOT EXISTS idx_characters_category ON characters(category);
      CREATE INDEX IF NOT EXISTS idx_characters_rank ON characters(rank);
      CREATE INDEX IF NOT EXISTS idx_characters_power ON characters(power);
      CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
      CREATE INDEX IF NOT EXISTS idx_characters_pinyin ON characters(pinyin);
    `);

    console.log('✅ 数据库初始化完成');
  }

  /**
   * 转换JSON数据为数据库格式
   */
  transformCharacterData(jsonData) {
    const basic = jsonData.basic || {};
    const attributes = jsonData.attributes || {};
    const metadata = jsonData.metadata || {};

    // 基础信息
    const characterData = {
      unid: jsonData.unid,
      name: basic.name || '',
      pinyin: basic.pinyin || '',
      type: basic.type || 'character',
      category: basic.category || 'unknown',
      rank: attributes.rank || 0,
      power: attributes.power || 0,
      influence: attributes.influence || 0,
      morality: attributes.morality || 'neutral',
      first_appearance: metadata.firstAppearance || 0,
      is_alias: jsonData.isAlias || false,
      alias_of: jsonData.aliasOf || null
    };

    // 扩展信息
    const metadataData = {
      unid: jsonData.unid,
      aliases: JSON.stringify(basic.aliases || []),
      tags: JSON.stringify(metadata.tags || []),
      source_chapters: JSON.stringify(metadata.sourceChapters || []),
      attributes: JSON.stringify(attributes),
      description: metadata.description || ''
    };

    return { characterData, metadataData };
  }

  /**
   * 迁移角色数据
   */
  migrateCharacters() {
    console.log('🚀 开始迁移角色数据...');
    
    // 读取所有JSON文件
    const files = fs.readdirSync(this.jsonPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log(`📊 找到 ${jsonFiles.length} 个角色文件`);
    
    // 准备插入语句
    const insertCharacter = this.db.prepare(`
      INSERT OR REPLACE INTO characters 
      (unid, name, pinyin, type, category, rank, power, influence, morality, first_appearance, is_alias, alias_of)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMetadata = this.db.prepare(`
      INSERT OR REPLACE INTO character_metadata 
      (unid, aliases, tags, source_chapters, attributes, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let successCount = 0;
    let errorCount = 0;

    // 开始事务
    const transaction = this.db.transaction(() => {
      for (const fileName of jsonFiles) {
        try {
          const filePath = path.join(this.jsonPath, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const jsonData = JSON.parse(fileContent);
          
          const { characterData, metadataData } = this.transformCharacterData(jsonData);
          
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
            characterData.is_alias ? 1 : 0,  // 转换布尔值为整数
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
    return { successCount, errorCount };
  }

  /**
   * 验证迁移结果
   */
  validateMigration() {
    console.log('🔍 验证迁移结果...');
    
    const characterCount = this.db.prepare('SELECT COUNT(*) as count FROM characters').get().count;
    const metadataCount = this.db.prepare('SELECT COUNT(*) as count FROM character_metadata').get().count;
    
    console.log(`📊 角色数量: ${characterCount}`);
    console.log(`📊 扩展信息数量: ${metadataCount}`);
    
    // 检查数据完整性
    const missingMetadata = this.db.prepare(`
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
    const sampleCharacters = this.db.prepare('SELECT name, pinyin, category, rank FROM characters LIMIT 5').all();
    console.log('📋 示例角色数据:');
    sampleCharacters.forEach(char => {
      console.log(`  - ${char.name} (${char.pinyin}) - ${char.category} - 等级:${char.rank}`);
    });
    
    return { characterCount, metadataCount, missingMetadata };
  }

  /**
   * 执行完整迁移流程
   */
  migrate() {
    try {
      console.log('🎯 开始数据迁移流程...');
      
      this.initDatabase();
      const result = this.migrateCharacters();
      this.validateMigration();
      
      console.log('🎉 数据迁移完成!');
      console.log(`📍 数据库文件位置: ${this.dbPath}`);
      
      return result;
      
    } catch (error) {
      console.error('💥 迁移过程中发生错误:', error);
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const migrator = new SimpleMigrator();
  migrator.migrate().catch(console.error);
}

module.exports = SimpleMigrator;
