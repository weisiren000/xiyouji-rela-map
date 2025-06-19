# SQLite数据迁移自动化脚本
# 用法: .\auto-migration.ps1 [-Phase <阶段号>] [-DryRun] [-Verbose]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("1", "2", "3", "4", "5", "6", "all")]
    [string]$Phase = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
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

# 检查先决条件
function Test-Prerequisites {
    Write-Log "检查迁移先决条件..." "INFO"
    
    # 检查Node.js
    try {
        $nodeVersion = node --version
        Write-Log "Node.js版本: $nodeVersion" "SUCCESS"
    } catch {
        Write-Log "Node.js未安装或不在PATH中" "ERROR"
        return $false
    }
    
    # 检查npm
    try {
        $npmVersion = npm --version
        Write-Log "npm版本: $npmVersion" "SUCCESS"
    } catch {
        Write-Log "npm未安装或不在PATH中" "ERROR"
        return $false
    }
    
    # 检查项目结构
    $requiredPaths = @(
        "docs\data\JSON\character",
        "src\server",
        "package.json"
    )
    
    foreach ($path in $requiredPaths) {
        if (-not (Test-Path $path)) {
            Write-Log "缺少必要路径: $path" "ERROR"
            return $false
        }
    }
    
    Write-Log "先决条件检查通过" "SUCCESS"
    return $true
}

# 阶段1: 环境准备
function Invoke-Phase1 {
    Write-Log "=== 阶段1: 环境准备 ===" "INFO"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] 将执行环境准备步骤" "INFO"
        return
    }
    
    # 创建必要目录
    $directories = @("data", "data\backup", "data\migration-logs", "scripts\data-migration")
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Log "创建目录: $dir" "SUCCESS"
        }
    }
    
    # 安装依赖
    Write-Log "安装SQLite依赖..." "INFO"
    try {
        npm install better-sqlite3 --save
        npm install @types/better-sqlite3 --save-dev
        Write-Log "依赖安装完成" "SUCCESS"
    } catch {
        Write-Log "依赖安装失败: $_" "ERROR"
        throw
    }
    
    # 备份现有数据
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "data\backup\json_backup_$timestamp"
    
    Write-Log "备份JSON数据到: $backupPath" "INFO"
    Copy-Item "docs\data\JSON" -Destination $backupPath -Recurse
    Write-Log "数据备份完成" "SUCCESS"
    
    # 记录备份信息
    $backupInfo = @{
        timestamp = $timestamp
        path = $backupPath
        sourceSize = (Get-ChildItem "docs\data\JSON" -Recurse | Measure-Object -Property Length -Sum).Sum
    }
    $backupInfo | ConvertTo-Json | Out-File "data\migration-logs\backup_$timestamp.json"
}

# 阶段2: 数据库初始化
function Invoke-Phase2 {
    Write-Log "=== 阶段2: 数据库初始化 ===" "INFO"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] 将执行数据库初始化" "INFO"
        return
    }
    
    # 检查迁移脚本是否存在
    if (-not (Test-Path "scripts\data-migration\json-to-sqlite.js")) {
        Write-Log "迁移脚本不存在，正在创建..." "WARN"
        # 这里可以从模板创建脚本，或者提示用户
        Write-Log "请确保迁移脚本存在: scripts\data-migration\json-to-sqlite.js" "ERROR"
        return
    }
    
    # 运行数据迁移
    Write-Log "执行数据迁移..." "INFO"
    try {
        $migrationResult = node "scripts\data-migration\json-to-sqlite.js" 2>&1
        Write-Log "迁移脚本执行完成" "SUCCESS"
        
        if ($Verbose) {
            Write-Log "迁移输出: $migrationResult" "INFO"
        }
    } catch {
        Write-Log "数据迁移失败: $_" "ERROR"
        throw
    }
    
    # 验证数据库文件
    if (Test-Path "data\characters.db") {
        $dbSize = (Get-Item "data\characters.db").Length / 1MB
        Write-Log "数据库创建成功，大小: $([math]::Round($dbSize, 2)) MB" "SUCCESS"
    } else {
        Write-Log "数据库文件未创建" "ERROR"
        throw "数据库初始化失败"
    }
}

# 阶段3: 数据访问层重构
function Invoke-Phase3 {
    Write-Log "=== 阶段3: 数据访问层重构 ===" "INFO"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] 将执行数据访问层重构" "INFO"
        return
    }
    
    # 创建数据库访问层目录
    $dbDir = "src\services\database"
    if (-not (Test-Path $dbDir)) {
        New-Item -ItemType Directory -Path $dbDir -Force | Out-Null
        Write-Log "创建数据库访问层目录: $dbDir" "SUCCESS"
    }
    
    # 检查是否需要创建数据访问类
    $repoFile = "$dbDir\CharacterRepository.ts"
    if (-not (Test-Path $repoFile)) {
        Write-Log "需要创建CharacterRepository.ts文件" "WARN"
        Write-Log "请参考迁移指南创建数据访问层代码" "INFO"
    }
    
    # 备份现有服务器文件
    if (Test-Path "src\server\dataServer.js") {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item "src\server\dataServer.js" -Destination "data\backup\dataServer_backup_$timestamp.js"
        Write-Log "备份现有服务器文件" "SUCCESS"
    }
    
    Write-Log "数据访问层重构准备完成" "SUCCESS"
    Write-Log "请手动完成代码重构，参考: docs\migration\step-by-step-migration-guide.md" "INFO"
}

