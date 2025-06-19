# SQLite数据迁移详细实施指南

## 迁移概述

### 迁移目标
将150个JSON文件迁移到SQLite数据库，实现性能提升的同时保证数据完整性和系统稳定性。

### 迁移策略
- **渐进式迁移**: 分阶段实施，每步都可验证和回滚
- **并行运行**: 新旧系统并存，逐步切换
- **零停机**: 不影响现有功能的正常使用

## 第一阶段：环境准备 (预计1天)

### 1.1 安装依赖
```powershell
# 进入项目目录
cd D:\codee\xiyouji-rela-map

# 安装SQLite相关依赖
npm install better-sqlite3 --save
npm install @types/better-sqlite3 --save-dev

# 验证安装
node -e "console.log(require('better-sqlite3'))"
```

### 1.2 创建数据目录
```powershell
# 创建数据库存储目录
mkdir data
mkdir data\backup
mkdir data\migration-logs

# 创建迁移脚本目录（如果不存在）
mkdir scripts\data-migration
```

### 1.3 备份现有数据
```powershell
# 备份JSON数据
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "data\backup\json_backup_$timestamp"
mkdir $backupPath
Copy-Item "docs\data\JSON" -Destination $backupPath -Recurse

Write-Host "✅ 数据备份完成: $backupPath"
```

## 第二阶段：数据库初始化 (预计半天)

### 2.1 运行数据库初始化
```powershell
# 运行迁移脚本
cd D:\codee\xiyouji-rela-map
node scripts\data-migration\json-to-sqlite.js
```

### 2.2 验证数据库创建
```powershell
# 检查数据库文件
if (Test-Path "data\characters.db") {
    Write-Host "✅ 数据库文件创建成功"
    $dbSize = (Get-Item "data\characters.db").Length / 1MB
    Write-Host "📊 数据库大小: $([math]::Round($dbSize, 2)) MB"
} else {
    Write-Host "❌ 数据库文件创建失败"
}
```

### 2.3 数据完整性检查
```javascript
// 运行验证脚本
const Database = require('better-sqlite3');
const db = new Database('data/characters.db');

// 检查数据量
const characterCount = db.prepare('SELECT COUNT(*) as count FROM characters').get().count;
const metadataCount = db.prepare('SELECT COUNT(*) as count FROM character_metadata').get().count;

console.log(`角色数量: ${characterCount}`);
console.log(`元数据数量: ${metadataCount}`);

// 检查数据完整性
const missingData = db.prepare(`
  SELECT c.unid, c.name 
  FROM characters c 
  LEFT JOIN character_metadata m ON c.unid = m.unid 
  WHERE m.unid IS NULL
`).all();

if (missingData.length === 0) {
  console.log('✅ 数据完整性检查通过');
} else {
  console.log(`⚠️ 发现${missingData.length}个数据不完整的记录`);
}

db.close();
```

## 第三阶段：数据访问层重构 (预计2-3天)

### 3.1 创建数据库访问类
```typescript
// src/services/database/CharacterRepository.ts
import Database from 'better-sqlite3';

export class CharacterRepository {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  // 获取所有角色
  async getAllCharacters() {
    return this.db.prepare(`
      SELECT c.*, m.aliases, m.tags, m.description, m.attributes
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid
    `).all();
  }

  // 按ID获取角色
  async getCharacterById(unid: string) {
    return this.db.prepare(`
      SELECT c.*, m.aliases, m.tags, m.description, m.attributes
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid
      WHERE c.unid = ?
    `).get(unid);
  }

  // 搜索角色
  async searchCharacters(query: string) {
    return this.db.prepare(`
      SELECT c.*, m.description
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid
      WHERE c.name LIKE ? OR c.pinyin LIKE ? OR m.description LIKE ?
    `).all(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  // 按类型过滤
  async getCharactersByType(type: string) {
    return this.db.prepare(`
      SELECT c.*, m.aliases, m.tags, m.description
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid
      WHERE c.type = ?
    `).all(type);
  }

  // 关闭数据库连接
  close() {
    this.db.close();
  }
}
```

