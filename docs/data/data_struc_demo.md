# 数据结构 "JSON Schema"
## 数据格式定义
### 节点数据结构
#### 角色数据结构样例（严格规定）

```jsonc
{
    "unid": "A0001", // 角色唯一ID
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
    },
    "links":
    {
        "唐僧": 
        {
            "type": "master", // 关系类型
            "strength": 0.8, // 关系强度
            "color": "#ff6b6b", // 关系颜色
            "width": 0.1 // 线条宽度
        },
        "猪八戒": 
        {
            "type": "friend",
            "strength": 0.6,
            "color": "#ff6b6b",
            "width": 0.1
        },
        "沙悟净": 
        {
            "type": "friend",
            "strength": 0.5,
            "color": "#ff6b6b",
            "width": 0.1
        }
    }
}
```