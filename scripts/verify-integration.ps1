# CharacterInfoCard集成验证脚本
# 用于验证信息卡片功能是否正确集成

Write-Host "🎯 开始验证CharacterInfoCard集成..." -ForegroundColor Green

# 检查关键文件是否存在
$files = @(
    "src/components/three/CharacterSpheresSimple.tsx",
    "src/components/ui/CharacterInfoCard.tsx",
    "src/hooks/useCharacterInteraction.ts"
)

Write-Host "`n📁 检查关键文件..." -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "❌ $file 不存在" -ForegroundColor Red
        exit 1
    }
}

# 检查CharacterSpheresSimple.tsx中的关键导入
Write-Host "`n🔍 检查关键导入..." -ForegroundColor Yellow
$content = Get-Content "src/components/three/CharacterSpheresSimple.tsx" -Raw

if ($content -match "createPortal") {
    Write-Host "✅ createPortal 导入正确" -ForegroundColor Green
} else {
    Write-Host "❌ createPortal 导入缺失" -ForegroundColor Red
}

if ($content -match "CharacterInfoCard") {
    Write-Host "✅ CharacterInfoCard 导入正确" -ForegroundColor Green
} else {
    Write-Host "❌ CharacterInfoCard 导入缺失" -ForegroundColor Red
}

# 检查Portal渲染逻辑
Write-Host "`n🎯 检查Portal渲染逻辑..." -ForegroundColor Yellow
if ($content -match "createPortal\s*\(") {
    Write-Host "✅ Portal渲染逻辑存在" -ForegroundColor Green
} else {
    Write-Host "❌ Portal渲染逻辑缺失" -ForegroundColor Red
}

if ($content -match "document\.body") {
    Write-Host "✅ Portal挂载点正确" -ForegroundColor Green
} else {
    Write-Host "❌ Portal挂载点错误" -ForegroundColor Red
}

# 检查调试日志
Write-Host "`n📝 检查调试日志..." -ForegroundColor Yellow
if ($content -match "💳 显示信息卡片") {
    Write-Host "✅ 信息卡片调试日志存在" -ForegroundColor Green
} else {
    Write-Host "❌ 信息卡片调试日志缺失" -ForegroundColor Red
}

# 检查组件注释更新
Write-Host "`n📖 检查组件文档..." -ForegroundColor Yellow
if ($content -match "角色信息卡片显示") {
    Write-Host "✅ 组件文档已更新" -ForegroundColor Green
} else {
    Write-Host "❌ 组件文档未更新" -ForegroundColor Red
}

# 检查实验记录
Write-Host "`n📚 检查实验记录..." -ForegroundColor Yellow
if (Test-Path "_experiments/exp/EXP107.md") {
    Write-Host "✅ EXP107 实验记录存在" -ForegroundColor Green
} else {
    Write-Host "❌ EXP107 实验记录缺失" -ForegroundColor Red
}

if (Test-Path "_experiments/sum/SUM14.md") {
    Write-Host "✅ SUM14 总结记录存在" -ForegroundColor Green
} else {
    Write-Host "❌ SUM14 总结记录缺失" -ForegroundColor Red
}

if (Test-Path "_experiments/mem/MEM09.md") {
    Write-Host "✅ MEM09 记忆记录存在" -ForegroundColor Green
} else {
    Write-Host "❌ MEM09 记忆记录缺失" -ForegroundColor Red
}

Write-Host "`n🎉 验证完成！" -ForegroundColor Green
Write-Host "现在可以在浏览器中测试鼠标悬浮功能：" -ForegroundColor Cyan
Write-Host "1. 确保前后端服务正在运行" -ForegroundColor White
Write-Host "2. 在3D场景中移动鼠标" -ForegroundColor White
Write-Host "3. 悬浮在角色球体上应该看到高亮效果和信息卡片" -ForegroundColor White
Write-Host "4. 检查浏览器控制台的调试日志" -ForegroundColor White
