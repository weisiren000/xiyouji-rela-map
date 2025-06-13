# MEM36 - Character Alias 数据结构和创建方法记忆

## 核心记忆点

### 数据结构标准
Character_alias文件必须与character文件保持完全一致的JSON结构，关键区别：
- `isAlias: true` (character文件为false)
- 添加 `originalCharacter` 字段指向原角色unid
- `type: "character_alias"` 和 `category: "alias"`

### 文件命名规范
- 格式：`character_alias_ca####_拼音名称.json`
- 编号范围：ca0001-ca0332 (共332个)
- 拼音使用下划线分隔的小写格式

### 数据源位置
- 完整别名数据：`docs/data/dict/unid/allunid.jsonc`
- 原角色格式参考：`docs/data/JSON/character/character_c0001_sun_wu_kong.json`
- 目标目录：`docs/data/JSON/character_alias/`

### 质量要求
1. JSON格式必须正确可解析
2. 所有必需字段必须完整
3. isAlias字段必须为true
4. originalCharacter字段必须正确关联
5. 时间戳使用ISO 8601格式

### 批量创建方法
- 使用Python脚本进行批量生成
- 建立数据映射表确保准确性
- 分批次创建便于质量控制
- 实施自动化验证检查

### 项目重要性
这是西游记关系图谱项目的重要组成部分，别名数据的完整性直接影响：
- 数据检索的准确性
- 关系图谱的完整性
- 用户体验的友好性
- 后续分析的可靠性

## 技术细节记忆
- 每个别名都有对应的原角色关联
- 属性数据可以继承原角色的设定
- 元数据需要个性化描述和标签
- 章节引用需要准确反映别名出现情况
