# SQLite迁移快速开始指南

## 🚀 一键迁移（推荐新手）

### 第一步：检查环境
```powershell
# 确保在项目根目录
cd D:\codee\xiyouji-rela-map

# 检查当前工作目录
pwd

# 验证项目结构
dir docs\data\JSON\character
```

### 第二步：运行自动迁移
```powershell
# 先进行预演（不会实际修改任何文件）
.\scripts\migration\auto-migration.ps1 -DryRun -Verbose

# 确认无误后执行实际迁移
.\scripts\migration\auto-migration.ps1 -Verbose
```

### 第三步：验证结果
```powershell
# 检查数据库文件
dir data\characters.db

# 运行性能测试
node scripts\data-migration\performance-comparison.js

# 启动应用验证
npm run dev
```

## 🔧 分步迁移（推荐有经验用户）

### 阶段1：环境准备
```powershell
.\scripts\migration\auto-migration.ps1 -Phase 1
```
**完成内容：**
- ✅ 安装SQLite依赖
- ✅ 创建必要目录
- ✅ 备份现有JSON数据

### 阶段2：数据库初始化
```powershell
.\scripts\migration\auto-migration.ps1 -Phase 2
```
**完成内容：**
- ✅ 创建SQLite数据库
- ✅ 迁移JSON数据到数据库
- ✅ 验证数据完整性

### 阶段3：代码重构
```powershell
.\scripts\migration\auto-migration.ps1 -Phase 3
```
**需要手动完成：**
- 📝 创建数据库访问层代码
- 📝 更新服务器API接口
- 📝 实现数据格式适配器

### 阶段4：并行测试
```powershell
.\scripts\migration\auto-migration.ps1 -Phase 4
```
**完成内容：**
- ✅ 设置混合数据源模式
- ✅ 运行性能对比测试
- ✅ 验证数据一致性

### 阶段5：切换上线
```powershell
.\scripts\migration\auto-migration.ps1 -Phase 5
```
**完成内容：**
- ✅ 切换到SQLite数据源
- ✅ 创建生产环境配置
- ✅ 启用性能监控

### 阶段6：清理优化
```powershell
.\scripts\migration\auto-migration.ps1 -Phase 6
```
**完成内容：**
- ✅ 备份旧代码
- ✅ 清理不需要的文件
- ✅ 生成迁移报告

## 🆘 紧急回滚

### 快速回滚到最新备份
```powershell
.\scripts\migration\rollback.ps1 -Force
```

### 回滚到指定备份
```powershell
# 查看可用备份
.\scripts\migration\rollback.ps1

# 回滚到指定时间戳的备份
.\scripts\migration\rollback.ps1 -BackupTimestamp "20250619_143022"
```

## 📊 性能对比预期

| 操作 | JSON方案 | SQLite方案 | 提升倍数 |
|------|----------|------------|----------|
| 加载所有角色 | 245ms | 15ms | **16x** |
| 按名称搜索 | 12ms | 2ms | **6x** |
| 按类型过滤 | 8ms | 1ms | **8x** |
| 按等级排序 | 25ms | 3ms | **8x** |
| 内存使用 | 高 | 低 | **-70%** |

## ⚠️ 注意事项

### 迁移前检查
- [ ] 确保Node.js版本 >= 14
- [ ] 确保有足够磁盘空间（至少500MB）
- [ ] 确保没有其他进程占用数据文件
- [ ] 建议在非生产环境先测试

### 常见问题

**Q: 迁移失败怎么办？**
A: 运行回滚脚本恢复到原始状态，检查错误日志后重试

**Q: 性能提升不明显？**
A: 检查数据库索引是否正确创建，运行性能测试脚本分析

**Q: 前端功能异常？**
A: 检查数据格式适配器是否正确转换数据格式

**Q: 如何验证数据完整性？**
A: 运行验证脚本对比迁移前后的数据量和关键字段

## 🔍 验证清单

### 功能验证
- [ ] 角色列表正常加载
- [ ] 搜索功能正常工作
- [ ] 过滤功能正常工作
- [ ] 角色详情正常显示
- [ ] 3D可视化正常渲染

### 性能验证
- [ ] 页面加载速度明显提升
- [ ] 搜索响应时间减少
- [ ] 内存使用量降低
- [ ] 无明显性能回退

### 数据验证
- [ ] 角色数量一致（150个）
- [ ] 别名数据完整
- [ ] 属性数据正确
- [ ] 描述信息保持
- [ ] 无数据丢失或损坏

## 📞 技术支持

### 日志文件位置
- 迁移日志：`data/migration-logs/`
- 性能测试：`data/migration-logs/performance_test_*.log`
- 备份信息：`data/backup/`

### 调试命令
```powershell
# 查看数据库内容
node -e "
const db = require('better-sqlite3')('data/characters.db');
console.log('角色数量:', db.prepare('SELECT COUNT(*) as count FROM characters').get().count);
console.log('前5个角色:', db.prepare('SELECT name, pinyin FROM characters LIMIT 5').all());
db.close();
"

# 检查JSON文件数量
(Get-ChildItem "docs\data\JSON\character\*.json").Count

# 查看最新备份
Get-ChildItem "data\backup\json_backup_*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
```

### 联系方式
如果遇到问题，请：
1. 查看 `data/migration-logs/` 中的详细日志
2. 运行诊断命令收集信息
3. 参考详细迁移指南：`docs/migration/step-by-step-migration-guide.md`

## 🎯 迁移成功标志

当你看到以下结果时，说明迁移成功：
- ✅ 数据库文件存在且大小合理（通常小于JSON总大小）
- ✅ 性能测试显示明显提升
- ✅ 应用启动速度更快
- ✅ 搜索和过滤响应更快
- ✅ 所有功能正常工作
- ✅ 无数据丢失

恭喜！你已经成功将数据存储从JSON文件升级到了高性能的SQLite数据库！