### 3.2 更新数据服务器
```javascript
// src/server/dataServer.js 更新
const CharacterRepository = require('./database/CharacterRepository');

// 初始化数据库连接
const dbPath = path.join(__dirname, '../../data/characters.db');
const characterRepo = new CharacterRepository(dbPath);

// 更新API路由
app.get('/api/characters', async (req, res) => {
  try {
    const characters = await characterRepo.getAllCharacters();
    
    // 转换数据格式以保持兼容性
    const transformedCharacters = characters.map(char => ({
      id: char.unid,
      name: char.name,
      pinyin: char.pinyin,
      aliases: JSON.parse(char.aliases || '[]'),
      type: mapCharacterType(char.category),
      category: char.category,
      rank: char.rank,
      power: char.power,
      influence: char.influence,
      description: char.description,
      tags: JSON.parse(char.tags || '[]'),
      // ... 其他字段转换
    }));

    res.json({
      success: true,
      data: transformedCharacters,
      source: 'sqlite',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 3.3 创建兼容性适配器
```typescript
// src/services/DataAdapter.ts
export class DataAdapter {
  // 将SQLite数据转换为前端期望的格式
  static sqliteToFrontend(sqliteData: any) {
    return {
      id: sqliteData.unid,
      name: sqliteData.name,
      pinyin: sqliteData.pinyin,
      aliases: JSON.parse(sqliteData.aliases || '[]'),
      type: this.mapCharacterType(sqliteData.category),
      category: sqliteData.category,
      faction: this.mapFaction(sqliteData.category, sqliteData),
      rank: sqliteData.rank,
      level: JSON.parse(sqliteData.attributes || '{}').level,
      power: sqliteData.power,
      influence: sqliteData.influence,
      morality: sqliteData.morality,
      description: sqliteData.description,
      tags: JSON.parse(sqliteData.tags || '[]'),
      chapters: JSON.parse(sqliteData.source_chapters || '[]'),
      firstAppearance: sqliteData.first_appearance,
      isAlias: sqliteData.is_alias,
      aliasOf: sqliteData.alias_of,
      visual: this.generateVisualConfig(sqliteData)
    };
  }

  // 生成视觉配置（保持与现有系统兼容）
  static generateVisualConfig(data: any) {
    return {
      color: this.getColorByCategory(data.category),
      size: this.getSizeByRank(data.rank),
      emissiveIntensity: 0.7
    };
  }
}
```

## 第四阶段：并行测试 (预计1-2天)

### 4.1 创建A/B测试开关
```typescript
// src/config/migrationConfig.ts
export const MIGRATION_CONFIG = {
  // 数据源选择: 'json' | 'sqlite' | 'hybrid'
  DATA_SOURCE: process.env.DATA_SOURCE || 'json',
  
  // 是否启用并行验证
  ENABLE_PARALLEL_VALIDATION: true,
  
  // SQLite数据库路径
  SQLITE_DB_PATH: 'data/characters.db',
  
  // JSON数据路径
  JSON_DATA_PATH: 'docs/data/JSON'
};
```

### 4.2 实现数据源切换
```typescript
// src/services/DataSourceManager.ts
export class DataSourceManager {
  private jsonLoader: JsonDataLoader;
  private sqliteRepo: CharacterRepository;

  constructor() {
    this.jsonLoader = new JsonDataLoader();
    this.sqliteRepo = new CharacterRepository(MIGRATION_CONFIG.SQLITE_DB_PATH);
  }

  async getCharacters() {
    switch (MIGRATION_CONFIG.DATA_SOURCE) {
      case 'sqlite':
        return this.getSqliteData();
      case 'hybrid':
        return this.getHybridData();
      default:
        return this.getJsonData();
    }
  }

  private async getSqliteData() {
    const rawData = await this.sqliteRepo.getAllCharacters();
    return rawData.map(DataAdapter.sqliteToFrontend);
  }

  private async getHybridData() {
    // 并行获取两种数据源，用于验证
    const [jsonData, sqliteData] = await Promise.all([
      this.getJsonData(),
      this.getSqliteData()
    ]);

    // 验证数据一致性
    this.validateDataConsistency(jsonData, sqliteData);
    
    return sqliteData; // 返回SQLite数据
  }

