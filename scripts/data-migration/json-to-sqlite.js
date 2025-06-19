/**
 * JSON到SQLite数据迁移脚本
 * 将现有的JSON文件数据迁移到SQLite数据库
 */

import fs from 'fs/promises';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataMigrator {
  constructor(options = {}) {
    this.jsonPath = options.jsonPath || 'D:\\codee\\xiyouji-rela-map\\docs\\data\\JSON';
    this.dbPath = options.dbPath || 'D:\\codee\\xiyouji-rela-map\\data\\characters.db';
    this.backupPath = options.backupPath || 'D:\\codee\\xiyouji-rela-map\\backup';
    this.db = null;
  }

  /**
   * 初始化数据库
   */
  async initDatabase() {
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
        aliases TEXT,           -- JSON格式存储别名数组
        tags TEXT,             -- JSON格式存储标签数组  
        source_chapters TEXT,   -- JSON格式存储出现章节
        attributes TEXT,        -- JSON格式存储等级、能力等复杂属性
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
   * 扫描JSON文件
   */
  async scanJsonFiles() {
    console.log('📁 扫描JSON文件...');
    
    const characterPath = path.join(this.jsonPath, 'character');
    const aliasPath = path.join(this.jsonPath, 'character_alias');
    
    const characterFiles = await fs.readdir(characterPath);
    const aliasFiles = await fs.readdir(aliasPath).catch(() => []);
    
    const jsonFiles = characterFiles.filter(f => f.endsWith('.json'));
    const aliasJsonFiles = aliasFiles.filter(f => f.endsWith('.json'));
    
    console.log(`📊 找到 ${jsonFiles.length} 个角色文件`);
    console.log(`📊 找到 ${aliasJsonFiles.length} 个别名文件`);
    
    return { characterFiles: jsonFiles, aliasFiles: aliasJsonFiles };
  }

  /**
   * 读取并解析JSON文件
   */
  async readJsonFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ 读取文件失败: ${filePath}`, error);
      return null;
    }
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
      name: basic.name,
      pinyin: basic.pinyin,
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
  async migrateCharacters() {
    console.log('🚀 开始迁移角色数据...');
    
    const { characterFiles } = await this.scanJsonFiles();
    const characterPath = path.join(this.jsonPath, 'character');
    
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

    // 先读取所有文件数据
    const allData = [];
    for (const fileName of characterFiles) {
      try {
        const filePath = path.join(characterPath, fileName);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        allData.push({ fileName, jsonData });
      } catch (error) {
        console.error(`❌ 读取文件失败: ${fileName}`, error);
        errorCount++;
      }
    }

    // 开始事务
    const transaction = this.db.transaction(() => {
      for (const { fileName, jsonData } of allData) {
        try {
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
          console.error(`❌ 迁移失败: ${fileName}`, error);
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
  async validateMigration() {
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
      missingMetadata.forEach(char => {
        console.warn(`  - ${char.unid}: ${char.name}`);
      });
    } else {
      console.log('✅ 数据完整性检查通过');
    }
    
    return { characterCount, metadataCount, missingMetadata };
  }

  /**
   * 性能测试
   */
  async performanceTest() {
    console.log('⚡ 执行性能测试...');
    
    const tests = [
      {
        name: '按类型查询',
        query: "SELECT * FROM characters WHERE type = 'protagonist'"
      },
      {
        name: '按等级排序',
        query: "SELECT * FROM characters ORDER BY rank LIMIT 10"
      },
      {
        name: '模糊搜索',
        query: "SELECT * FROM characters WHERE name LIKE '%孙%' OR pinyin LIKE '%sun%'"
      },
      {
        name: '联合查询',
        query: `
          SELECT c.name, c.rank, m.description 
          FROM characters c 
          JOIN character_metadata m ON c.unid = m.unid 
          WHERE c.power > 80
        `
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      const results = this.db.prepare(test.query).all();
      const duration = Date.now() - start;
      
      console.log(`  ${test.name}: ${duration}ms (${results.length} 条结果)`);
    }
  }

  /**
   * 执行完整迁移流程
   */
  async migrate() {
    try {
      console.log('🎯 开始数据迁移流程...');
      
      await this.initDatabase();
      const result = await this.migrateCharacters();
      await this.validateMigration();
      await this.performanceTest();
      
      console.log('🎉 数据迁移完成!');
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
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new DataMigrator();
  migrator.migrate().catch(console.error);
}

export default DataMigrator;
