@echo off
echo 🚀 启动西游记数据服务器
echo.

echo 📁 切换到服务器目录...
cd src\server

echo 📦 检查依赖...
if not exist node_modules (
    echo 📦 安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo 🔧 启动数据服务器...
echo 📡 服务地址: http://localhost:3001
echo 📁 数据路径: D:\codee\xiyouji-rela-map\docs\data\JSON
echo.

call npm start

pause
