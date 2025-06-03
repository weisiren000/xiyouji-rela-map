# 数据结构

## 数据格式定义

### 节点数据结构
#### 角色数据结构样例（严格规定）
```json
{
    "id": "sun_wu_kong", // 角色唯一ID
    "name": "孙悟空",
    "english_name": "Monkey King", // 角色英文名称
    "pinyin": "sun_wu_kong", // 角色拼音
    "aliases": ["美猴王", "齐天大圣", "孙行者", "斗战胜佛", "..."], // 多角色名称
    "classification": // 分类
    {
        "type": "charactor", // 角色类型
        "category": "protagonist", // 角色所属阵营（主角、反角、中立...）
        "function": "main_character", // 角色在故事中的功能
        "ability": "combat", // 角色主要能力
        "growth": "dynamic" // 角色成长类型
    },
    "level": "da_luo_jin_xian", // 角色境界
    "position": "x, y, z", // 角色3D空间位置
    "color": "######", // 角色颜色
    "size": 1, // 角色大小
    "shape": "sphere", // 角色形状
    "glow": true, // 角色是否发光
    "target": // 关系连线目标
    {
        "tang_seng": "master",
        "zhu_ba_jie": "friend",
        "sha_wu_jing": "friend",
        "hua_guo_shan": "birthplace"
    }, // 角色目标
    "target_buff": // 目标连线buff(增益效果)
    {
        "character_buff":
        {
            "glow": 0.1,
            "size": 0.1
        },
        "event_buff":
        {
            "glow": 0.1,
            "size": 0.1
        }
    }

}
```
### 关系数据结构
```json
{
    "source_id": "sun_wu_kong",
    "target": "tang_seng",
    "type": "master-disciple",
    "weight": 1,
    "color": "######"
}
```