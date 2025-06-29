# 西游记关系图谱数据库架构分析与使用说明

## 1. 数据库概览

该项目包含两个核心SQLite数据库：

- **`characters.db`**: 存储西游记角色信息 (482条记录)
- **`events.db`**: 存储西游记八十一难事件信息 (81条记录)

## 2. characters.db 数据库架构

### 2.1 表结构设计

#### 主表: `characters`
```sql
CREATE TABLE characters (
    unid TEXT PRIMARY KEY,              -- 唯一标识符
    name TEXT NOT NULL,                 -- 角色名称
    pinyin TEXT NOT NULL,               -- 拼音
    type TEXT NOT NULL,                 -- 类型 (character/alias)
    category TEXT NOT NULL,             -- 分类 (主角/神仙/妖魔等)
    rank INTEGER,                       -- 等级/地位
    power INTEGER,                      -- 能力值 (0-100)
    influence INTEGER,                  -- 影响力 (0-100)
    morality TEXT,                      -- 道德倾向
    first_appearance INTEGER,           -- 首次出现章节
    is_alias BOOLEAN DEFAULT FALSE,     -- 是否为别名
    alias_of TEXT,                      -- 别名所属角色
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 扩展表: `character_metadata`
```sql
CREATE TABLE character_metadata (
    unid TEXT PRIMARY KEY,              -- 关联characters表的外键
    aliases TEXT,                       -- JSON格式别名数组
    tags TEXT,                          -- JSON格式标签数组
    source_chapters TEXT,               -- JSON格式出现章节
    attributes TEXT,                    -- JSON格式复杂属性
    description TEXT,                   -- 角色描述
    FOREIGN KEY (unid) REFERENCES characters(unid)
);
```

### 2.2 索引设计
```sql
CREATE INDEX idx_characters_type ON characters(type);
CREATE INDEX idx_characters_category ON characters(category);
CREATE INDEX idx_characters_rank ON characters(rank);
CREATE INDEX idx_characters_power ON characters(power);
CREATE INDEX idx_characters_name ON characters(name);
CREATE INDEX idx_characters_pinyin ON characters(pinyin);
```

### 2.3 数据分布
- **总记录数**: 482条
- **主要角色**: 150个
- **别名记录**: 332个
- **分类统计**:
  - 主角: 孙悟空、唐僧、猪八戒、沙僧等
  - 神仙: 各种仙人、佛祖等
  - 妖魔: 各路妖魔鬼怪
  - 人类: 凡间人物
  - 其他: 龙族、天庭、地府等

## 3. events.db 数据库架构

### 3.1 表结构设计

#### 主表: `event`
```sql
CREATE TABLE event (
    id INTEGER PRIMARY KEY,             -- 自增主键
    nanci INTEGER,                      -- 难次 (1-81)
    nanming TEXT,                       -- 难名
    zhuyaorenwu TEXT,                   -- 主要人物
    didian TEXT,                        -- 地点
    shijianmiaoshu TEXT,               -- 事件描述
    xiangzhengyi TEXT,                 -- 象征意义
    wenhuaneihan TEXT                  -- 文化内涵
);
```

### 3.2 数据示例
```
难次: 1, 难名: "金蝉遭贬"
主要人物: "金蝉子(唐僧前世)、如来佛祖"
地点: "灵山"
事件描述: "唐僧前世金蝉子因不敬佛法被贬下凡"
象征意义: "因果轮回的起点"
文化内涵: "佛教因果报应思想"
```

## 4. 数据访问层架构

### 4.1 服务器实现
- **主服务器**: `src/server/dataServer.js`
- **端口**: 3003
- **技术栈**: Express + better-sqlite3

### 4.2 核心API接口

#### 角色数据接口
```javascript
GET /api/characters          // 获取所有角色
GET /api/aliases            // 获取所有别名
GET /api/characters/:id     // 获取单个角色
GET /api/characters/search  // 搜索角色
GET /api/data/complete      // 获取完整数据包
GET /api/stats              // 获取数据统计
```

#### 事件数据接口
```javascript
GET /api/events             // 获取所有81难事件
GET /api/events/:nanci      // 获取指定难次事件
GET /api/events/search      // 搜索事件
```

### 4.3 数据转换适配器
```javascript
function transformSqliteToFrontend(sqliteData) {
  return {
    id: sqliteData.unid,
    name: sqliteData.name,
    pinyin: sqliteData.pinyin,
    aliases: JSON.parse(sqliteData.aliases || '[]'),
    type: mapCharacterType(sqliteData.category),
    category: sqliteData.category,
    faction: mapFaction(sqliteData.category, attributes),
    // ... 其他字段映射
    visual: generateVisualConfig(sqliteData),
    metadata: {
      source: 'sqlite',
      verified: true
    }
  };
}
```

## 5. 数据迁移流程

### 5.1 从JSON到SQLite的迁移
```javascript
// 核心迁移脚本
scripts/data-migration/migrate-fixed.cjs    // 角色数据迁移
scripts/data-migration/migrate-aliases.cjs  // 别名数据迁移
src/scripts/csv_to_sqlite.py               // 事件数据迁移
```

### 5.2 数据库汉化处理
```javascript
scripts/data-migration/localize-database.js  // 英文字段转中文
```

## 6. 性能优化特性

### 6.1 性能提升效果
- **查询速度**: 从45ms降至1-14ms (10-45倍提升)
- **内存使用**: 减少60-80%
- **存储效率**: 482个文件合并为1个数据库文件
- **并发支持**: SQLite原生支持多读单写

### 6.2 缓存策略
```javascript
// 5分钟内存缓存
let charactersCache = null;
let eventsCache = null;
let lastCacheTime = null;

