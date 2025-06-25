# 西游记银河系可视化 - 智能启动脚本 (PowerShell版本)
# 自动检测端口、启动后端和前端服务

param(
    [int]$PreferredPort = 3003,
    [switch]$SkipPortCheck = $false,
    [switch]$Verbose = $false
)

# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 西游记银河系可视化 - 智能启动脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 设置工作目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

Write-Host "📁 项目目录: $ProjectRoot" -ForegroundColor Gray

# 检查Node.js
Write-Host "🔍 检查Node.js环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    exit 1
}

# 检查pnpm
Write-Host "🔍 检查pnpm包管理器..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm版本: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到pnpm，请先安装pnpm" -ForegroundColor Red
    Write-Host "💡 安装命令: npm install -g pnpm" -ForegroundColor Cyan
    exit 1
}

# 检查并安装前端依赖
Write-Host "🔍 检查前端依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装前端依赖..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 前端依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "✅ 前端依赖已存在" -ForegroundColor Green
}

# 检查并安装后端依赖
Write-Host "🔍 检查后端依赖..." -ForegroundColor Yellow
if (-not (Test-Path "src\server\node_modules")) {
    Write-Host "📦 安装后端依赖..." -ForegroundColor Yellow
    Push-Location "src\server"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "✅ 后端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "✅ 后端依赖已存在" -ForegroundColor Green
}

# 查找可用端口
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

$AvailablePort = $null
$PortsToCheck = @($PreferredPort, 3003, 3002, 3001, 3000, 8080, 8000)

if (-not $SkipPortCheck) {
    Write-Host "🔍 查找可用端口..." -ForegroundColor Yellow
    
    foreach ($Port in $PortsToCheck) {
        if (Test-Port -Port $Port) {
            Write-Host "✅ 端口 $Port 可用" -ForegroundColor Green
            $AvailablePort = $Port
            break
        } else {
            Write-Host "⚠️ 端口 $Port 已被占用" -ForegroundColor Yellow
        }
    }
} else {
    $AvailablePort = $PreferredPort
    Write-Host "⚠️ 跳过端口检查，使用端口 $AvailablePort" -ForegroundColor Yellow
}

if ($null -eq $AvailablePort) {
    Write-Host "❌ 未找到可用端口，使用默认端口 3003" -ForegroundColor Red
    $AvailablePort = 3003
}

Write-Host "🎯 使用后端端口: $AvailablePort" -ForegroundColor Cyan

# 更新后端服务器端口配置
Write-Host "🔧 配置后端服务器端口..." -ForegroundColor Yellow
$ServerFile = "src\server\dataServer.js"
if (Test-Path $ServerFile) {
    $Content = Get-Content $ServerFile -Raw
    $UpdatedContent = $Content -replace "const PORT = \d+", "const PORT = $AvailablePort"
    Set-Content $ServerFile -Value $UpdatedContent -Encoding UTF8
    Write-Host "✅ 后端端口配置已更新" -ForegroundColor Green
} else {
    Write-Host "❌ 未找到后端服务器文件: $ServerFile" -ForegroundColor Red
    exit 1
}

# 启动后端服务器
Write-Host "🚀 启动后端数据服务器 (端口 $AvailablePort)..." -ForegroundColor Cyan
$BackendProcess = Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$ProjectRoot\src\server`" & echo 🚀 启动后端服务器... & node dataServer.js" -WindowStyle Normal -PassThru

# 等待后端服务器启动
Write-Host "⏳ 等待后端服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 测试后端连接
Write-Host "🔍 测试后端连接..." -ForegroundColor Yellow
$BackendReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost:$AvailablePort/api/stats" -Method HEAD -TimeoutSec 2 -ErrorAction Stop
        if ($Response.StatusCode -eq 200) {
            Write-Host "✅ 后端服务器连接成功" -ForegroundColor Green
            $BackendReady = $true
            break
        }
    } catch {
        if ($Verbose) {
            Write-Host "⏳ 等待后端服务器响应... ($i/10) - $($_.Exception.Message)" -ForegroundColor Gray
        } else {
            Write-Host "⏳ 等待后端服务器响应... ($i/10)" -ForegroundColor Gray
        }
        Start-Sleep -Seconds 2
    }
}

if (-not $BackendReady) {
    Write-Host "⚠️ 后端服务器可能未完全启动，但继续启动前端..." -ForegroundColor Yellow
}

# 显示启动信息
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎉 启动完成！" -ForegroundColor Green
Write-Host "📡 前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📡 后端地址: http://localhost:$AvailablePort" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 前端会自动检测后端端口，无需手动配置" -ForegroundColor Yellow
Write-Host "💡 如果连接失败，请检查后端服务器是否正常运行" -ForegroundColor Yellow
Write-Host "💡 按 Ctrl+C 停止前端服务器" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 启动前端开发服务器
Write-Host "🚀 启动前端开发服务器..." -ForegroundColor Cyan
try {
    pnpm dev
} catch {
    Write-Host "❌ 前端启动失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 清理：如果前端停止，也停止后端
if ($BackendProcess -and -not $BackendProcess.HasExited) {
    Write-Host "🛑 停止后端服务器..." -ForegroundColor Yellow
    Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "👋 应用已停止" -ForegroundColor Gray
