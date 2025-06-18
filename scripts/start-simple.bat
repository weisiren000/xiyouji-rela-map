@echo off
chcp 65001 >nul
echo 🚀 西游记银河系可视化 - 简化启动脚本
echo ================================================

:: 设置工作目录
cd /d "%~dp0.."

:: 检查Node.js
echo 🔍 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

:: 检查pnpm
echo 🔍 检查pnpm包管理器...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到pnpm，请先安装pnpm
    echo 💡 安装命令: npm install -g pnpm
    pause
    exit /b 1
)

:: 检查前端依赖
echo 🔍 检查前端依赖...
if not exist "node_modules" (
    echo 📦 安装前端依赖...
    pnpm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)

:: 检查后端依赖
echo 🔍 检查后端依赖...
if not exist "src\server\node_modules" (
    echo 📦 安装后端依赖...
    cd src\server

    :: 尝试使用pnpm，如果失败则尝试npm
    pnpm install >nul 2>&1
    if errorlevel 1 (
        echo ⚠️ pnpm安装失败，尝试使用npm...
        where npm >nul 2>&1
        if errorlevel 1 (
            echo ❌ 错误: 未找到npm命令，请确保Node.js正确安装
            cd ..\..
            pause
            exit /b 1
        )
        npm install
        if errorlevel 1 (
            echo ❌ 后端依赖安装失败
            cd ..\..
            pause
            exit /b 1
        )
    )
    cd ..\..
)

:: 启动后端服务器
echo 🚀 启动后端数据服务器...
start "后端服务器" cmd /k "cd /d \"%CD%\src\server\" & echo 🚀 启动后端服务器... & node dataServer.js"

:: 等待后端启动
echo ⏳ 等待后端服务器启动...
timeout /t 5 /nobreak >nul

:: 显示启动信息
echo.
echo ================================================
echo 🎉 后端服务器已启动！
echo 📡 后端地址: http://localhost:3003
echo.
echo 💡 前端会自动检测后端端口
echo 💡 现在启动前端开发服务器...
echo ================================================
echo.

:: 启动前端
echo 🚀 启动前端开发服务器...
pnpm dev

pause
