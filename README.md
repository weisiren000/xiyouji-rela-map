# 西游记关系图谱 - 后端API服务

## 📖 项目简介

这是西游记角色关系3D可视化项目的后端API服务，基于SQLite数据库，提供完整的西游记角色数据、81难事件数据和统计信息的RESTful API接口。

## 🛠️ 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: SQLite (better-sqlite3)
- **跨域**: CORS
- **开发工具**: Nodemon

## 📁 项目结构

```
xiyouji-rela-map-backend/
├── data/                    # 数据库文件
│   ├── characters.db       # 角色数据库 (482个角色)
│   ├── events.db          # 事件数据库 (81难事件)
│   └── backup/            # 数据备份
│       └── json_backup_*/ # JSON格式备份
├── dataServer.js          # 主服务器文件
├── current-server.js      # 当前服务器实例
├── test.js               # API测试脚本
├── package.json          # 项目配置
└── README.md            # 项目文档
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 启动生产服务器
```bash
npm start
```

服务器将在 `http://localhost:3003` 启动

## 📡 详细API文档

### 基础信息
- **基础URL**: `http://localhost:3003/api`
- **数据格式**: JSON
- **编码**: UTF-8
- **缓存**: 5分钟内存缓存

### 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {}, // 或 []
  "cached": false, // 是否来自缓存
  "source": "sqlite",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": "错误信息",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

---

## 🎭 角色相关接口

### 1. 获取所有角色
**接口**: `GET /api/characters`

**说明**: 获取所有主要角色数据（不包括别名）

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "c0001",
      "name": "孙悟空",
      "pinyin": "sun_wu_kong",
      "aliases": ["美猴王", "齐天大圣", "孙行者"],
      "type": "PROTAGONIST",
      "category": "主角",
      "faction": "取经团队",
      "rank": 1,
      "power": 95,
      "influence": 100,
      "morality": 85,
      "description": "石猴成精，大闹天宫，保护唐僧西天取经",
      "tags": ["72变", "筋斗云", "火眼金睛"],
      "chapters": [1, 2, 3, "..."],
      "firstAppearance": "第一回",
      "isAlias": false,
      "aliasOf": null,
      "visual": {
        "color": "#FFD700",
        "size": 2.0,
        "emissiveIntensity": 0.76
      },
      "metadata": {
        "source": "sqlite",
        "lastModified": "2025-06-30T14:45:32.660Z",
        "verified": true
      }
    }
  ],
  "cached": false,
  "source": "sqlite",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

### 2. 获取所有别名
**接口**: `GET /api/aliases`

**说明**: 获取所有角色别名数据

### 3. 高级角色搜索
**接口**: `GET /api/characters/search`

**参数**:
- `q` (string): 搜索关键词，支持角色名、拼音、描述模糊搜索
- `category` (string): 角色分类筛选
  - 可选值: `主角`, `神仙`, `妖魔`, `人类`, `龙族`, `天庭`, `佛教`, `地府`, `仙人`, `反派`, `别名`
- `minPower` (number): 最小战力值 (0-100)
- `maxPower` (number): 最大战力值 (0-100)

**示例请求**:
```
GET /api/characters/search?q=孙悟空&minPower=80&category=主角
```

**响应示例**:
```json
{
  "success": true,
  "data": [...], // 搜索结果数组
  "query": {
    "q": "孙悟空",
    "minPower": "80",
    "category": "主角"
  },
  "count": 1,
  "source": "sqlite",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

### 4. 获取完整数据
**接口**: `GET /api/data/complete`

**说明**: 一次性获取角色、别名和统计数据

**响应示例**:
```json
{
  "success": true,
  "data": {
    "characters": [...], // 150个角色
    "aliases": [...],    // 332个别名
    "stats": {
      "totalCharacters": 150,
      "totalAliases": 332,
      "charactersByType": {
        "PROTAGONIST": 5,
        "DEITY": 71,
        "ANTAGONIST": 31,
        "IMMORTAL": 10,
        "DEMON": 28,
        "DRAGON": 2,
        "HUMAN": 3
      },
      "charactersByFaction": {
        "取经团队": 5,
        "天庭": 81,
        "反派势力": 31,
        "妖魔": 28,
        "龙族": 2,
        "凡间": 3
      },
      "charactersByCategory": {
        "主角": 5,
        "神仙": 71,
        "反派": 31,
        "仙人": 10,
        "妖魔": 28,
        "龙族": 2,
        "人类": 3
      },
      "powerDistribution": {
        "high": 35,    // 80+战力
        "medium": 98,  // 50-79战力
        "low": 17      // <50战力
      },
      "lastUpdated": "2025-06-30T14:45:32.660Z"
    }
  },
  "source": "sqlite",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

---

## 📚 事件相关接口

### 1. 获取所有81难事件
**接口**: `GET /api/events`

**说明**: 获取完整的81难事件数据

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nanci": 1,
      "nanming": "金蝉遭贬",
      "zhuyaorenwu": "金蝉子(唐僧前世)、如来佛祖",
      "didian": "灵山",
      "shijianmiaoshu": "金蝉子因轻慢佛法被贬下界",
      "xiangzhengyi": "象征修行路上的初心考验",
      "wenhuaneihan": "体现了佛教因果报应的理念",
      "metadata": {
        "source": "sqlite",
        "lastModified": "2025-06-30T14:45:32.660Z",
        "verified": true
      }
    }
  ],
  "cached": false,
  "source": "sqlite",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

