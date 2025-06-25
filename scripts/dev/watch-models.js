import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateModelIndex } from './generate-model-index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 监控模型目录变化，自动更新索引文件
 */
function watchModelsDirectory() {
  const modelsDir = path.join(__dirname, '../public/models')
  
  console.log('👀 开始监控模型目录变化...')
  console.log('📁 监控目录:', modelsDir)
  
  // 初始生成索引
  generateModelIndex()
  
  // 监控目录变化
  fs.watch(modelsDir, { recursive: false }, (eventType, filename) => {
    if (filename && filename.endsWith('.glb')) {
      console.log(`📝 检测到模型文件变化: ${eventType} - ${filename}`)
      
      // 延迟一点时间确保文件操作完成
      setTimeout(() => {
        console.log('🔄 重新生成模型索引...')
        generateModelIndex()
      }, 1000)
    }
  })
  
  console.log('✅ 模型目录监控已启动')
  console.log('💡 提示: 添加、删除或修改 .glb 文件时会自动更新索引')
  console.log('🛑 按 Ctrl+C 停止监控')
}

// 运行监控
watchModelsDirectory()

// 优雅退出处理
process.on('SIGINT', () => {
  console.log('\n🛑 停止模型目录监控')
  process.exit(0)
})
