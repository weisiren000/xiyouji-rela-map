# PowerShell脚本：删除不一致的法宝JSON文件

# 获取当前工作目录
$currentDir = Get-Location
Write-Host "当前工作目录: $currentDir"

# 设置源目录和目标目录
$sourceDir = "D:/codee/xiyouji-rela-map/docs/data/JSON/artifact"
$backupDir = "D:/codee/xiyouji-rela-map/backup/artifacts"

# 确保备份目录存在
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
    Write-Host "创建备份目录: $backupDir"
}

# 一致的文件列表 (a0001-a0013 和 a0035)
$consistentFiles = @(
    "artifact_a0001_ru_yi_jin_gu_bang.json",
    "artifact_a0002_jiu_chi_ding_pa.json",
    "artifact_a0003_xiang_yao_bao_zhang.json",
    "artifact_a0004_zi_jin_ling.json",
    "artifact_a0005_jin_nao.json",
    "artifact_a0006_ren_zhong_dai.json",
    "artifact_a0007_yang_liu_yu_jing_ping.json",
    "artifact_a0008_zi_jin_hong_hu_lu.json",
    "artifact_a0009_yang_zhi_yu_jing_ping.json",
    "artifact_a0010_huang_jin_sheng.json",
    "artifact_a0011_jin_bu_lu.json",
    "artifact_a0012_liu_zi_jin_qian.json",
    "artifact_a0013_ling_guan_bao_dao.json",
    "artifact_a0035_zhao_yao_jing.json"
)

# 获取所有法宝文件
$allFiles = Get-ChildItem -Path $sourceDir -Filter "artifact_*.json"

# 删除不一致的文件 (移动到备份目录)
foreach ($file in $allFiles) {
    if ($consistentFiles -notcontains $file.Name) {
        Write-Host "移动不一致文件: $($file.Name) 到备份目录"
        Move-Item -Path $file.FullName -Destination "$backupDir/$($file.Name)" -Force
    }
}

Write-Host "操作完成！不一致的法宝文件已移动到备份目录: $backupDir"