### 2. 根据难次获取单个事件
**接口**: `GET /api/events/:nanci`

**参数**:
- `nanci` (number): 难次，范围 1-81

**示例请求**:
```
GET /api/events/20
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 20,
    "nanci": 20,
    "nanming": "贬退心猿",
    "zhuyaorenwu": "唐僧、孙悟空、白骨精",
    "didian": "白虎岭",
    "shijianmiaoshu": "白骨精三戏唐三藏，圣僧恨逐美猴王",
    "xiangzhengyi": "考验师徒情谊与识别善恶的能力",
    "wenhuaneihan": "反映了表象与本质的哲学思辨",
    "metadata": {
      "source": "sqlite",
      "lastModified": "2025-06-30T14:45:32.660Z",
      "verified": true
    }
  },
  "source": "sqlite",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "难次必须是1-81之间的数字",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

### 3. 搜索事件
**接口**: `GET /api/events/search`

**参数**:
- `q` (string, 必需): 搜索关键词

**搜索范围**:
- 难名 (`nanming`)
- 主要人物 (`zhuyaorenwu`) 
- 地点 (`didian`)
- 事件描述 (`shijianmiaoshu`)

**示例请求**:
```
GET /api/events/search?q=白骨精
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 20,
      "nanci": 20,
      "nanming": "贬退心猿",
      "zhuyaorenwu": "唐僧、孙悟空、白骨精",
      "didian": "白虎岭",
      "shijianmiaoshu": "白骨精三戏唐三藏，圣僧恨逐美猴王",
      "xiangzhengyi": "考验师徒情谊与识别善恶的能力",
      "wenhuaneihan": "反映了表象与本质的哲学思辨",
      "metadata": {
        "source": "sqlite",
        "lastModified": "2025-06-30T14:45:32.660Z",
        "verified": true
      }
    }
  ],
  "query": {
    "q": "白骨精"
  },
  "count": 1,
  "source": "sqlite",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

---

## 📊 统计相关接口

### 1. 获取数据统计
**接口**: `GET /api/stats`

**说明**: 获取完整的数据统计信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalCharacters": 150,
    "totalAliases": 332,
    "charactersByType": {
      "PROTAGONIST": 5,    // 主角
      "DEITY": 71,         // 神仙
      "ANTAGONIST": 31,    // 反派
      "IMMORTAL": 10,      // 仙人
      "DEMON": 28,         // 妖魔
      "DRAGON": 2,         // 龙族
      "HUMAN": 3           // 人类
    },
    "charactersByFaction": {
      "取经团队": 5,
      "天庭": 81,
      "反派势力": 31,
      "妖魔": 28,
      "龙族": 2,
      "凡间": 3
    },
    "charactersByCategory": {
      "主角": 5,
      "神仙": 71,
      "反派": 31,
      "仙人": 10,
      "妖魔": 28,
      "龙族": 2,
      "人类": 3
    },
    "powerDistribution": {
      "high": 35,    // 战力80+
      "medium": 98,  // 战力50-79
      "low": 17      // 战力<50
    },
    "lastUpdated": "2025-06-30T14:45:32.660Z"
  },
  "source": "sqlite",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

---

## 🔧 系统管理接口

### 1. 刷新缓存
**接口**: `POST /api/cache/refresh`

**说明**: 清除所有内存缓存，强制重新从数据库加载数据

**响应示例**:
```json
{
  "success": true,
  "message": "缓存已清除",
  "source": "sqlite",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

---

## 🧪 API测试

### 使用cURL测试
```bash
# 测试服务器状态
curl http://localhost:3003/api/stats

# 测试角色搜索
curl "http://localhost:3003/api/characters/search?q=孙悟空"

# 测试事件查询
curl http://localhost:3003/api/events/1

# 测试事件搜索
curl "http://localhost:3003/api/events/search?q=白骨精"
```

### 使用PowerShell测试
```powershell
# 获取统计数据
Invoke-RestMethod -Uri "http://localhost:3003/api/stats" -Method Get

# 搜索角色
Invoke-RestMethod -Uri "http://localhost:3003/api/characters/search?q=孙悟空" -Method Get

