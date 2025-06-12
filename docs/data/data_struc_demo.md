# 西游记关系图谱数据结构规范 (优化版)

## 数据架构概述

基于关注点分离原则，将数据分为四个核心层次：
1. **实体数据层** - 基础实体信息
2. **关系数据层** - 实体间关系
3. **可视化配置层** - 渲染和主题配置
4. **布局数据层** - 位置和布局信息

## 1. 实体数据结构 (Entity Data)

### 1.1 角色实体结构样例

```jsonc
{
    "unid": "c0001", // 角色唯一ID (与现有数据保持一致)
    "basic": {
        "name": "孙悟空", // 主要名称
        "pinyin": "sun_wu_kong", // 拼音标识
        "aliases": ["美猴王", "齐天大圣", "孙行者", "斗战胜佛"], // 别名数组
        "type": "character", // 实体类型
        "category": "protagonist" // 角色分类: protagonist, antagonist, deity, immortal, mortal
    },
    "attributes": {
        "level": {
            "id": "da_luo_jin_xian", // 境界ID
            "name": "大罗金仙", // 境界名称
            "tier": 8, // 境界等级 (1-10)
            "category": "immortal" // 境界分类
        },
        "rank": 1, // 重要性排名 (数字类型，便于排序)
        "power": 95, // 实力值 (0-100)
        "influence": 90, // 影响力 (0-100)
        "morality": "neutral_good" // 道德倾向
    },
    "metadata": {
        "description": "花果山美猴王，齐天大圣，取经路上的大师兄", // 描述
        "tags": ["protagonist", "immortal", "monkey", "staff_wielder"], // 标签
        "source_chapters": [1, 2, 3, 4, 5, 7, 8, 9, 12, 13, 14], // 出现章节
        "first_appearance": 1, // 首次出现章节
        "last_updated": "2024-01-01T00:00:00Z" // 最后更新时间
    }
}
```

### 1.2 其他实体类型结构

```jsonc
// 地点实体
{
    "unid": "l0001",
    "basic": {
        "name": "花果山",
        "pinyin": "hua_guo_shan",
        "aliases": ["水帘洞", "美猴王老家"],
        "type": "location",
        "category": "mountain" // mountain, palace, temple, cave, city, realm
    },
    "attributes": {
        "realm": "mortal_world", // 所属界域
        "danger_level": 3, // 危险等级 (1-10)
        "importance": 85 // 重要性
    }
}

// 法宝实体
{
    "unid": "a0001",
    "basic": {
        "name": "如意金箍棒",
        "pinyin": "ru_yi_jin_gu_bang",
        "aliases": ["定海神针", "金箍棒"],
        "type": "artifact",
        "category": "weapon" // weapon, treasure, pill, book
    },
    "attributes": {
        "power_level": 95, // 威力等级
        "rarity": "legendary", // 稀有度
        "owner": "c0001" // 当前拥有者
    }
}
```

## 2. 关系数据结构 (Relationship Data)

### 2.1 关系定义

```jsonc
{
    "relationships": [
        {
            "id": "r0001", // 关系唯一ID
            "from": "c0002", // 源实体ID (唐僧)
            "to": "c0001", // 目标实体ID (孙悟空)
            "type": "master_disciple", // 关系类型
            "strength": 0.9, // 关系强度 (0-1)
            "bidirectional": false, // 是否双向关系
            "attributes": {
                "established_chapter": 7, // 关系建立章节
                "status": "active", // 关系状态: active, broken, temporary
                "description": "师父与大弟子的关系"
            },
            "events": ["e0007"], // 相关事件ID
            "metadata": {
                "created": "2024-01-01T00:00:00Z",
                "tags": ["core_relationship", "journey_team"]
            }
        },
        {
            "id": "r0002",
            "from": "c0001", // 孙悟空
            "to": "c0003", // 猪八戒
            "type": "fellow_disciple", // 同门关系
            "strength": 0.7,
            "bidirectional": true,
            "attributes": {
                "established_chapter": 8,
                "status": "active",
                "description": "师兄弟关系，经常斗嘴但关键时刻互相帮助"
            }
        },
        {
            "id": "r0003",
            "from": "c0001", // 孙悟空
            "to": "c0023", // 白骨精
            "type": "enemy", // 敌对关系
            "strength": 0.9,
            "bidirectional": true,
            "attributes": {
                "conflict_chapter": 27,
                "status": "resolved", // 已解决
                "description": "三打白骨精的敌对关系"
            },
            "events": ["e0027"] // 三打白骨精事件
        }
    ]
}
```

