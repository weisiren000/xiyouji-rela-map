/**
 * 西游记数据服务器
 * 负责读取JSON文件并提供API接口
 */

const express = require('express')
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = 3002

// 数据路径配置
const DATA_PATH = 'D:\\codee\\xiyouji-rela-map\\docs\\data\\JSON'
const CHARACTER_PATH = path.join(DATA_PATH, 'character')
const ALIAS_PATH = path.join(DATA_PATH, 'character_alias')

// 中间件
app.use(cors())
app.use(express.json())

// 数据缓存
let charactersCache = null
let aliasesCache = null
let lastCacheTime = null

/**
 * 扫描指定目录下的JSON文件
 */
async function scanJsonFiles(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath)
    return files.filter(file => file.endsWith('.json'))
  } catch (error) {
    console.error(`扫描目录失败: ${directoryPath}`, error)
    throw new Error(`无法扫描目录: ${error.message}`)
  }
}

/**
 * 读取单个JSON文件
 */
async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error)
    throw new Error(`无法读取文件: ${error.message}`)
  }
}

/**
 * 转换JSON数据为前端格式
 */
function transformCharacterData(rawData, filePath) {
  try {
    return {
      id: rawData.unid,
      name: rawData.basic.name,
      pinyin: rawData.basic.pinyin,
      aliases: rawData.basic.aliases || [],
      type: mapCharacterType(rawData.basic.category),
      category: rawData.basic.category,
      faction: mapFaction(rawData.basic.category, rawData.attributes),
      rank: rawData.attributes.rank,
      level: rawData.attributes.level,
      power: rawData.attributes.power,
      influence: rawData.attributes.influence,
      morality: rawData.attributes.morality,
      description: rawData.metadata.description,
      tags: rawData.metadata.tags || [],
      chapters: rawData.metadata.sourceChapters || [],
      firstAppearance: rawData.metadata.firstAppearance,
      isAlias: rawData.isAlias || false,
      aliasOf: rawData.aliasOf,
      visual: generateVisualConfig(rawData),
      metadata: {
        source: filePath,
        lastModified: rawData.metadata.lastUpdated || new Date().toISOString(),
        verified: true
      }
    }
  } catch (error) {
    console.error(`转换数据失败: ${filePath}`, error)
    return null
  }
}

/**
 * 映射角色类型
 */
function mapCharacterType(category) {
  const typeMap = {
    'protagonist': 'PROTAGONIST',
    'deity': 'DEITY', 
    'demon': 'DEMON',
    'human': 'HUMAN',
    'dragon': 'DRAGON',
    'celestial': 'CELESTIAL',
    'buddhist': 'BUDDHIST',
    'underworld': 'UNDERWORLD'
  }
  return typeMap[category] || 'HUMAN'
}

/**
 * 映射势力
 */
function mapFaction(category, attributes) {
  if (category === 'protagonist') return '取经团队'
  if (attributes.level?.category === 'buddhist') return '佛教'
  if (attributes.level?.category === 'immortal') return '天庭'
  if (category === 'demon') return '妖魔'
  if (category === 'dragon') return '龙族'
  if (category === 'underworld') return '地府'
  return '其他'
}

/**
 * 生成可视化配置
 */
function generateVisualConfig(rawData) {
  const rank = rawData.attributes.rank
  const power = rawData.attributes.power || 50
  const category = rawData.basic.category
  
  // 基于类型的颜色映射
  const colorMap = {
    'protagonist': '#FFD700',    // 金色
    'deity': '#87CEEB',          // 天蓝色
    'demon': '#FF6347',          // 红色
    'dragon': '#00CED1',         // 青色
    'buddhist': '#DDA0DD',       // 紫色
    'celestial': '#F0E68C',      // 卡其色
    'underworld': '#696969',     // 灰色
    'human': '#FFA500'           // 橙色
  }
  
  // 基于排名的大小
  const size = Math.max(0.5, 2.0 - (rank / 150) * 1.5)
  
  // 基于能力的发光强度
  const emissiveIntensity = Math.max(0.1, Math.min(1.0, power / 100 * 0.8))
  
  return {
    color: colorMap[category] || '#FFFFFF',
    size: size,
    emissiveIntensity: emissiveIntensity
  }
}

/**
 * 加载所有角色数据
 */
