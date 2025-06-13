@echo off
echo 🚀 启动西游记3D可视化项目
echo.

echo 📦 安装后端依赖...
cd src\server
call npm install
if %errorlevel% neq 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🔧 启动数据服务器...
start "数据服务器" cmd /k "npm start"

echo.
echo ⏳ 等待服务器启动...
timeout /t 3 /nobreak > nul

echo.
echo 🎨 启动前端开发服务器...
cd ..\..
call npm run dev

pause
