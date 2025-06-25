# 西游记银河系可视化 - 简化启动脚本 (PowerShell版本)

Write-Host "🚀 西游记银河系可视化 - 简化启动脚本" -ForegroundColor Cyan
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
    Read-Host "按任意键退出"
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
    Read-Host "按任意键退出"
    exit 1
}

# 检查并安装前端依赖
Write-Host "🔍 检查前端依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装前端依赖..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 前端依赖安装失败" -ForegroundColor Red
        Read-Host "按任意键退出"
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
    
    # 尝试使用pnpm，如果失败则使用npm
    try {
        pnpm install
        if ($LASTEXITCODE -ne 0) {
            throw "pnpm install failed"
        }
        Write-Host "✅ 使用pnpm安装后端依赖成功" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ pnpm安装失败，尝试使用npm..." -ForegroundColor Yellow
        try {
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "npm install failed"
            }
            Write-Host "✅ 使用npm安装后端依赖成功" -ForegroundColor Green
        } catch {
            Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red
            Pop-Location
            Read-Host "按任意键退出"
            exit 1
        }
    }
    Pop-Location
} else {
    Write-Host "✅ 后端依赖已存在" -ForegroundColor Green
}

# 启动后端服务器
Write-Host "🚀 启动后端数据服务器..." -ForegroundColor Cyan
$BackendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\src\server'; Write-Host '🚀 启动后端服务器...' -ForegroundColor Cyan; node dataServer.js" -WindowStyle Normal -PassThru

# 等待后端启动
Write-Host "⏳ 等待后端服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 显示启动信息
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎉 后端服务器已启动！" -ForegroundColor Green
Write-Host "📡 后端地址: http://localhost:3003" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 前端会自动检测后端端口" -ForegroundColor Yellow
Write-Host "💡 现在启动前端开发服务器..." -ForegroundColor Yellow
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
Read-Host "按任意键退出"
