# SQLite迁移回滚脚本
# 用法: .\rollback.ps1 [-BackupTimestamp <时间戳>] [-Force] [-Verbose]

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupTimestamp,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 获取项目根目录
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot

# 日志函数
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# 获取可用的备份
function Get-AvailableBackups {
    $backupDir = "data\backup"
    if (-not (Test-Path $backupDir)) {
        Write-Log "备份目录不存在: $backupDir" "ERROR"
        return @()
    }
    
    $backups = Get-ChildItem "$backupDir\json_backup_*" -Directory | Sort-Object LastWriteTime -Descending
    return $backups
}

# 显示备份列表
function Show-BackupList {
    $backups = Get-AvailableBackups
    
    if ($backups.Count -eq 0) {
        Write-Log "没有找到可用的备份" "WARN"
        return
    }
    
    Write-Log "可用的备份:" "INFO"
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $backup = $backups[$i]
        $timestamp = $backup.Name -replace "json_backup_", ""
        $size = (Get-ChildItem $backup.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        $date = [DateTime]::ParseExact($timestamp, "yyyyMMdd_HHmmss", $null)
        
        Write-Host "  [$i] $timestamp - $($date.ToString('yyyy-MM-dd HH:mm:ss')) - $([math]::Round($size, 2)) MB"
    }
}

# 选择备份
function Select-Backup {
    if ($BackupTimestamp) {
        $backupPath = "data\backup\json_backup_$BackupTimestamp"
        if (Test-Path $backupPath) {
            return $backupPath
        } else {
            Write-Log "指定的备份不存在: $backupPath" "ERROR"
            return $null
        }
    }
    
    $backups = Get-AvailableBackups
    if ($backups.Count -eq 0) {
        return $null
    }
    
    # 如果没有指定备份，使用最新的
    $latestBackup = $backups[0]
    Write-Log "使用最新备份: $($latestBackup.Name)" "INFO"
    return $latestBackup.FullName
}

# 验证备份完整性
function Test-BackupIntegrity {
    param([string]$BackupPath)
    
    Write-Log "验证备份完整性: $BackupPath" "INFO"
    
    # 检查关键目录
    $requiredPaths = @(
        "$BackupPath\JSON\character",
        "$BackupPath\JSON\character_alias"
    )
    
    foreach ($path in $requiredPaths) {
        if (-not (Test-Path $path)) {
            Write-Log "备份不完整，缺少: $path" "ERROR"
            return $false
        }
    }
    
    # 检查文件数量
    $characterFiles = Get-ChildItem "$BackupPath\JSON\character\*.json"
    if ($characterFiles.Count -lt 100) {
        Write-Log "角色文件数量异常: $($characterFiles.Count)" "WARN"
        if (-not $Force) {
            return $false
        }
    }
    
    Write-Log "备份完整性验证通过" "SUCCESS"
    return $true
}

# 备份当前状态
function Backup-CurrentState {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $currentBackupPath = "data\backup\pre_rollback_$timestamp"
    
    Write-Log "备份当前状态到: $currentBackupPath" "INFO"
    
    # 备份当前JSON数据（如果存在）
    if (Test-Path "docs\data\JSON") {
        New-Item -ItemType Directory -Path $currentBackupPath -Force | Out-Null
        Copy-Item "docs\data\JSON" -Destination "$currentBackupPath\JSON" -Recurse
    }
    
    # 备份SQLite数据库（如果存在）
    if (Test-Path "data\characters.db") {
        Copy-Item "data\characters.db" -Destination "$currentBackupPath\characters.db"
    }
    
    # 备份配置文件
    $configFiles = @(".env.migration", "src\server\dataServer.js")
    foreach ($file in $configFiles) {
        if (Test-Path $file) {
            $fileName = Split-Path $file -Leaf
            Copy-Item $file -Destination "$currentBackupPath\$fileName"
        }
    }
    
    Write-Log "当前状态备份完成" "SUCCESS"
    return $currentBackupPath
}

# 恢复JSON数据
function Restore-JsonData {
    param([string]$BackupPath)
    
    Write-Log "恢复JSON数据从: $BackupPath" "INFO"
    
    # 删除现有JSON数据
    if (Test-Path "docs\data\JSON") {
        Remove-Item "docs\data\JSON" -Recurse -Force
        Write-Log "删除现有JSON数据" "INFO"
    }
    
    # 恢复备份数据
    Copy-Item "$BackupPath\JSON" -Destination "docs\data\JSON" -Recurse
    Write-Log "JSON数据恢复完成" "SUCCESS"
    
    # 验证恢复结果
    $characterCount = (Get-ChildItem "docs\data\JSON\character\*.json").Count
    $aliasCount = (Get-ChildItem "docs\data\JSON\character_alias\*.json" -ErrorAction SilentlyContinue).Count
    
    Write-Log "恢复统计: $characterCount 个角色文件, $aliasCount 个别名文件" "INFO"
}

