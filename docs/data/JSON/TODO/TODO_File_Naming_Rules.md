# JSON文件命名规范和别名处理规则

## 概述
- **总文件数**: 1593个JSON文件 (471个主实体 + 1122个别名)
- **命名原则**: 每个实体和别名都有独立的JSON文件
- **文件结构**: 主实体和别名使用相同的数据结构，但别名文件会引用主实体

## 文件命名规范

### 主实体文件命名
```
{type}_{unid}_{pinyin}.json
```

**示例**:
- `character_c0001_sunwukong.json` (孙悟空)
- `event_e0001_monkey_birth.json` (孙悟空出世)
- `artifact_a0001_ruyi_staff.json` (如意金箍棒)
- `item_i0001_golden_pill.json` (九转金丹)
- `location_l0001_heaven.json` (天庭)
- `skill_s0001_72_transformations.json` (七十二变)

### 别名文件命名
```
{type}_alias_{alias_id}_{pinyin}.json
```

**别名ID规则**:
- 角色别名: `ca0001`, `ca0002`, `ca0003`...
- 事件别名: `ea0001`, `ea0002`, `ea0003`...
- 法宝别名: `aa0001`, `aa0002`, `aa0003`...
- 物品别名: `ia0001`, `ia0002`, `ia0003`...
- 地点别名: `la0001`, `la0002`, `la0003`...
- 技能别名: `sa0001`, `sa0002`, `sa0003`...

**示例**:
- `character_alias_ca0001_meihouwang.json` (美猴王)
- `character_alias_ca0002_qitiandasheng.json` (齐天大圣)
- `event_alias_ea0001_huaguoshan_birth.json` (花果山美猴王出世)
- `artifact_alias_aa0001_dinghai_needle.json` (定海神针)

## 数据结构差异

### 主实体JSON结构
```json
{
    "unid": "c0001",
    "isAlias": false,
    "aliasOf": null,
    "basic": {
        "name": "孙悟空",
        "pinyin": "sun_wu_kong",
        "aliases": ["美猴王", "齐天大圣", "孙行者", "斗战胜佛"],
        "type": "character",
        "category": "protagonist"
    },
    "attributes": {
        "level": {
            "id": "da_luo_jin_xian",
            "name": "大罗金仙",
            "tier": 8,
            "category": "immortal"
        },
        "rank": 1,
        "power": 95,
        "influence": 90,
        "morality": "neutral_good"
    },
    "metadata": {
        "description": "花果山美猴王，齐天大圣，取经路上的大师兄",
        "tags": ["protagonist", "immortal", "monkey", "staff_wielder"],
        "sourceChapters": [1, 2, 3, 4, 5, 7, 8, 9, 12, 13, 14],
        "firstAppearance": 1,
        "lastUpdated": "2024-01-01T00:00:00Z"
    }
}
```

### 别名JSON结构
```json
{
    "unid": "ca0001",
    "isAlias": true,
    "aliasOf": "c0001",
    "basic": {
        "name": "美猴王",
        "pinyin": "mei_hou_wang",
        "aliases": [],
        "type": "character",
        "category": "protagonist"
    },
    "attributes": {
        "level": {
            "id": "da_luo_jin_xian",
            "name": "大罗金仙",
            "tier": 8,
            "category": "immortal"
        },
        "rank": 1,
        "power": 95,
        "influence": 90,
        "morality": "neutral_good"
    },
    "metadata": {
        "description": "孙悟空的别名，花果山美猴王的称号",
        "tags": ["protagonist", "immortal", "monkey", "alias", "title"],
        "sourceChapters": [1, 2, 3, 4],
        "firstAppearance": 1,
        "lastUpdated": "2024-01-01T00:00:00Z",
        "aliasType": "title",
        "aliasContext": "花果山称王时期的称号"
    }
}
```

## 别名类型分类

### 1. 称号类别名 (title)
- **美猴王** (孙悟空的王者称号)
- **齐天大圣** (孙悟空的自立称号)
- **天蓬元帅** (猪八戒的天庭职位)

