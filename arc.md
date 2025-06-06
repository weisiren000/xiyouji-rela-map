# 西游记关系图谱项目结构

## 项目概述
本项目是一个西游记人物、事件、物品、地点和技能的关系图谱数据库。

## 目录结构

```
xiyouji-rela-map/
├── docs/
│   └── data/
│       └── dict/
│           ├── id_pub/                    # 原始ID格式数据
│           │   ├── artifact.jsonc        # 法宝数据
│           │   ├── character.jsonc       # 人物数据
│           │   ├── event.jsonc           # 事件数据
│           │   ├── item.jsonc            # 物品数据
│           │   ├── location.jsonc        # 地点数据
│           │   └── skill.jsonc           # 技能数据
│           ├── unid/                     # 唯一ID格式数据
│           │   ├── allunid.jsonc         # 统一合并数据文件（部分完整）
│           │   ├── allunid_status.jsonc  # 统一文件完整性状态报告
│           │   ├── data_index.jsonc      # 数据统计和索引文件
│           │   ├── artifact.jsonc        # 法宝数据（唯一ID格式）
│           │   ├── character.jsonc       # 人物数据（唯一ID格式）
│           │   ├── event.jsonc           # 事件数据（唯一ID格式）
│           │   ├── item.jsonc            # 物品数据（唯一ID格式）
│           │   ├── location.jsonc        # 地点数据（唯一ID格式）
│           │   └── skill.jsonc           # 技能数据（唯一ID格式）
│           ├── type/                     # 类型分类数据
│           │   ├── artifact.jsonc        # 法宝类型
│           │   ├── character.jsonc       # 人物类型
│           │   ├── event.jsonc           # 事件类型
│           │   ├── item.jsonc            # 物品类型
│           │   ├── location.jsonc        # 地点类型
│           │   └── skill.jsonc           # 技能类型
│           ├── level.jsonc               # 等级配置
│           ├── target.jsonc              # 目标配置
│           └── type.jsonc                # 类型配置
└── arc.md                               # 项目结构文档
```

## 数据格式说明

### 唯一ID格式 (unid)
新创建的唯一ID格式采用以下结构：

#### 标准格式 (character, event, item, location, skill)
```jsonc
{
    "unid": {
        "0001": "项目名称", // 描述注释
        "0002": "项目名称", // 描述注释
        // ...
    },

    "aliases_unid": {
        "A0001": "别名1", // 对应主项目的别名
        "A0002": "别名2", // 对应主项目的别名
        // ...
    }
}
```

#### Artifact特殊格式
```jsonc
{
    "unid": {
        "A0001": "法宝名称", // 描述注释
        "A0002": "法宝名称", // 描述注释
        // ...
    },

    "aliases_unid": {
        "AA0001": "别名1", // 对应主法宝的别名
        "AA0002": "别名2", // 对应主法宝的别名
        // ...
    }
}
```

### 特点
- **标准主要ID**: 使用4位数字格式 "0001", "0002" 等
- **标准别名ID**: 使用 "A" + 4位数字格式 "A0001", "A0002" 等
- **Artifact主要ID**: 使用 "A" + 4位数字格式 "A0001", "A0002" 等
- **Artifact别名ID**: 使用 "AA" + 4位数字格式 "AA0001", "AA0002" 等
- **注释**: 每个条目都包含详细的中文注释说明
- **结构化**: 别名与主条目通过注释建立关联关系

## 数据内容

### 人物数据 (character.jsonc)
- 包含150个主要人物
- 332个别名
- 涵盖主角团队、神仙、妖怪、配角等

### 事件数据 (event.jsonc)
- 包含55个主要事件
- 170个别名
- 按取经路线时间顺序组织

### 法宝数据 (artifact.jsonc)
- 包含67个法宝
- 186个别名
- 涵盖武器、法器、宝物等

### 物品数据 (item.jsonc)
- 包含64个物品
- 149个别名
- 主要是丹药、仙果、草药等

### 地点数据 (location.jsonc)
- 包含70个地点
- 192个别名
- 涵盖天庭、人间、地府各界

### 技能数据 (skill.jsonc)
- 包含65个技能
- 197个别名
- 涵盖法术、神通、武技等

## 更新日志

### 统一数据文件 (allunid.jsonc)
- **文件位置**: `docs/data/dict/unid/allunid.jsonc`
- **文件描述**: 包含所有6个类型数据的统一合并文件（100%完整）
- **数据结构**: 按类型分组，保持原有ID格式和别名系统
- **完整数据**: 471个实体 + 1122个别名 = 1593条记录（100%完整度）
- **包含类型**: character, event, artifact, item, location, skill
- **完整状态**: 所有类型均100%完整
- **文件大小**: 约1582行，130KB
- **状态文件**: `allunid_status.jsonc` 详细记录完整性状态

### 数据索引文件 (data_index.jsonc)
- **文件位置**: `docs/data/dict/unid/data_index.jsonc`
- **文件描述**: 提供完整的数据统计、索引映射和查询指南
- **包含内容**: 文件统计、ID系统、路径索引、完整性检查
- **总计数据**: 471个实体 + 1122个别名 = 1593条记录（基于原始文件）
- **用途**: 数据概览、快速定位、性能优化指导

### 2024年最新更新
- ✅ 创建了完整的唯一ID格式数据文件
- ✅ 为所有6个类别建立了统一的ID结构
- ✅ 添加了详细的中文注释和别名系统
- ✅ 保持了与原始数据的完整对应关系
- ✅ 调整了artifact.jsonc的ID格式：主条目使用"A0001"，别名使用"AA0001"
- ✅ 创建了allunid.jsonc统一数据文件（100%完整）
- ✅ 补充了完整的地点别名数据（la0031-la0192）
- ✅ 补充了完整的技能别名数据（sa0031-sa0197）
- ✅ 创建了data_index.jsonc数据索引和统计文件
- ✅ 创建了allunid_status.jsonc完整性状态报告
- ✅ 实现了100%数据完整性，包含全部1593条记录
- 📋 提供了完整的数据使用指南和最佳实践建议

## 使用说明

1. **原始格式**: 使用 `docs/data/dict/id_pub/` 下的文件
2. **唯一ID格式**: 使用 `docs/data/dict/unid/` 下的文件
3. **统一数据文件**: 使用 `docs/data/dict/unid/allunid.jsonc` 获取大部分数据
4. **数据索引**: 使用 `docs/data/dict/unid/data_index.jsonc` 获取完整统计
5. **类型分类**: 参考 `docs/data/dict/type/` 下的文件

### 推荐使用方式

#### 根据需求选择文件
- **完整功能**: 使用allunid.jsonc统一文件（100%完整）或对应类型的单独文件
- **快速开发**: 使用allunid.jsonc统一文件（推荐）
- **数据统计**: 使用data_index.jsonc索引文件
- **状态检查**: 参考allunid_status.jsonc状态报告

#### 具体场景建议
- **所有类型数据查询**: allunid.jsonc统一文件（推荐）
- **单类型高频查询**: 对应的单独文件（性能优化）
- **关系建立**: 基于allunid.jsonc的统一ID系统
- **跨类型分析**: allunid.jsonc统一文件

#### 数据完整性说明
- ✅ **所有类型**: character, event, artifact, item, location, skill（100%完整）
- ✅ **统一文件**: allunid.jsonc包含所有1593条记录
- 📋 **详细状态**: 查看allunid_status.jsonc文件

## 数据特色

- **全面性**: 覆盖西游记中的主要元素
- **结构化**: 统一的ID和别名系统
- **可扩展**: 支持后续数据添加和关系建立
- **中文友好**: 完整的中文注释和说明