# 恢复环境配置
function Restore-Environment {
    Write-Log "恢复环境配置" "INFO"
    
    # 切换回JSON数据源
    $env:DATA_SOURCE = "json"
    
    # 删除迁移配置文件
    if (Test-Path ".env.migration") {
        Remove-Item ".env.migration" -Force
        Write-Log "删除迁移配置文件" "INFO"
    }
    
    # 恢复原始服务器配置（如果有备份）
    $serverBackups = Get-ChildItem "data\backup\dataServer_backup_*.js" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($serverBackups.Count -gt 0) {
        $latestServerBackup = $serverBackups[0]
        Copy-Item $latestServerBackup.FullName -Destination "src\server\dataServer.js" -Force
        Write-Log "恢复服务器配置从: $($latestServerBackup.Name)" "SUCCESS"
    }
    
    Write-Log "环境配置恢复完成" "SUCCESS"
}

# 清理SQLite相关文件
function Remove-SqliteFiles {
    Write-Log "清理SQLite相关文件" "INFO"
    
    $sqliteFiles = @(
        "data\characters.db",
        "data\characters.db-wal",
        "data\characters.db-shm"
    )
    
    foreach ($file in $sqliteFiles) {
        if (Test-Path $file) {
            Remove-Item $file -Force
            Write-Log "删除文件: $file" "INFO"
        }
    }
    
    # 清理数据库访问层代码（可选）
    if (Test-Path "src\services\database") {
        $response = "y"
        if (-not $Force) {
            $response = Read-Host "是否删除数据库访问层代码? (y/N)"
        }
        
        if ($response -eq "y" -or $response -eq "Y") {
            Remove-Item "src\services\database" -Recurse -Force
            Write-Log "删除数据库访问层代码" "INFO"
        }
    }
}

# 验证回滚结果
function Test-RollbackResult {
    Write-Log "验证回滚结果" "INFO"
    
    # 检查JSON数据
    if (-not (Test-Path "docs\data\JSON\character")) {
        Write-Log "JSON角色数据目录不存在" "ERROR"
        return $false
    }
    
    $characterCount = (Get-ChildItem "docs\data\JSON\character\*.json").Count
    if ($characterCount -lt 100) {
        Write-Log "角色文件数量异常: $characterCount" "ERROR"
        return $false
    }
    
    # 检查SQLite文件是否已清理
    if (Test-Path "data\characters.db") {
        Write-Log "SQLite数据库文件仍然存在" "WARN"
    }
    
    # 检查环境变量
    if ($env:DATA_SOURCE -ne "json") {
        Write-Log "环境变量未正确设置" "WARN"
    }
    
    Write-Log "回滚验证通过" "SUCCESS"
    return $true
}

# 主回滚函数
function Start-Rollback {
    Write-Log "开始SQLite迁移回滚流程" "INFO"
    
    # 显示备份列表
    Show-BackupList
    
    # 选择备份
    $backupPath = Select-Backup
    if (-not $backupPath) {
        Write-Log "没有可用的备份，无法回滚" "ERROR"
        return
    }
    
    # 验证备份完整性
    if (-not (Test-BackupIntegrity $backupPath)) {
        Write-Log "备份完整性验证失败" "ERROR"
        if (-not $Force) {
            Write-Log "使用 -Force 参数强制回滚" "INFO"
            return
        }
    }
    
    # 确认回滚操作
    if (-not $Force) {
        $confirmation = Read-Host "确认要回滚到备份 $backupPath 吗? (y/N)"
        if ($confirmation -ne "y" -and $confirmation -ne "Y") {
            Write-Log "回滚操作已取消" "INFO"
            return
        }
    }
    
    try {
        # 备份当前状态
        $currentBackup = Backup-CurrentState
        Write-Log "当前状态已备份到: $currentBackup" "INFO"
        
        # 执行回滚步骤
        Restore-JsonData $backupPath
        Restore-Environment
        Remove-SqliteFiles
        
        # 验证回滚结果
        if (Test-RollbackResult) {
            Write-Log "回滚操作成功完成" "SUCCESS"
            Write-Log "请重启应用并验证功能正常" "INFO"
        } else {
            Write-Log "回滚验证失败，请手动检查" "WARN"
        }
        
        # 生成回滚报告
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $report = @{
            rollbackDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            sourceBackup = $backupPath
            currentBackup = $currentBackup
            status = "completed"
        }
        
        $report | ConvertTo-Json | Out-File "data\migration-logs\rollback_report_$timestamp.json"
        Write-Log "回滚报告已生成" "INFO"
        
    } catch {
        Write-Log "回滚过程中发生错误: $_" "ERROR"
        Write-Log "请检查系统状态并考虑手动恢复" "ERROR"
        throw
    }
}

# 执行回滚
Start-Rollback
