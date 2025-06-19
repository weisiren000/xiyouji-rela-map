import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 测试模型检测功能
 */
async function testModelDetection() {
  console.log('🧪 开始测试模型检测功能...\n')
  
  // 测试1: 检查索引文件
  console.log('📋 测试1: 检查模型索引文件')
  const indexPath = path.join(__dirname, '../public/models/index.json')
  
  try {
    if (fs.existsSync(indexPath)) {
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
      console.log('✅ 索引文件存在')
      console.log(`📊 模型数量: ${indexData.count}`)
      console.log(`🕒 更新时间: ${indexData.lastUpdated}`)
      console.log('📋 模型列表:')
      indexData.models.forEach((model, index) => {
        console.log(`   ${index + 1}. ${model}`)
      })
    } else {
      console.log('❌ 索引文件不存在')
    }
  } catch (error) {
    console.log('❌ 索引文件读取失败:', error.message)
  }
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // 测试2: 验证模型文件存在性
  console.log('📁 测试2: 验证模型文件存在性')
  const modelsDir = path.join(__dirname, '../public/models')
  
  try {
    const files = fs.readdirSync(modelsDir)
    const glbFiles = files.filter(file => file.endsWith('.glb'))
    
    console.log(`📂 目录扫描结果: 找到 ${glbFiles.length} 个 .glb 文件`)
    glbFiles.forEach((file, index) => {
      const filePath = path.join(modelsDir, file)
      const stats = fs.statSync(filePath)
      const sizeKB = Math.round(stats.size / 1024)
      console.log(`   ${index + 1}. ${file} (${sizeKB} KB)`)
    })
  } catch (error) {
    console.log('❌ 目录扫描失败:', error.message)
  }
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // 测试3: 模拟HTTP请求测试
  console.log('🌐 测试3: 模拟HTTP访问测试')
  console.log('💡 提示: 这个测试需要开发服务器运行在 http://localhost:3001')
  
  try {
    // 测试索引文件访问
    const indexUrl = 'http://localhost:3001/models/index.json'
    console.log(`🔗 测试索引文件访问: ${indexUrl}`)
    
    const response = await fetch(indexUrl)
    if (response.ok) {
      const data = await response.json()
      console.log('✅ 索引文件HTTP访问成功')
      console.log(`📊 通过HTTP获取到 ${data.count} 个模型`)
    } else {
      console.log(`❌ 索引文件HTTP访问失败: ${response.status}`)
    }
    
    // 测试模型文件访问
    console.log('\n🎭 测试模型文件HTTP访问:')
    const testModels = ['孙悟空.glb', '唐僧.glb', '白龙马.glb']
    
    for (const model of testModels) {
      const modelUrl = `http://localhost:3001/models/${encodeURIComponent(model)}`
      try {
        const modelResponse = await fetch(modelUrl, { method: 'HEAD' })
        if (modelResponse.ok) {
          console.log(`   ✅ ${model} - 可访问`)
        } else {
          console.log(`   ❌ ${model} - 无法访问 (${modelResponse.status})`)
        }
      } catch (error) {
        console.log(`   ❌ ${model} - 请求失败: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.log('❌ HTTP测试失败:', error.message)
    console.log('💡 请确保开发服务器正在运行: npm run dev')
  }
  
  console.log('\n' + '='.repeat(50) + '\n')
  console.log('🎉 模型检测功能测试完成!')
  console.log('\n📝 使用说明:')
  console.log('1. 添加新模型: 将 .glb 文件放入 public/models/ 目录')
  console.log('2. 更新索引: npm run models:index')
  console.log('3. 监控变化: npm run models:watch')
  console.log('4. 查看效果: 刷新浏览器，点击左上角"模型库"按钮')
}

// 运行测试
testModelDetection().catch(console.error)