# 阶段4: 并行测试
function Invoke-Phase4 {
    Write-Log "=== 阶段4: 并行测试 ===" "INFO"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] 将执行并行测试" "INFO"
        return
    }
    
    # 设置测试环境变量
    $env:DATA_SOURCE = "hybrid"
    Write-Log "设置数据源为混合模式 (hybrid)" "INFO"
    
    # 运行性能对比测试
    if (Test-Path "scripts\data-migration\performance-comparison.js") {
        Write-Log "执行性能对比测试..." "INFO"
        try {
            $perfResult = node "scripts\data-migration\performance-comparison.js" 2>&1
            Write-Log "性能测试完成" "SUCCESS"
            
            if ($Verbose) {
                Write-Log "性能测试结果: $perfResult" "INFO"
            }
            
            # 保存测试结果
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $perfResult | Out-File "data\migration-logs\performance_test_$timestamp.log"
            
        } catch {
            Write-Log "性能测试失败: $_" "WARN"
        }
    }
    
    Write-Log "并行测试阶段完成" "SUCCESS"
    Write-Log "请验证应用功能正常，然后继续下一阶段" "INFO"
}

# 阶段5: 逐步切换
function Invoke-Phase5 {
    Write-Log "=== 阶段5: 逐步切换 ===" "INFO"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] 将执行逐步切换" "INFO"
        return
    }
    
    # 切换到SQLite数据源
    $env:DATA_SOURCE = "sqlite"
    Write-Log "切换数据源到SQLite" "SUCCESS"
    
    # 创建环境配置文件
    $envConfig = @"
# 数据迁移后的环境配置
DATA_SOURCE=sqlite
SQLITE_DB_PATH=data/characters.db
ENABLE_PERFORMANCE_MONITORING=true
"@
    $envConfig | Out-File ".env.migration" -Encoding UTF8
    Write-Log "创建迁移环境配置文件: .env.migration" "SUCCESS"
    
    Write-Log "数据源切换完成" "SUCCESS"
    Write-Log "请启动应用并验证所有功能正常工作" "INFO"
}

# 阶段6: 清理和优化
function Invoke-Phase6 {
    Write-Log "=== 阶段6: 清理和优化 ===" "INFO"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] 将执行清理和优化" "INFO"
        return
    }
    
    # 备份旧代码
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $archiveDir = "_archive\json-loader-backup_$timestamp"
    
    if (-not (Test-Path "_archive")) {
        New-Item -ItemType Directory -Path "_archive" -Force | Out-Null
    }
    
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    
    # 备份可能不再需要的文件
    $filesToBackup = @(
        "src\services\jsonDataLoader.ts",
        "src\hooks\useDataLoader.ts"
    )
    
    foreach ($file in $filesToBackup) {
        if (Test-Path $file) {
            $fileName = Split-Path $file -Leaf
            Copy-Item $file -Destination "$archiveDir\$fileName"
            Write-Log "备份文件: $file" "SUCCESS"
        }
    }
    
    # 生成迁移报告
    $report = @{
        migrationDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        dataSource = "sqlite"
        backupLocation = $archiveDir
        dbPath = "data\characters.db"
        status = "completed"
    }
    
    $report | ConvertTo-Json | Out-File "data\migration-logs\migration_report_$timestamp.json"
    Write-Log "生成迁移报告: migration_report_$timestamp.json" "SUCCESS"
    
    Write-Log "清理和优化完成" "SUCCESS"
}

# 主执行函数
function Start-Migration {
    Write-Log "开始SQLite数据迁移流程" "INFO"
    Write-Log "执行模式: $(if ($DryRun) { 'DRY RUN' } else { 'ACTUAL' })" "INFO"
    Write-Log "详细模式: $(if ($Verbose) { '启用' } else { '禁用' })" "INFO"
    
    # 检查先决条件
    if (-not (Test-Prerequisites)) {
        Write-Log "先决条件检查失败，终止迁移" "ERROR"
        return
    }
    
    try {
        switch ($Phase) {
            "1" { Invoke-Phase1 }
            "2" { Invoke-Phase2 }
            "3" { Invoke-Phase3 }
            "4" { Invoke-Phase4 }
            "5" { Invoke-Phase5 }
            "6" { Invoke-Phase6 }
            "all" {
                Invoke-Phase1
                Invoke-Phase2
                Invoke-Phase3
                Invoke-Phase4
                Invoke-Phase5
                Invoke-Phase6
            }
        }
        
        Write-Log "迁移流程完成" "SUCCESS"
        
        if (-not $DryRun) {
            Write-Log "下一步操作:" "INFO"
            Write-Log "1. 验证应用功能正常" "INFO"
            Write-Log "2. 监控性能指标" "INFO"
            Write-Log "3. 如有问题，使用回滚脚本" "INFO"
        }
        
    } catch {
        Write-Log "迁移过程中发生错误: $_" "ERROR"
        Write-Log "请检查错误信息并考虑回滚" "ERROR"
        throw
    }
}

# 执行迁移
Start-Migration
