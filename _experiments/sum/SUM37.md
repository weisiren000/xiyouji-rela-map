# 西游记角色数据一对一校对报告

**时间**: 2024年
**任务**: 对比 `docs\data\dict\unid\allunid.jsonc` 与 `docs\data\JSON\character` 目录下的JSON文件

## 校对结果概述

### ✅ 正确的部分
- **总数量匹配**: allunid.jsonc 中有150个角色，character目录中有150个文件
- **ID范围正确**: 从 c0001 到 c0150，无缺失无多余
- **文件命名格式统一**: 都遵循 `character_c0001_xxx.json` 格式

### ❌ 发现的错误

**共发现 21 个错误文件**，主要问题是文件名与角色ID不匹配：

#### 错误详情列表

1. **c0113: 精细鬼**
   - 当前文件: `character_c0113_change.json`
   - 应该是: `character_c0113_jingxigui.json`

2. **c0114: 伶俐虫**
   - 当前文件: `character_c0114_wangmu_niangniang.json`
   - 应该是: `character_c0114_linglichong.json`

3. **c0115: 奔波儿灞**
   - 当前文件: `character_c0115_zhinu.json`
   - 应该是: `character_c0115_benboerba.json`

4. **c0116: 灞波儿奔**
   - 当前文件: `character_c0116_jinghe_longwang.json`
   - 应该是: `character_c0116_baboerben.json`

5. **c0117: 小钻风**
   - 当前文件: `character_c0117_taibai_jinxing.json`
   - 应该是: `character_c0117_xiaozuanfeng.json`

6. **c0118: 有来有去**
   - 当前文件: `character_c0118_erlang_shen.json`
   - 应该是: `character_c0118_youlaiyouqu.json`

7. **c0119: 嫦娥**
   - 当前文件: `character_c0119_nezha.json`
   - 应该是: `character_c0119_change.json`

8. **c0120: 王母娘娘**
   - 当前文件: `character_c0120_weizhi.json`
   - 应该是: `character_c0120_wangmu_niangniang.json`

9. **c0121: 赤脚大仙**
   - 当前文件: `character_c0121_tangtaizong.json`
   - 应该是: `character_c0121_chijiao_daxian.json`

10. **c0122: 福禄寿三星**
    - 当前文件: `character_c0122_tuota_tianwang.json`
    - 应该是: `character_c0122_fulushou_sanxing.json`

11. **c0123: 毗蓝婆菩萨**
    - 当前文件: `character_c0123_juzha.json`
    - 应该是: `character_c0123_pilanpo_pusa.json`

12. **c0124: 乌巢禅师**
    - 当前文件: `character_c0124_muzha.json`
    - 应该是: `character_c0124_wuchao_chanshi.json`

13. **c0125: 泾河龙王**
    - 当前文件: `character_c0125_honghaier.json`
    - 应该是: `character_c0125_jinghe_longwang.json`

14. **c0127: 黑水河鼍龙**
    - 当前文件: `character_c0127_wansheng_gongzhu.json`
    - 应该是: `character_c0127_heishuihe_tuolong.json`

15. **c0128: 虎先锋**
    - 当前文件: `character_c0128_jiutou_chong.json`
    - 应该是: `character_c0128_huxianfeng.json`

16. **c0129: 金池长老**
    - 当前文件: `character_c0129_xiaobailong.json`
    - 应该是: `character_c0129_jinchi_zhanglao.json`

17. **c0130: 凌虚子**
    - 当前文件: `character_c0130_jingxi_gui.json`
    - 应该是: `character_c0130_lingxuzi.json`

18. **c0131: 白花蛇精**
    - 当前文件: `character_c0131_lingli_chong.json`
    - 应该是: `character_c0131_baihuashe_jing.json`

19. **c0134: 狐阿七**
    - 当前文件: `character_c0134_xiaoyao_bing.json`
    - 应该是: `character_c0134_huaqi.json`

20. **c0135: 九尾狐**
    - 当前文件: `character_c0135_shanjing_guai.json`
    - 应该是: `character_c0135_jiuweihu.json`

21. **c0149: 金圣宫娘娘**
    - 当前文件: `character_c0149_jinsheng_gongniangniag.json`
    - 应该是: `character_c0149_jinsheng_gongniangniang.json`
    - **备注**: 文件名拼写错误 (gongniangniag → gongniangniang)

## 问题分析

### 错误类型
1. **ID错位**: 大部分错误是文件名与ID不匹配，似乎存在系统性的错位问题
2. **拼写错误**: c0149 文件名中有明显的拼写错误
3. **集中区域**: 错误主要集中在 c0113-c0135 区间

### 可能原因
- 文件重命名过程中出现错误
- 批量操作时ID映射错误
- 手动编辑时的疏忽

## 建议修复方案

1. **立即修复**: 重命名21个错误的文件名
2. **验证内容**: 检查文件内容是否与文件名匹配
3. **建立检查机制**: 创建自动化脚本定期检查数据一致性

## 工具脚本

已创建以下脚本用于检查：
- `character_validation.py`: 基础校对脚本
- `detailed_character_check.py`: 详细错误检查脚本

这些脚本可以重复使用来验证修复后的结果。