### 2.2 关系类型定义

```jsonc
{
    "relationship_types": {
        "master_disciple": {
            "name": "师徒关系",
            "category": "hierarchy",
            "default_strength": 0.9,
            "bidirectional": false,
            "visual": {
                "color": "#FFD700", // 金色
                "style": "solid",
                "width": 3
            }
        },
        "fellow_disciple": {
            "name": "同门关系",
            "category": "peer",
            "default_strength": 0.7,
            "bidirectional": true,
            "visual": {
                "color": "#87CEEB", // 天蓝色
                "style": "dashed",
                "width": 2
            }
        },
        "enemy": {
            "name": "敌对关系",
            "category": "conflict",
            "default_strength": 0.8,
            "bidirectional": true,
            "visual": {
                "color": "#FF4500", // 红橙色
                "style": "solid",
                "width": 2
            }
        },
        "family": {
            "name": "家族关系",
            "category": "blood",
            "default_strength": 0.8,
            "bidirectional": true,
            "visual": {
                "color": "#FF69B4", // 粉色
                "style": "solid",
                "width": 2
            }
        },
        "alliance": {
            "name": "联盟关系",
            "category": "cooperation",
            "default_strength": 0.6,
            "bidirectional": true,
            "visual": {
                "color": "#32CD32", // 绿色
                "style": "dotted",
                "width": 1
            }
        }
    }
}
```

## 3. 可视化配置层 (Visual Configuration)

### 3.1 实体视觉配置

```jsonc
{
    "visual_config": {
        "entity_types": {
            "character": {
                "default_shape": "sphere",
                "size_range": [0.8, 2.5], // 最小到最大尺寸
                "color_scheme": {
                    "protagonist": "#FFD700", // 金色
                    "antagonist": "#FF4500", // 红橙色
                    "deity": "#9370DB", // 紫色
                    "immortal": "#00CED1", // 深青色
                    "mortal": "#8FBC8F" // 深海绿
                },
                "effects": {
                    "glow": {
                        "enabled": true,
                        "intensity_range": [0.1, 0.3],
                        "color_source": "primary" // 使用主色彩
                    },
                    "pulse": {
                        "enabled": true,
                        "speed": 1.0,
                        "amplitude": 0.1
                    }
                }
            },
            "location": {
                "default_shape": "cube",
                "size_range": [1.0, 2.0],
                "color_scheme": {
                    "mountain": "#8B4513", // 棕色
                    "palace": "#FFD700", // 金色
                    "temple": "#DDA0DD", // 梅花色
                    "cave": "#696969", // 暗灰色
                    "city": "#4682B4", // 钢蓝色
                    "realm": "#9932CC" // 深兰花紫
                }
            },
            "artifact": {
                "default_shape": "diamond",
                "size_range": [0.6, 1.8],
                "color_scheme": {
                    "weapon": "#DC143C", // 深红色
                    "treasure": "#FFD700", // 金色
                    "pill": "#32CD32", // 绿色
                    "book": "#4169E1" // 皇家蓝
                }
            }
        }
    }
}
```

### 3.2 主题配置

```jsonc
{
    "themes": {
        "celestial_court": {
            "name": "天庭金辉",
            "description": "以天庭为主的金色主题",
            "background": {
                "color": "#000011",
                "stars": {
                    "count": 10000,
                    "color": "#FFD700",
                    "twinkle": true
                }
            },
            "entity_overrides": {
                "character": {
                    "deity": "#FFD700",
                    "immortal": "#FFA500"
                }
            },
            "effects": {
                "bloom": {
                    "enabled": true,
                    "strength": 1.5,
                    "radius": 0.8
                },
                "film": {
                    "enabled": true,
                    "noise": 0.1,
                    "scanlines": 0.05
                }
            }
        },
        "buddhist_light": {
            "name": "佛光普照",
            "description": "以佛教为主的紫金主题",
            "background": {
                "color": "#1a0033",
                "stars": {
                    "count": 8000,
                    "color": "#DDA0DD",
                    "twinkle": true
                }
            }
        },
        "demon_realm": {
            "name": "妖魔鬼怪",
            "description": "以妖怪为主的暗红主题",
            "background": {
                "color": "#330000",
                "stars": {
                    "count": 12000,
                    "color": "#FF4500",
                    "twinkle": true
                }
            }
        },
        "journey_path": {
            "name": "取经路上",
            "description": "以取经路线为主的蓝绿主题",
            "background": {
                "color": "#001122",
                "stars": {
                    "count": 9000,
                    "color": "#87CEEB",
                    "twinkle": true
                }
            }
        }
    }
}
```