// 缓存检查逻辑
if (cache && lastCacheTime && (now - lastCacheTime < 5 * 60 * 1000)) {
  return cachedData;
}
```

## 7. 使用说明

### 7.1 启动数据服务器
```bash
# 开发环境
npm run dev:server

# 或直接运行
node src/server/dataServer.js
```

### 7.2 数据库连接
```javascript
const Database = require('better-sqlite3');
const db = new Database('data/characters.db');
const eventsDb = new Database('data/events.db');
```

### 7.3 常用查询示例
```javascript
// 获取所有主角
const protagonists = db.prepare(`
  SELECT * FROM characters 
  WHERE category = '主角'
`).all();

// 搜索角色
const searchResults = db.prepare(`
  SELECT * FROM characters 
  WHERE name LIKE ? OR pinyin LIKE ?
`).all(`%${query}%`, `%${query}%`);

// 获取指定难次事件
const event = eventsDb.prepare(`
  SELECT * FROM event WHERE nanci = ?
`).get(nanci);
```

### 7.4 数据备份与恢复
```bash
# 备份数据库
cp data/characters.db data/backup/characters_backup.db
cp data/events.db data/backup/events_backup.db

# 重建数据库
node scripts/data-migration/migrate-fixed.cjs
python src/scripts/csv_to_sqlite.py
```

## 8. 技术特点总结

### 8.1 架构优势
- **混合存储**: 基础字段关系型存储 + 复杂数据JSON存储
- **索引优化**: 6个核心索引提升查询性能
- **数据完整性**: ACID事务保证
- **API兼容性**: 保持与原JSON系统的完全兼容

### 8.2 扩展能力
- **复杂查询**: 支持多维度搜索和过滤
- **关联查询**: 角色-别名-事件关联分析
- **统计分析**: 实时数据统计和分布分析
- **可视化支持**: 为前端图谱生成优化的数据格式

---

## 9. 详细技术实现

### 9.1 数据库字段详解

#### characters表字段说明
| 字段名 | 数据类型 | 说明 | 示例值 |
|--------|----------|------|--------|
| unid | TEXT | 唯一标识符，主键 | "c0001" |
| name | TEXT | 角色名称 | "孙悟空" |
| pinyin | TEXT | 拼音标识 | "sun_wu_kong" |
| type | TEXT | 记录类型 | "character" |
| category | TEXT | 角色分类 | "主角" |
| rank | INTEGER | 角色等级/地位 | 1 |
| power | INTEGER | 能力值(0-100) | 95 |
| influence | INTEGER | 影响力(0-100) | 90 |
| morality | TEXT | 道德倾向 | "中立善良" |
| first_appearance | INTEGER | 首次出现章节 | 1 |
| is_alias | BOOLEAN | 是否为别名 | 0/1 |
| alias_of | TEXT | 别名所属角色 | NULL |

#### event表字段说明
| 字段名 | 数据类型 | 说明 | 示例值 |
|--------|----------|------|--------|
| id | INTEGER | 自增主键 | 1 |
| nanci | INTEGER | 难次编号(1-81) | 1 |
| nanming | TEXT | 难的名称 | "金蝉遭贬" |
| zhuyaorenwu | TEXT | 主要参与人物 | "金蝉子、如来佛祖" |
| didian | TEXT | 事件发生地点 | "灵山" |
| shijianmiaoshu | TEXT | 事件详细描述 | "唐僧前世金蝉子..." |
| xiangzhengyi | TEXT | 象征意义 | "因果轮回的起点" |
| wenhuaneihan | TEXT | 文化内涵 | "佛教因果报应思想" |

### 9.2 数据分类体系

#### 角色分类(category)统计
```sql
-- 查看分类分布
SELECT category, COUNT(*) as count 
FROM characters 
GROUP BY category 
ORDER BY count DESC;
```

主要分类包括：
- **主角**: 取经团队核心成员
- **神仙**: 天庭、佛教、道教仙人
- **妖魔**: 各路妖魔鬼怪
- **人类**: 凡间人物
- **龙族**: 龙王及龙族成员
- **地府**: 阎王等地府官员

#### 道德倾向(morality)体系
- **守序善良**: 严格遵守规则的善良角色
- **中立善良**: 善良但不拘泥于规则
- **混乱善良**: 善良但行事随意
- **守序中立**: 严格遵守规则但无明显善恶倾向
- **真中立**: 无明显道德倾向
- **混乱中立**: 行事随意且无明显善恶
- **守序邪恶**: 有组织的邪恶
- **中立邪恶**: 纯粹的邪恶
- **混乱邪恶**: 无序的邪恶

### 9.3 查询优化策略

#### 常用查询模式
```sql
-- 1. 按能力值范围查询高手
SELECT name, power, category 
FROM characters 
WHERE power >= 80 
ORDER BY power DESC;

