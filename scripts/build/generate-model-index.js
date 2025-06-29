import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 自动生成模型索引文件
 * 扫描 public/models 目录，生成 index.json
 */
function generateModelIndex() {
  const modelsDir = path.join(__dirname, '../../public/models')
  const indexPath = path.join(modelsDir, 'index.json')
  
  try {
    // 检查目录是否存在
    if (!fs.existsSync(modelsDir)) {
      console.error('❌ Models目录不存在:', modelsDir)
      return
    }
    
    // 读取目录中的所有文件
    const files = fs.readdirSync(modelsDir)
    
    // 过滤出.glb文件
    const modelFiles = files.filter(file => {
      return file.endsWith('.glb') && fs.statSync(path.join(modelsDir, file)).isFile()
    })
    
    // 按名称排序
    modelFiles.sort()
    
    // 生成索引数据
    const indexData = {
      models: modelFiles,
      lastUpdated: new Date().toISOString(),
      count: modelFiles.length,
      generatedBy: 'generate-model-index.js',
      description: '自动生成的模型文件索引'
    }
    
    // 写入索引文件
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf8')
    
    console.log('✅ 模型索引生成成功!')
    console.log(`📁 扫描目录: ${modelsDir}`)
    console.log(`📄 索引文件: ${indexPath}`)
    console.log(`🎭 找到模型: ${modelFiles.length} 个`)
    console.log('📋 模型列表:')
    modelFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`)
    })
    
  } catch (error) {
    console.error('❌ 生成模型索引失败:', error)
  }
}

// 直接运行生成函数
generateModelIndex()

export { generateModelIndex }