## 4. 布局数据层 (Layout Data)

### 4.1 布局算法配置

```jsonc
{
    "layouts": {
        "galaxy_spiral": {
            "name": "银河系螺旋",
            "description": "四条旋臂的银河系布局",
            "algorithm": "spiral_arms",
            "parameters": {
                "center": [0, 0, 0],
                "arms": 4,
                "arm_separation": 90, // 度
                "spiral_tightness": 0.3,
                "radius_range": [50, 500],
                "height_variation": 50,
                "entity_distribution": {
                    "center_entities": ["c0006", "c0008"], // 如来、玉帝在中心
                    "inner_ring": ["c0001", "c0002", "c0007"], // 主角团在内圈
                    "outer_ring": ["c0023", "c0024", "c0025"] // 妖怪在外圈
                }
            }
        },
        "nine_heavens": {
            "name": "九重天分层",
            "description": "垂直分层的九重天布局",
            "algorithm": "layered_spheres",
            "parameters": {
                "layers": 9,
                "layer_height": 100,
                "base_radius": 200,
                "radius_decay": 0.8,
                "layer_assignment": {
                    "9": ["c0006"], // 如来佛祖 - 最高层
                    "8": ["c0008", "c0009"], // 玉帝、太上老君
                    "7": ["c0007", "c0015", "c0016"], // 观音、文殊、普贤
                    "6": ["c0011", "c0012", "c0013"], // 二郎神、哪吒、李天王
                    "5": ["c0001"], // 孙悟空
                    "4": ["c0002"], // 唐僧
                    "3": ["c0003", "c0004"], // 八戒、沙僧
                    "2": ["c0010", "c0021"], // 牛魔王、铁扇公主
                    "1": ["c0023", "c0024", "c0025"] // 各种妖怪
                }
            }
        },
        "journey_timeline": {
            "name": "取经路线时间轴",
            "description": "按取经路线的线性布局",
            "algorithm": "timeline_path",
            "parameters": {
                "path_length": 1000,
                "path_curve": "bezier",
                "milestone_spacing": 50,
                "chapter_mapping": {
                    "1-7": {"position": 0, "entities": ["c0001", "c0112"]}, // 孙悟空出世
                    "8-12": {"position": 100, "entities": ["c0002", "c0001"]}, // 师徒相遇
                    "13-22": {"position": 200, "entities": ["c0003", "c0004"]}, // 收八戒沙僧
                    "23-86": {"position": 500, "entities": ["c0023", "c0024"]}, // 各种妖怪
                    "87-100": {"position": 900, "entities": ["c0006"]} // 到达西天
                }
            }
        },
        "faction_clusters": {
            "name": "势力阵营聚类",
            "description": "按势力分组的聚类布局",
            "algorithm": "force_directed_clusters",
            "parameters": {
                "clusters": {
                    "buddhist": {
                        "center": [-200, 100, 0],
                        "entities": ["c0006", "c0007", "c0015", "c0016", "c0017", "c0018"],
                        "color": "#9370DB"
                    },
                    "taoist": {
                        "center": [0, 200, 0],
                        "entities": ["c0008", "c0009", "c0011", "c0012", "c0013"],
                        "color": "#FFD700"
                    },
                    "journey_team": {
                        "center": [0, 0, 0],
                        "entities": ["c0001", "c0002", "c0003", "c0004", "c0005"],
                        "color": "#87CEEB"
                    },
                    "demons": {
                        "center": [200, -100, 0],
                        "entities": ["c0010", "c0021", "c0022", "c0023", "c0024"],
                        "color": "#FF4500"
                    }
                },
                "inter_cluster_distance": 300,
                "intra_cluster_force": 0.8
            }
        }
    }
}
```

