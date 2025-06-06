# 数据结构 "JSON Schema"
## 数据格式定义
### 节点数据结构
#### 角色数据结构样例（严格规定）

```jsonc
{
    "id": "1", // 角色唯一ID
    "name": "孙悟空", //
    "pinyin": "sun_wu_kong", // 角色拼音
    "aliases": ["美猴王", "齐天大圣", "孙行者", "斗战胜佛", "..."], // 多角色名称
    "type": "character", // 类型
    "level": "da_luo_jin_xian", // 角色境界
    "rank": "1",
    "target": 
    {
        "tang_seng": "master",
        "zhu_ba_jie": "friend",
        "sha_wu_jing": "friend",
        "hua_guo_shan": "birthplace"
    }, 
    "visual":
    {   
        "position": [x, y, z], // 位置
        "appearance":
        {
        "color": "#ff6b6b", // 角色颜色
        "base_size": 1, // 角色基础大小
        "shape": "sphere", // 角色形状
        "glow": 
        {
            "enable": true,
            "intensity": 0.1,
            "color": "#ff6b6b"
        }
        }
    }
}
```