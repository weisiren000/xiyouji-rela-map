# 验证数据一致性
# 检查 JSON 文件中的角色名称是否与 allunid.jsonc 中的映射一致

Write-Host "=== 数据一致性验证 ===" -ForegroundColor Green

# 从 allunid.jsonc 中提取角色映射（简化版本，手动定义关键角色）
$expectedMapping = @{
    "c0001" = "孙悟空"
    "c0002" = "唐僧"
    "c0003" = "猪八戒"
    "c0004" = "沙僧"
    "c0005" = "白龙马"
    "c0136" = "全真道人"
    "c0137" = "地涌夫人"
    "c0138" = "南山大王"
    "c0139" = "黄狮精"
    "c0140" = "辟寒大王"
    "c0141" = "辟暑大王"
    "c0142" = "辟尘大王"
    "c0143" = "天竺国公主"
    "c0144" = "清风明月"
    "c0150" = "狮猁怪"
}

$inconsistencies = @()

foreach ($id in $expectedMapping.Keys) {
    $expectedName = $expectedMapping[$id]
    $jsonFile = Get-ChildItem "docs\data\JSON\character\character_${id}_*.json" -ErrorAction SilentlyContinue
    
    if ($jsonFile) {
        try {
            $jsonContent = Get-Content $jsonFile.FullName -Raw | ConvertFrom-Json
            $actualName = $jsonContent.basic.name
            
            if ($actualName -ne $expectedName) {
                $inconsistencies += [PSCustomObject]@{
                    ID = $id
                    Expected = $expectedName
                    Actual = $actualName
                    File = $jsonFile.Name
                }
            } else {
                Write-Host "✅ $id : $actualName" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ $id : 无法读取JSON文件" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ $id : 文件不存在" -ForegroundColor Red
    }
}

if ($inconsistencies.Count -gt 0) {
    Write-Host "`n=== 发现数据不一致 ===" -ForegroundColor Red
    $inconsistencies | Format-Table -AutoSize
} else {
    Write-Host "`n✅ 所有检查的角色数据都一致" -ForegroundColor Green
}

Write-Host "`n=== 验证完成 ===" -ForegroundColor Green