  private validateDataConsistency(jsonData: any[], sqliteData: any[]) {
    if (jsonData.length !== sqliteData.length) {
      console.warn(`数据量不一致: JSON(${jsonData.length}) vs SQLite(${sqliteData.length})`);
    }
    
    // 更多验证逻辑...
  }
}
```

### 4.3 性能对比测试
```powershell
# 运行性能对比测试
node scripts\data-migration\performance-comparison.js

# 预期输出示例:
# 📁 JSON文件存储性能...
#   📊 加载 150 个角色: 245ms
#   🔍 按名称搜索: 12ms (3 条结果)
#   🏷️ 按类型过滤: 8ms (5 条结果)
#
# 🗄️ SQLite数据库性能...
#   📊 加载 150 个角色: 15ms
#   🔍 按名称搜索: 2ms (3 条结果)
#   🏷️ 按类型过滤: 1ms (5 条结果)
#
# 📊 性能提升: 平均16倍速度提升
```

## 第五阶段：逐步切换 (预计1天)

### 5.1 环境变量配置
```powershell
# 开发环境测试
$env:DATA_SOURCE = "hybrid"
npm run dev

# 验证功能正常后切换到SQLite
$env:DATA_SOURCE = "sqlite"
npm run dev
```

### 5.2 前端适配验证
```typescript
// 验证前端组件是否正常工作
// 检查以下功能:
// 1. 角色列表加载
// 2. 搜索功能
// 3. 过滤功能
// 4. 角色详情显示
// 5. 3D可视化渲染
```

### 5.3 生产环境部署
```powershell
# 更新生产环境配置
# 1. 备份生产数据
# 2. 部署新版本
# 3. 运行数据迁移
# 4. 验证功能
# 5. 监控性能指标
```

## 第六阶段：清理和优化 (预计半天)

### 6.1 清理旧代码
```powershell
# 备份旧的JSON加载代码
mkdir _archive\json-loader-backup
Copy-Item "src\services\jsonDataLoader.ts" -Destination "_archive\json-loader-backup\"

# 移除不再需要的JSON加载逻辑（保留备份）
```

### 6.2 性能监控
```typescript
// 添加性能监控
export class PerformanceMonitor {
  static logQueryTime(operation: string, startTime: number) {
    const duration = Date.now() - startTime;
    console.log(`🔍 ${operation}: ${duration}ms`);
    
    // 可以发送到监控系统
    if (duration > 100) {
      console.warn(`⚠️ 慢查询警告: ${operation} 耗时 ${duration}ms`);
    }
  }
}
```

## 回滚方案

### 紧急回滚步骤
```powershell
# 1. 立即切换回JSON数据源
$env:DATA_SOURCE = "json"

# 2. 重启服务
npm run dev

# 3. 验证功能恢复正常
# 4. 分析问题原因
# 5. 修复后重新迁移
```

### 数据恢复
```powershell
# 如果需要恢复JSON数据
$backupPath = "data\backup\json_backup_*"
$latestBackup = Get-ChildItem $backupPath | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Copy-Item "$($latestBackup.FullName)\JSON" -Destination "docs\data\" -Recurse -Force
```

## 验证清单

### 功能验证
- [ ] 角色列表正常加载
- [ ] 搜索功能正常工作
- [ ] 过滤功能正常工作
- [ ] 角色详情正常显示
- [ ] 3D可视化正常渲染
- [ ] 性能明显提升

### 数据验证
- [ ] 角色数量一致 (150个)
- [ ] 别名数据完整
- [ ] 属性数据正确
- [ ] 关系数据保持
- [ ] 无数据丢失

### 性能验证
- [ ] 查询速度提升 > 5倍
- [ ] 内存使用减少 > 50%
- [ ] 启动时间减少 > 50%
- [ ] 无明显性能回退

这个迁移方案确保了安全、渐进的数据迁移过程，每一步都有验证和回滚机制。