-- 2. 查询特定分类的角色及其别名
SELECT c.name, c.category, m.aliases 
FROM characters c
LEFT JOIN character_metadata m ON c.unid = m.unid
WHERE c.category = '主角';

-- 3. 模糊搜索角色
SELECT name, pinyin, category 
FROM characters 
WHERE name LIKE '%悟空%' 
   OR pinyin LIKE '%wu_kong%';

-- 4. 统计各势力人数
SELECT category, 
       COUNT(*) as total,
       AVG(power) as avg_power
FROM characters 
WHERE is_alias = 0
GROUP BY category;
```

#### 索引使用说明
- `idx_characters_name`: 支持按名称快速查找
- `idx_characters_pinyin`: 支持拼音搜索
- `idx_characters_category`: 支持按分类过滤
- `idx_characters_power`: 支持按能力值排序和范围查询
- `idx_characters_rank`: 支持按等级排序
- `idx_characters_type`: 区分角色和别名

### 9.4 API接口详细说明

#### 响应格式规范
所有API响应遵循统一格式：
```json
{
  "success": true/false,
  "data": {...},
  "cached": true/false,
  "source": "sqlite",
  "timestamp": "2025-06-30T10:00:00.000Z",
  "error": "错误信息(仅在失败时)"
}
```

#### 搜索接口参数
```javascript
// GET /api/characters/search
// 支持的查询参数：
{
  "q": "关键词搜索",           // 在name, pinyin, description中搜索
  "category": "分类过滤",      // 按category字段过滤
  "minPower": 80,            // 最小能力值
  "maxPower": 100,           // 最大能力值
  "morality": "道德倾向",     // 按道德倾向过滤
  "limit": 10,               // 限制返回数量
  "offset": 0                // 分页偏移
}
```

#### 统计接口返回格式
```json
{
  "success": true,
  "data": {
    "totalCharacters": 150,
    "totalAliases": 332,
    "charactersByType": {
      "主角": 4,
      "神仙": 45,
      "妖魔": 67
    },
    "charactersByFaction": {
      "取经团队": 4,
      "天庭": 35,
      "佛教": 28
    },
    "powerDistribution": {
      "high": 15,     // power >= 80
      "medium": 58,   // 50 <= power < 80  
      "low": 77       // power < 50
    },
    "lastUpdated": "2025-06-30T10:00:00.000Z"
  }
}
```

### 9.5 错误处理与调试

#### 常见错误类型
```javascript
// 1. 数据库连接错误
{
  "success": false,
  "error": "数据库连接失败: SQLITE_CANTOPEN",
  "timestamp": "..."
}

// 2. 参数验证错误
{
  "success": false,
  "error": "难次必须是1-81之间的数字",
  "timestamp": "..."
}

// 3. 数据不存在错误
{
  "success": false,
  "error": "未找到第82难的数据",
  "timestamp": "..."
}
```

#### 调试工具
```bash
# 1. 直接查询数据库
sqlite3 data/characters.db "SELECT COUNT(*) FROM characters;"

# 2. 检查索引使用情况
sqlite3 data/characters.db "EXPLAIN QUERY PLAN SELECT * FROM characters WHERE name LIKE '%悟空%';"

# 3. 查看数据库统计信息
sqlite3 data/characters.db "PRAGMA table_info(characters);"
```

### 9.6 部署与维护

#### 生产环境配置
```javascript
// 生产环境优化配置
const db = new Database(dbPath, {
  readonly: true,           // 只读模式提高性能
  fileMustExist: true,     // 确保文件存在
  timeout: 5000,           // 5秒超时
  verbose: console.log     // 开发环境下的SQL日志
});

// 设置SQLite优化参数
db.pragma('journal_mode = WAL');    // 写前日志模式
db.pragma('synchronous = NORMAL');  // 平衡性能和安全
db.pragma('cache_size = 10000');    // 增加缓存大小
db.pragma('temp_store = memory');   // 临时表存储在内存
```

#### 定期维护任务
```bash
# 1. 数据库完整性检查
sqlite3 data/characters.db "PRAGMA integrity_check;"

# 2. 优化数据库文件
sqlite3 data/characters.db "VACUUM;"

# 3. 更新统计信息
sqlite3 data/characters.db "ANALYZE;"

# 4. 备份数据库
cp data/characters.db data/backup/characters_$(date +%Y%m%d).db
```

---

这个数据库架构为西游记关系图谱项目提供了高性能、可扩展的数据存储解决方案，同时保持了与现有系统的完全兼容性。通过合理的表结构设计、索引优化和缓存策略，实现了显著的性能提升和功能扩展。
