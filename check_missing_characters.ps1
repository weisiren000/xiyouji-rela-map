# 检查缺失的角色文件
# 对比 allunid.jsonc 中的角色和实际的 JSON 文件

Write-Host "=== 西游记角色数据一致性检查 ===" -ForegroundColor Green

# 获取所有应该存在的角色ID (c0001-c0150)
$expectedIds = @()
for ($i = 1; $i -le 150; $i++) {
    $expectedIds += "c{0:D4}" -f $i
}

# 获取实际存在的JSON文件
$actualFiles = Get-ChildItem "docs\data\JSON\character\character_c*.json" | ForEach-Object {
    if ($_.Name -match "character_(c\d{4})_") {
        $matches[1]
    }
}

Write-Host "`n预期角色数量: $($expectedIds.Count)" -ForegroundColor Yellow
Write-Host "实际文件数量: $($actualFiles.Count)" -ForegroundColor Yellow

# 找出缺失的角色
$missingIds = $expectedIds | Where-Object { $_ -notin $actualFiles }

if ($missingIds.Count -gt 0) {
    Write-Host "`n=== 缺失的角色文件 ===" -ForegroundColor Red
    foreach ($id in $missingIds) {
        Write-Host "缺失: $id" -ForegroundColor Red
    }
} else {
    Write-Host "`n✅ 所有角色文件都存在" -ForegroundColor Green
}

# 找出多余的文件（如果有）
$extraFiles = $actualFiles | Where-Object { $_ -notin $expectedIds }
if ($extraFiles.Count -gt 0) {
    Write-Host "`n=== 多余的文件 ===" -ForegroundColor Magenta
    foreach ($file in $extraFiles) {
        Write-Host "多余: $file" -ForegroundColor Magenta
    }
}

Write-Host "`n=== 检查完成 ===" -ForegroundColor Green