async function loadAllCharacters() {
  try {
    console.log('开始加载角色数据...')
    
    // 扫描角色文件
    const characterFiles = await scanJsonFiles(CHARACTER_PATH)
    console.log(`找到 ${characterFiles.length} 个角色文件`)
    
    // 加载角色数据
    const characters = []
    for (const fileName of characterFiles) {
      try {
        const filePath = path.join(CHARACTER_PATH, fileName)
        const rawData = await readJsonFile(filePath)
        const characterData = transformCharacterData(rawData, filePath)
        
        if (characterData) {
          characters.push(characterData)
        }
      } catch (error) {
        console.error(`加载角色文件失败: ${fileName}`, error)
      }
    }
    
    console.log(`成功加载 ${characters.length} 个角色`)
    return characters
    
  } catch (error) {
    console.error('加载角色数据失败:', error)
    throw error
  }
}

/**
 * 加载所有别名数据
 */
async function loadAllAliases() {
  try {
    console.log('开始加载别名数据...')
    
    // 扫描别名文件
    const aliasFiles = await scanJsonFiles(ALIAS_PATH)
    console.log(`找到 ${aliasFiles.length} 个别名文件`)
    
    // 加载别名数据
    const aliases = []
    for (const fileName of aliasFiles) {
      try {
        const filePath = path.join(ALIAS_PATH, fileName)
        const rawData = await readJsonFile(filePath)
        const aliasData = transformCharacterData(rawData, filePath)
        
        if (aliasData) {
          aliases.push(aliasData)
        }
      } catch (error) {
        console.error(`加载别名文件失败: ${fileName}`, error)
      }
    }
    
    console.log(`成功加载 ${aliases.length} 个别名`)
    return aliases
    
  } catch (error) {
    console.error('加载别名数据失败:', error)
    throw error
  }
}

/**
 * 计算数据统计
 */
function calculateStats(characters, aliases) {
  const stats = {
    totalCharacters: characters.length,
    totalAliases: aliases.length,
    charactersByType: {},
    charactersByFaction: {},
    charactersByCategory: {},
    powerDistribution: {
      high: 0,    // 80+
      medium: 0,  // 50-79
      low: 0      // <50
    },
    lastUpdated: new Date().toISOString()
  }
  
  characters.forEach(char => {
    // 按类型统计
    stats.charactersByType[char.type] = (stats.charactersByType[char.type] || 0) + 1
    
    // 按势力统计
    stats.charactersByFaction[char.faction] = (stats.charactersByFaction[char.faction] || 0) + 1
    
    // 按分类统计
    stats.charactersByCategory[char.category] = (stats.charactersByCategory[char.category] || 0) + 1
    
    // 按能力统计
    if (char.power >= 80) stats.powerDistribution.high++
    else if (char.power >= 50) stats.powerDistribution.medium++
    else stats.powerDistribution.low++
  })
  
  return stats
}

// API路由

/**
 * 获取所有角色数据
 */
app.get('/api/characters', async (req, res) => {
  try {
    // 检查缓存
    const now = Date.now()
    if (charactersCache && lastCacheTime && (now - lastCacheTime < 5 * 60 * 1000)) {
      return res.json({
        success: true,
        data: charactersCache,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }
    
    // 重新加载数据
    const characters = await loadAllCharacters()
    charactersCache = characters
    lastCacheTime = now
    
    res.json({
      success: true,
      data: characters,
      cached: false,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * 获取所有别名数据
 */
app.get('/api/aliases', async (req, res) => {
  try {
    // 检查缓存
    const now = Date.now()
    if (aliasesCache && lastCacheTime && (now - lastCacheTime < 5 * 60 * 1000)) {
      return res.json({
        success: true,
        data: aliasesCache,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }
    
    // 重新加载数据
    const aliases = await loadAllAliases()
    aliasesCache = aliases
    
    res.json({
      success: true,
      data: aliases,
      cached: false,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * 获取完整数据（角色+别名+统计）
 */
app.get('/api/data/complete', async (req, res) => {
  try {
    const characters = await loadAllCharacters()
    const aliases = await loadAllAliases()
    const stats = calculateStats(characters, aliases)
    
    res.json({
      success: true,
      data: {
        characters,
        aliases,
        stats
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * 获取数据统计
 */
app.get('/api/stats', async (req, res) => {
  try {
    const characters = charactersCache || await loadAllCharacters()
    const aliases = aliasesCache || await loadAllAliases()
    const stats = calculateStats(characters, aliases)
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * 刷新缓存
 */
app.post('/api/cache/refresh', async (req, res) => {
  try {
    charactersCache = null
    aliasesCache = null
    lastCacheTime = null
    
    res.json({
      success: true,
      message: '缓存已清除',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 西游记数据服务器启动成功！`)
  console.log(`📡 服务地址: http://localhost:${PORT}`)
  console.log(`📁 数据路径: ${DATA_PATH}`)
  console.log(`👥 角色路径: ${CHARACTER_PATH}`)
  console.log(`🏷️ 别名路径: ${ALIAS_PATH}`)
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`)
})

module.exports = app