# 获取第20难事件
Invoke-RestMethod -Uri "http://localhost:3003/api/events/20" -Method Get
```

### 运行内置测试
```bash
npm test
# 或
node test.js
```

---

## 📈 性能特性

### 缓存机制
- **类型**: 内存缓存
- **时长**: 5分钟
- **范围**: 角色数据、别名数据、事件数据
- **刷新**: 自动过期或手动刷新

### 数据库优化
- **连接**: 持久连接，程序启动时建立
- **查询**: 预编译语句，提高查询效率
- **索引**: 主键和常用字段已建立索引

### 响应时间
- **缓存命中**: < 10ms
- **数据库查询**: 50-200ms
- **搜索操作**: 100-500ms

---

## 🔒 错误处理

### HTTP状态码
- `200`: 成功
- `400`: 请求参数错误
- `404`: 资源未找到
- `500`: 服务器内部错误

### 常见错误

#### 参数错误
```json
{
  "success": false,
  "error": "难次必须是1-81之间的数字",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

#### 资源未找到
```json
{
  "success": false,
  "error": "未找到第82难的数据",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

#### 服务器错误  
```json
{
  "success": false,
  "error": "数据库连接失败",
  "timestamp": "2025-06-30T14:45:32.660Z"
}
```

---

## 🗄️ 数据库结构

### characters表
```sql
CREATE TABLE characters (
  unid TEXT PRIMARY KEY,           -- 角色唯一ID
  name TEXT NOT NULL,              -- 角色名称
  pinyin TEXT,                     -- 拼音
  category TEXT,                   -- 分类
  rank INTEGER,                    -- 排名
  power INTEGER,                   -- 战力值
  influence INTEGER,               -- 影响力
  morality INTEGER,                -- 道德值
  first_appearance TEXT,           -- 首次出现
  is_alias INTEGER DEFAULT 0,     -- 是否为别名
  alias_of TEXT,                   -- 别名所属
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### character_metadata表
```sql
CREATE TABLE character_metadata (
  unid TEXT PRIMARY KEY,           -- 角色ID
  aliases TEXT,                    -- 别名列表(JSON)
  tags TEXT,                       -- 标签列表(JSON)  
  source_chapters TEXT,            -- 出现章节(JSON)
  attributes TEXT,                 -- 属性信息(JSON)
  description TEXT,                -- 详细描述
  FOREIGN KEY (unid) REFERENCES characters(unid)
);
```

### event表
```sql
CREATE TABLE event (
  id INTEGER PRIMARY KEY,          -- 事件ID
  nanci INTEGER NOT NULL,          -- 难次(1-81)
  nanming TEXT NOT NULL,           -- 难名
  zhuyaorenwu TEXT,               -- 主要人物
  didian TEXT,                    -- 地点
  shijianmiaoshu TEXT,           -- 事件描述
  xiangzhengyi TEXT,             -- 象征意义
  wenhuaneihan TEXT              -- 文化内涵
);
```

---

## 🚀 部署指南

### 环境要求
- Node.js 18+
- SQLite3
- 至少 512MB 内存
- 至少 100MB 磁盘空间

### 环境变量
```bash
PORT=3003              # 服务端口
NODE_ENV=production    # 环境模式
```

### Railway部署
1. Fork本仓库到你的GitHub
2. 在Railway中新建项目并连接GitHub仓库
3. 设置启动命令: `npm start`
4. 部署完成后获取公网URL

### Render部署
1. 连接GitHub仓库
2. 设置构建命令: `npm install`
3. 设置启动命令: `npm start`
4. 选择免费套餐部署

### 本地部署
```bash
# 克隆仓库
git clone <your-repo-url>
cd xiyouji-rela-map-backend

# 安装依赖
npm install

# 启动服务
npm start
```

---

## � 更新日志

### v1.0.0 (2025-06-30)
- ✅ 基础API接口实现
- ✅ SQLite数据库集成
- ✅ 角色和事件数据完整导入
- ✅ 高级搜索功能
- ✅ 缓存机制
- ✅ 错误处理和日志

---

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建Pull Request

### 开发规范
- 使用ES6+语法
- 遵循RESTful API设计
- 添加适当的错误处理
- 编写清晰的注释
- 更新相关文档

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🔗 相关链接

- [前端仓库](https://github.com/weisiren/xiyouji-rela-map-frontend)
- [项目文档](https://github.com/weisiren/xiyouji-rela-map-backend/docs)
- [在线演示](https://xiyouji-api.herokuapp.com)

---

## 📞 联系方式

- 作者: weisiren
- 邮箱: [你的邮箱]
- GitHub: [@weisiren](https://github.com/weisiren)

---

## 🎯 开发路线图

### 已完成
- [x] 基础API架构
- [x] SQLite数据库集成
- [x] 角色和事件数据
- [x] 搜索功能
- [x] 数据统计

### 计划中
- [ ] 数据关系分析API
- [ ] 图形数据导出API
- [ ] 实时数据更新
- [ ] 用户收藏功能
- [ ] API访问频率限制
