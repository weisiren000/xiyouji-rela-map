@echo off
chcp 65001 >nul
echo 🚀 西游记银河系可视化 - 智能启动脚本
echo ================================================

:: 设置工作目录
cd /d "%~dp0.."

:: 检查Node.js是否安装
echo 🔍 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

:: 检查pnpm是否安装
echo 🔍 检查pnpm包管理器...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到pnpm，请先安装pnpm
    echo 💡 安装命令: npm install -g pnpm
    pause
    exit /b 1
)

:: 检查依赖是否安装
echo 🔍 检查项目依赖...
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
    npm install
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败
        cd ..\..
        pause
        exit /b 1
    )
    cd ..\..
)

:: 查找可用端口
echo 🔍 查找可用端口...
set "BACKEND_PORT="

:: 检查端口函数
for %%p in (3003 3002 3001 3000 8080 8000) do (
    netstat -an | find "LISTENING" | find ":%%p " >nul 2>&1
    if errorlevel 1 (
        echo ✅ 端口 %%p 可用
        set "BACKEND_PORT=%%p"
        goto :found_port
    ) else (
        echo ⚠️ 端口 %%p 已被占用
    )
)

:found_port
if "%BACKEND_PORT%"=="" (
    echo ❌ 未找到可用端口，使用默认端口 3003
    set "BACKEND_PORT=3003"
)

echo 🎯 使用后端端口: %BACKEND_PORT%

:: 更新后端服务器端口配置
echo 🔧 配置后端服务器端口...
powershell -Command "(Get-Content 'src\server\dataServer.js') -replace 'const PORT = \d+', 'const PORT = %BACKEND_PORT%' | Set-Content 'src\server\dataServer.js'"

:: 启动后端服务器
echo 🚀 启动后端数据服务器 (端口 %BACKEND_PORT%)...
start "后端服务器" cmd /k "cd /d \"%CD%\src\server\" && echo 🚀 启动后端服务器... && node dataServer.js"

:: 等待后端服务器启动
echo ⏳ 等待后端服务器启动...
timeout /t 3 /nobreak >nul

:: 测试后端连接
echo 🔍 测试后端连接...
for /l %%i in (1,1,10) do (
    curl -s -o nul -w "%%{http_code}" "http://localhost:%BACKEND_PORT%/api/stats" | find "200" >nul 2>&1
    if not errorlevel 1 (
        echo ✅ 后端服务器连接成功
        goto :backend_ready
    )
    echo ⏳ 等待后端服务器响应... (%%i/10)
    timeout /t 2 /nobreak >nul
)

echo ⚠️ 后端服务器可能未完全启动，但继续启动前端...

:backend_ready
:: 启动前端开发服务器
echo 🚀 启动前端开发服务器...
echo 📡 前端地址: http://localhost:3000
echo 📡 后端地址: http://localhost:%BACKEND_PORT%
echo.
echo 💡 前端会自动检测后端端口，无需手动配置
echo 💡 如果连接失败，请检查后端服务器是否正常运行
echo.
echo ================================================
echo 🎉 启动完成！浏览器将自动打开应用
echo ================================================

:: 启动前端
pnpm dev

pause