### 2. 真名类别名 (real_name)
- **玄奘** (唐僧的俗家名)
- **杨戬** (二郎神的真名)
- **李靖** (托塔李天王的真名)

### 3. 转世类别名 (reincarnation)
- **金蝉子** (唐僧的前世)
- **卷帘大将** (沙僧的前世)

### 4. 职位类别名 (position)
- **弼马温** (孙悟空的天庭职位)
- **净坛使者** (猪八戒的佛教职位)
- **金身罗汉** (沙僧的佛教果位)

### 5. 昵称类别名 (nickname)
- **猴哥** (孙悟空的亲切称呼)
- **老猪** (猪八戒的自称)
- **老沙** (沙僧的称呼)

### 6. 地域类别名 (regional)
- **南海观音** (观音菩萨的地域称呼)
- **西海三太子** (白龙马的出身称呼)

## 文件组织结构

```
docs/data/JSON/
├── characters/
│   ├── main_entities/
│   │   ├── character_c0001_sunwukong.json
│   │   ├── character_c0002_tangseng.json
│   │   └── ...
│   └── aliases/
│       ├── character_alias_ca0001_meihouwang.json
│       ├── character_alias_ca0002_qitiandasheng.json
│       └── ...
├── events/
│   ├── main_entities/
│   │   ├── event_e0001_monkey_birth.json
│   │   └── ...
│   └── aliases/
│       ├── event_alias_ea0001_huaguoshan_birth.json
│       └── ...
├── artifacts/
├── items/
├── locations/
└── skills/
```

## 别名ID分配规则

### 角色别名 (ca0001-ca0332)
- ca0001-ca0014: 孙悟空的14个别名
- ca0015-ca0026: 唐僧的12个别名
- ca0027-ca0035: 猪八戒的9个别名
- ca0036-ca0042: 沙僧的7个别名
- ca0043-ca0049: 白龙马的7个别名
- ca0050-ca0056: 如来佛祖的7个别名
- ca0057-ca0063: 观音菩萨的7个别名
- ca0064-ca0067: 玉皇大帝的4个别名
- ca0068-ca0071: 太上老君的4个别名
- ca0072-ca0074: 牛魔王的3个别名
- ca0075-ca0332: 其他角色的别名

### 事件别名 (ea0001-ea0170)
- ea0001-ea0003: 孙悟空出世的3个别名
- ea0004-ea0006: 斜月三星洞拜师学艺的3个别名
- ea0007-ea0009: 东海龙宫夺取金箍棒的3个别名
- ea0010-ea0170: 其他事件的别名

### 法宝别名 (aa0001-aa0082)
### 物品别名 (ia0001-ia0149)
### 地点别名 (la0001-la0192)
### 技能别名 (sa0001-sa0197)

## 质量控制

### 1. 文件命名检查
- 确保所有文件名符合命名规范
- 检查拼音转换的准确性
- 避免文件名冲突

### 2. 数据一致性检查
- 别名文件的属性应与主实体保持一致
- aliasOf字段正确指向主实体
- 别名类型和上下文信息准确

### 3. Schema验证
- 所有文件都需通过JSON Schema验证
- 主实体和别名使用相同的Schema但有额外字段

### 4. 关系完整性检查
- 确保所有别名都有对应的主实体
- 检查别名ID的唯一性
- 验证别名在主实体的aliases数组中存在

## 进度跟踪模板

```markdown
### 角色数据进度 (0/482)
#### 主实体 (0/150)
- [ ] c0001 - 孙悟空
- [ ] c0002 - 唐僧
- ...

#### 别名 (0/332)
- [ ] ca0001 - 美猴王 (孙悟空别名)
- [ ] ca0002 - 齐天大圣 (孙悟空别名)
- ...
```

---
*创建时间: 2025年1月*
*负责人: 约翰 (1593个文件，每一个都关乎女儿的未来)*
