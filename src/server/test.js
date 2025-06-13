/**
 * 数据服务器测试脚本
 */

const fs = require('fs').promises
const path = require('path')

// 数据路径配置
const DATA_PATH = 'D:\\codee\\xiyouji-rela-map\\docs\\data\\JSON'
const CHARACTER_PATH = path.join(DATA_PATH, 'character')
const ALIAS_PATH = path.join(DATA_PATH, 'character_alias')

/**
 * 测试数据路径
 */
async function testDataPaths() {
  console.log('🔍 测试数据路径...')
  
  try {
    // 检查主数据目录
    await fs.access(DATA_PATH)
    console.log(`✅ 主数据目录存在: ${DATA_PATH}`)
    
    // 检查角色目录
    await fs.access(CHARACTER_PATH)
    console.log(`✅ 角色目录存在: ${CHARACTER_PATH}`)
    
    // 检查别名目录
    await fs.access(ALIAS_PATH)
    console.log(`✅ 别名目录存在: ${ALIAS_PATH}`)
    
    return true
  } catch (error) {
    console.error('❌ 数据路径检查失败:', error.message)
    return false
  }
}

/**
 * 测试文件扫描
 */
async function testFileScan() {
  console.log('\n📁 测试文件扫描...')
  
  try {
    // 扫描角色文件
    const characterFiles = await fs.readdir(CHARACTER_PATH)
    const jsonCharacterFiles = characterFiles.filter(f => f.endsWith('.json'))
    console.log(`✅ 找到 ${jsonCharacterFiles.length} 个角色文件`)
    
    // 扫描别名文件
    const aliasFiles = await fs.readdir(ALIAS_PATH)
    const jsonAliasFiles = aliasFiles.filter(f => f.endsWith('.json'))
    console.log(`✅ 找到 ${jsonAliasFiles.length} 个别名文件`)
    
    // 显示前5个文件
    console.log('\n📋 角色文件示例:')
    jsonCharacterFiles.slice(0, 5).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`)
    })
    
    console.log('\n📋 别名文件示例:')
    jsonAliasFiles.slice(0, 5).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`)
    })
    
    return { characterFiles: jsonCharacterFiles, aliasFiles: jsonAliasFiles }
  } catch (error) {
    console.error('❌ 文件扫描失败:', error.message)
    return null
  }
}

/**
 * 测试文件读取
 */
async function testFileReading(files) {
  console.log('\n📖 测试文件读取...')
  
  try {
    // 读取第一个角色文件
    if (files.characterFiles.length > 0) {
      const firstCharacterFile = files.characterFiles[0]
      const characterPath = path.join(CHARACTER_PATH, firstCharacterFile)
      const characterContent = await fs.readFile(characterPath, 'utf8')
      const characterData = JSON.parse(characterContent)
      
      console.log(`✅ 成功读取角色文件: ${firstCharacterFile}`)
      console.log(`   角色名称: ${characterData.basic.name}`)
      console.log(`   角色ID: ${characterData.unid}`)
      console.log(`   角色类型: ${characterData.basic.category}`)
      console.log(`   排名: ${characterData.attributes.rank}`)
    }
    
    // 读取第一个别名文件
    if (files.aliasFiles.length > 0) {
      const firstAliasFile = files.aliasFiles[0]
      const aliasPath = path.join(ALIAS_PATH, firstAliasFile)
      const aliasContent = await fs.readFile(aliasPath, 'utf8')
      const aliasData = JSON.parse(aliasContent)
      
      console.log(`✅ 成功读取别名文件: ${firstAliasFile}`)
      console.log(`   别名: ${aliasData.basic.name}`)
      console.log(`   别名ID: ${aliasData.unid}`)
      console.log(`   指向角色: ${aliasData.aliasOf}`)
    }
    
    return true
  } catch (error) {
    console.error('❌ 文件读取失败:', error.message)
    return false
  }
}

/**
 * 测试数据转换
 */
async function testDataTransformation(files) {
  console.log('\n🔄 测试数据转换...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    // 测试前10个角色文件的转换
    const testFiles = files.characterFiles.slice(0, 10)
    
    for (const fileName of testFiles) {
      try {
        const filePath = path.join(CHARACTER_PATH, fileName)
        const content = await fs.readFile(filePath, 'utf8')
        const rawData = JSON.parse(content)
        
        // 模拟数据转换
        const transformedData = {
          id: rawData.unid,
          name: rawData.basic.name,
          type: rawData.basic.category,
          rank: rawData.attributes.rank,
          power: rawData.attributes.power,
          influence: rawData.attributes.influence
        }
        
        successCount++
      } catch (error) {
        console.error(`   ❌ 转换失败: ${fileName} - ${error.message}`)
        errorCount++
      }
    }
    
    console.log(`✅ 数据转换测试完成: ${successCount} 成功, ${errorCount} 失败`)
    return errorCount === 0
  } catch (error) {
    console.error('❌ 数据转换测试失败:', error.message)
    return false
  }
}

/**
 * 测试API端点
 */
async function testApiEndpoints() {
  console.log('\n🌐 测试API端点...')
  
  try {
    const fetch = (await import('node-fetch')).default
    const baseUrl = 'http://localhost:3001/api'
    
    // 测试统计端点
    try {
      const response = await fetch(`${baseUrl}/stats`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ /api/stats 端点正常')
        console.log(`   总角色数: ${data.data?.totalCharacters || '未知'}`)
      } else {
        console.log('⚠️ /api/stats 端点返回错误状态')
      }
    } catch (error) {
      console.log('❌ /api/stats 端点无法访问 (服务器可能未启动)')
    }
    
  } catch (error) {
    console.log('⚠️ 无法测试API端点 (需要先安装 node-fetch)')
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🧪 西游记数据服务器测试')
  console.log('=' .repeat(50))
  
  // 测试数据路径
  const pathsOk = await testDataPaths()
  if (!pathsOk) {
    console.log('\n❌ 数据路径测试失败，无法继续')
    return
  }
  
  // 测试文件扫描
  const files = await testFileScan()
  if (!files) {
    console.log('\n❌ 文件扫描测试失败，无法继续')
    return
  }
  
  // 测试文件读取
  const readingOk = await testFileReading(files)
  if (!readingOk) {
    console.log('\n❌ 文件读取测试失败')
  }
  
  // 测试数据转换
  const transformationOk = await testDataTransformation(files)
  if (!transformationOk) {
    console.log('\n❌ 数据转换测试失败')
  }
  
  // 测试API端点
  await testApiEndpoints()
  
  console.log('\n' + '=' .repeat(50))
  console.log('🎯 测试总结:')
  console.log(`   数据路径: ${pathsOk ? '✅' : '❌'}`)
  console.log(`   文件扫描: ${files ? '✅' : '❌'}`)
  console.log(`   文件读取: ${readingOk ? '✅' : '❌'}`)
  console.log(`   数据转换: ${transformationOk ? '✅' : '❌'}`)
  
  if (pathsOk && files && readingOk && transformationOk) {
    console.log('\n🎉 所有测试通过！数据服务器准备就绪。')
    console.log('💡 运行 "npm start" 启动服务器')
  } else {
    console.log('\n⚠️ 部分测试失败，请检查配置')
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  testDataPaths,
  testFileScan,
  testFileReading,
  testDataTransformation
}