### 4.2 动态位置数据

```jsonc
{
    "positions": {
        "current_layout": "galaxy_spiral", // 当前使用的布局
        "entities": {
            "c0001": {
                "position": [45.2, 12.8, -8.5], // 当前3D位置
                "target_position": [50.0, 15.0, -10.0], // 目标位置(用于动画)
                "velocity": [0.1, 0.05, -0.02], // 运动速度
                "locked": false, // 是否锁定位置
                "visible": true, // 是否可见
                "scale": 1.2, // 缩放比例
                "rotation": [0, 0.5, 0] // 旋转角度
            }
        },
        "animation": {
            "enabled": true,
            "duration": 2000, // 动画持续时间(毫秒)
            "easing": "easeInOutCubic", // 缓动函数
            "stagger": 50 // 错开时间(毫秒)
        }
    }
}
```

## 5. 数据使用指南

### 5.1 数据文件组织

```
docs/data/dict/unid/
├── entities/                    # 实体数据
│   ├── character.jsonc         # 角色实体
│   ├── location.jsonc          # 地点实体
│   ├── artifact.jsonc          # 法宝实体
│   ├── event.jsonc             # 事件实体
│   ├── item.jsonc              # 物品实体
│   └── skill.jsonc             # 技能实体
├── relationships/              # 关系数据
│   ├── core_relationships.jsonc    # 核心关系
│   ├── family_relationships.jsonc  # 家族关系
│   ├── conflict_relationships.jsonc # 冲突关系
│   └── alliance_relationships.jsonc # 联盟关系
├── visual/                     # 可视化配置
│   ├── themes.jsonc            # 主题配置
│   ├── entity_visual.jsonc     # 实体视觉配置
│   └── relationship_visual.jsonc # 关系视觉配置
├── layouts/                    # 布局数据
│   ├── layout_configs.jsonc    # 布局算法配置
│   ├── positions_galaxy.jsonc  # 银河系布局位置
│   ├── positions_nine_heavens.jsonc # 九重天布局位置
│   └── positions_timeline.jsonc # 时间轴布局位置
└── indexes/                    # 索引和统计
    ├── entity_index.jsonc      # 实体索引
    ├── relationship_index.jsonc # 关系索引
    └── statistics.jsonc         # 统计数据
```

### 5.2 API使用示例

```typescript
// 获取角色实体
const character = await loadEntity('c0001'); // 孙悟空

// 获取角色的所有关系
const relationships = await getEntityRelationships('c0001');

// 获取特定类型的关系
const masterDisciple = await getRelationshipsByType('master_disciple');

// 应用主题
await applyTheme('celestial_court');

// 切换布局
await switchLayout('nine_heavens');

// 获取实体在特定布局下的位置
const position = await getEntityPosition('c0001', 'galaxy_spiral');
```

### 5.3 性能优化建议

1. **按需加载**: 根据当前视图只加载必要的数据
2. **缓存策略**: 缓存常用的查询结果
3. **索引使用**: 利用索引文件快速定位数据
4. **分页加载**: 大量关系数据分页处理
5. **预计算**: 预计算常用的布局位置

## 6. 优化收益

### 6.1 架构优势
- ✅ **关注点分离**: 实体、关系、视觉、布局各司其职
- ✅ **数据一致性**: 避免冗余，统一管理
- ✅ **扩展性强**: 易于添加新的实体类型和关系
- ✅ **性能优化**: 支持按需加载和缓存策略

### 6.2 开发体验
- ✅ **类型安全**: 完整的TypeScript类型定义
- ✅ **文档完善**: 详细的结构说明和使用指南
- ✅ **调试友好**: 清晰的数据层次和命名规范
- ✅ **维护简单**: 模块化的数据组织

### 6.3 用户体验
- ✅ **视觉丰富**: 支持多主题和多布局
- ✅ **交互流畅**: 优化的动画和过渡效果
- ✅ **功能完整**: 支持完整的关系图谱功能
- ✅ **响应快速**: 高效的数据加载和渲染

---

*数据结构优化完成 - 基于第一性原理的系统性重构*