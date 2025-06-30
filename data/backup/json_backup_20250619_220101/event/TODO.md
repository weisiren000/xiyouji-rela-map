# 西游记事件文件修正 TODO 列表

根据 allunid.jsonc 文件的定义，以下事件文件需要创建或修正：

## 已完成的文件

1. ✅ `event_e0042_pan_si_dong_yu_zhi_zhu_jing.json` - 盘丝洞遇蜘蛛精 (七仙姑)
2. ✅ `event_e0043_huang_hua_guan_yu_wu_gong_jing.json` - 黄花观遇蜈蚣精 (百眼魔君)
3. ✅ `event_e0044_shi_tuo_ling_san_mo.json` - 狮驼岭三魔 (青狮白象大鹏)
4. ✅ `event_e0045_bi_qiu_guo_yu_hu_jing.json` - 比丘国遇虎精 (白鹿精)
5. ✅ `event_e0046_xian_kong_shan_wu_di_dong_yu_bai_mao_lao_shu_jing.json` - 陷空山无底洞遇白毛老鼠精 (地涌夫人)
6. ✅ `event_e0047_yin_wu_shan_lian_huan_dong_yu_bao_zi_jing.json` - 隐雾山连环洞遇豹子精 (艾叶花皮豹子)
7. ✅ `event_e0048_bao_tou_shan_hu_kou_jian_yu_huang_shi_jing.json` - 豹头山虎口涧遇黄狮精 (黄狮精)
8. ✅ `event_e0049_qing_long_shan_xuan_ying_dong_yu_xi_niu_jing.json` - 青龙山玄英洞遇犀牛精 (辟寒辟暑辟尘)
9. ✅ `event_e0050_tian_zhu_guo_yu_yu_tu.json` - 天竺国遇玉兔 (玉兔精)
10. ✅ `event_e0051_di_da_da_lei_yin_si_qiu_de_zhen_jing.json` - 抵达大雷音寺求得真经 (灵山取经)
11. ✅ `event_e0052_tong_tian_he_yu_lao_bai_yuan.json` - 通天河遇老白鼋 (老鼋翻船)
12. ✅ `event_e0053_fan_hui_chang_an.json` - 返回长安 (功德圆满)
13. ✅ `event_e0054_shi_tu_cheng_fo_de_dao.json` - 师徒成佛得道 (旃檀功德佛)
14. ✅ `event_e0055_jiu_jiu_ba_shi_yi_nan.json` - 九九八十一难 (八十一难)

## 其他需要检查的文件

需要检查 e0001 到 e0041 的事件文件是否与 allunid.jsonc 中的定义一致。

## 文件格式参考

每个文件应包含以下基本结构：

```json
{
    "unid": "e00XX",
    "isAlias": false,
    "basic": {
        "name": "事件名称",
        "pinyin": "pinyin_格式",
        "aliases": [
            "别名1",
            "别名2",
            "别名3"
        ],
        "type": "event",
        "category": "适当分类"
    },
    "attributes": {
        "level": {
            "id": "major/medium/minor",
            "name": "重大事件/中等事件/小事件",
            "tier": 7/6/5,
            "category": "important/standard/minor"
        },
        "significance": 75,
        "impact": 70
    },
    "participants": [
        {
            "unid": "c0001",
            "name": "孙悟空",
            "role": "protagonist/antagonist/supporting/victim"
        },
        // 其他参与者...
    ],
    "locations": [
        {
            "unid": "l0001",
            "name": "地点名称",
            "role": "primary/secondary"
        },
        // 其他地点...
    ],
    "items_involved": [
        {
            "unid": "a0001",
            "name": "物品名称",
            "role": "key_item/secondary_item"
        },
        // 其他物品...
    ],
    "metadata": {
        "description": "事件描述...",
        "tags": [
            "标签1",
            "标签2",
            "标签3",
            "标签4",
            "标签5"
        ],
        "sourceChapters": [章节号],
        "chronology": {
            "order": XX,
            "era": "journey/heaven/early_life"
        },
        "lastUpdated": "2024-07-XX"
    }
}
```

## 进度跟踪

- [x] 创建 event_e0042_pan_si_dong_yu_zhi_zhu_jing.json
- [x] 创建 event_e0043_huang_hua_guan_yu_wu_gong_jing.json
- [x] 创建 event_e0044_shi_tuo_ling_san_mo.json
- [x] 创建 event_e0045_bi_qiu_guo_yu_hu_jing.json
- [x] 创建 event_e0046_xian_kong_shan_wu_di_dong_yu_bai_mao_lao_shu_jing.json
- [x] 创建 event_e0047_yin_wu_shan_lian_huan_dong_yu_bao_zi_jing.json
- [x] 创建 event_e0048_bao_tou_shan_hu_kou_jian_yu_huang_shi_jing.json
- [x] 创建 event_e0049_qing_long_shan_xuan_ying_dong_yu_xi_niu_jing.json
- [x] 创建 event_e0050_tian_zhu_guo_yu_yu_tu.json
- [x] 创建 event_e0051_di_da_da_lei_yin_si_qiu_de_zhen_jing.json
- [x] 创建 event_e0052_tong_tian_he_yu_lao_bai_yuan.json
- [x] 创建 event_e0053_fan_hui_chang_an.json
- [x] 创建 event_e0054_shi_tu_cheng_fo_de_dao.json
- [x] 创建 event_e0055_jiu_jiu_ba_shi_yi_nan.json 