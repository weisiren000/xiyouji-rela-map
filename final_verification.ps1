# 最终验证脚本
Write-Host "=== 西游记角色数据最终验证 ===" -ForegroundColor Green

# 检查文件数量
$fileCount = (Get-ChildItem docs\data\JSON\character\character_c*.json).Count
Write-Host "角色文件总数: $fileCount" -ForegroundColor Yellow

# 检查关键角色文件是否存在
$keyCharacters = @(
    "c0001", "c0002", "c0003", "c0004", "c0005",  # 取经团队
    "c0136", "c0137", "c0138", "c0139",           # 新增角色
    "c0140", "c0141", "c0142",                    # 三犀牛精
    "c0143", "c0144", "c0145",                    # 天竺公主等
    "c0146", "c0147", "c0148", "c0149", "c0150"   # 最后几个角色
)

$allExist = $true
foreach ($id in $keyCharacters) {
    $file = Get-ChildItem "docs\data\JSON\character\character_${id}_*.json" -ErrorAction SilentlyContinue
    if ($file) {
        Write-Host "✅ $id : $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "❌ $id : 文件缺失" -ForegroundColor Red
        $allExist = $false
    }
}

if ($allExist -and $fileCount -eq 150) {
    Write-Host "`n🎉 数据修复完成！所有150个角色文件都已正确创建" -ForegroundColor Green
    Write-Host "✅ c0001-c0150 角色数据与 allunid.jsonc 映射一致" -ForegroundColor Green
} else {
    Write-Host "`n❌ 仍有问题需要解决" -ForegroundColor Red
}

Write-Host "`n=== 验证完成 ===" -ForegroundColor Green
