# 服务器版本切换脚本
# 用法: .\switch-server.ps1 -Version <json|sqlite>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("json", "sqlite")]
    [string]$Version
)

# 获取项目根目录
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# 服务器文件路径
$JsonServer = "src\server\dataServer.js"
$SqliteServer = "src\server\dataServer-sqlite.js"
$CurrentServer = "src\server\current-server.js"
$BackupDir = "src\server\backup"

# 创建备份目录
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

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

function Switch-ToJson {
    Write-Log "切换到JSON版本服务器..." "INFO"
    
    # 备份当前服务器
    if (Test-Path $CurrentServer) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item $CurrentServer -Destination "$BackupDir\server_backup_$timestamp.js"
        Write-Log "当前服务器已备份" "INFO"
    }
    
    # 复制JSON服务器
    Copy-Item $JsonServer -Destination $CurrentServer
    Write-Log "已切换到JSON版本服务器" "SUCCESS"
    
    Write-Log "JSON服务器特点:" "INFO"
    Write-Log "  - 从JSON文件读取数据" "INFO"
    Write-Log "  - 5分钟缓存机制" "INFO"
    Write-Log "  - 支持基础API接口" "INFO"
}

function Switch-ToSqlite {
    Write-Log "切换到SQLite版本服务器..." "INFO"
    
    # 检查SQLite数据库是否存在
    if (-not (Test-Path "data\characters.db")) {
        Write-Log "SQLite数据库不存在，请先运行数据迁移" "ERROR"
        Write-Log "运行命令: node scripts\data-migration\migrate-fixed.cjs" "INFO"
        return
    }
    
    # 备份当前服务器
    if (Test-Path $CurrentServer) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item $CurrentServer -Destination "$BackupDir\server_backup_$timestamp.js"
        Write-Log "当前服务器已备份" "INFO"
    }
    
    # 复制SQLite服务器
    Copy-Item $SqliteServer -Destination $CurrentServer
    Write-Log "已切换到SQLite版本服务器" "SUCCESS"
    
    Write-Log "SQLite服务器特点:" "INFO"
    Write-Log "  - 从SQLite数据库读取数据" "INFO"
    Write-Log "  - 高性能索引查询" "INFO"
    Write-Log "  - 支持高级搜索API" "INFO"
    Write-Log "  - 新增搜索接口: /api/characters/search" "INFO"
}

function Show-Status {
    Write-Log "当前服务器状态:" "INFO"
    
    if (Test-Path $CurrentServer) {
        $content = Get-Content $CurrentServer -Raw
        if ($content -match "SQLite版本") {
            Write-Log "  当前版本: SQLite" "SUCCESS"
            Write-Log "  数据源: SQLite数据库" "INFO"
            Write-Log "  性能: 高性能" "INFO"
        } else {
            Write-Log "  当前版本: JSON" "SUCCESS"
            Write-Log "  数据源: JSON文件" "INFO"
            Write-Log "  性能: 标准" "INFO"
        }
    } else {
        Write-Log "  当前版本: 未设置" "WARN"
        Write-Log "  请选择一个版本进行切换" "INFO"
    }
    
    # 显示可用的API接口
    Write-Log "可用的API接口:" "INFO"
    Write-Log "  GET  /api/characters - 获取所有角色" "INFO"
    Write-Log "  GET  /api/aliases - 获取所有别名" "INFO"
    Write-Log "  GET  /api/data/complete - 获取完整数据" "INFO"
    Write-Log "  GET  /api/stats - 获取数据统计" "INFO"
    Write-Log "  POST /api/cache/refresh - 刷新缓存" "INFO"
    
    if (Test-Path $CurrentServer) {
        $content = Get-Content $CurrentServer -Raw
        if ($content -match "SQLite版本") {
            Write-Log "  GET  /api/characters/search - 高级搜索 (SQLite独有)" "SUCCESS"
        }
    }
}

# 主逻辑
try {
    Write-Log "开始切换服务器版本..." "INFO"
    
    switch ($Version) {
        "json" { Switch-ToJson }
        "sqlite" { Switch-ToSqlite }
    }
    
    Write-Log "服务器切换完成！" "SUCCESS"
    Write-Log "启动服务器命令: cd src\server && node current-server.js" "INFO"
    
    Show-Status
    
} catch {
    Write-Log "切换过程中发生错误: $_" "ERROR"
    throw
}
