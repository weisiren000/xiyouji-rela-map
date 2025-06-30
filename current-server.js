/**
 * 西游记数据服务器 - SQLite版本
 * 负责从SQLite数据库读取数据并提供API接口
 */

const express = require('express')
const path = require('path')
const cors = require('cors')
const Database = require('better-sqlite3')

const app = express()
const PORT = 3003

// 数据库路径配置
const DB_PATH = path.join(__dirname, '../../data/characters.db')

// 中间件
app.use(cors())
app.use(express.json())

// 数据库连接
let db = null

/**
 * 初始化数据库连接
 */
function initDatabase() {
  try {
    db = new Database(DB_PATH)
    console.log('✅ SQLite数据库连接成功')
    console.log(`📍 数据库路径: ${DB_PATH}`)
    
    // 验证数据库
    const count = db.prepare('SELECT COUNT(*) as count FROM characters').get().count
    console.log(`📊 数据库中有 ${count} 个角色`)
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    throw error
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
  if (attributes?.level?.category === 'buddhist') return '佛教'
  if (attributes?.level?.category === 'immortal') return '天庭'
  if (category === 'demon') return '妖魔'
  if (category === 'dragon') return '龙族'
  if (category === 'underworld') return '地府'
  return '其他'
}

/**
 * 生成可视化配置
 */
function generateVisualConfig(character) {
  const rank = character.rank || 0
  const power = character.power || 50
  const category = character.category
  
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
 * 转换SQLite数据为前端格式
 */
function transformSqliteToFrontend(sqliteData) {
  try {
    // 解析JSON字段
    const aliases = JSON.parse(sqliteData.aliases || '[]')
    const tags = JSON.parse(sqliteData.tags || '[]')
    const chapters = JSON.parse(sqliteData.source_chapters || '[]')
    const attributes = JSON.parse(sqliteData.attributes || '{}')
    
    return {
      id: sqliteData.unid,
      name: sqliteData.name,
      pinyin: sqliteData.pinyin,
      aliases: aliases,
      type: mapCharacterType(sqliteData.category),
      category: sqliteData.category,
      faction: mapFaction(sqliteData.category, attributes),
      rank: sqliteData.rank,
      level: attributes.level,
      power: sqliteData.power,
      influence: sqliteData.influence,
      morality: sqliteData.morality,
      description: sqliteData.description,
      tags: tags,
      chapters: chapters,
      firstAppearance: sqliteData.first_appearance,
      isAlias: sqliteData.is_alias === 1,
      aliasOf: sqliteData.alias_of,
      visual: generateVisualConfig(sqliteData),
      metadata: {
        source: 'sqlite',
        lastModified: sqliteData.updated_at || new Date().toISOString(),
        verified: true
      }
    }
  } catch (error) {
    console.error('转换数据失败:', error)
    return null
  }
}

/**
 * 加载所有角色数据
 */
function loadAllCharacters() {
  try {
    console.log('开始从SQLite加载角色数据...')
    
    const query = `
      SELECT c.*, m.aliases, m.tags, m.source_chapters, m.attributes, m.description
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid
      WHERE c.is_alias = 0
    `
    
    const rawData = db.prepare(query).all()
    const characters = rawData
      .map(transformSqliteToFrontend)
      .filter(char => char !== null)
    
    console.log(`✅ 成功加载 ${characters.length} 个角色`)
    return characters
    
  } catch (error) {
    console.error('❌ 加载角色数据失败:', error)
    throw error
  }
}

/**
 * 加载所有别名数据
 */
function loadAllAliases() {
  try {
    console.log('开始从SQLite加载别名数据...')
    
    const query = `
      SELECT c.*, m.aliases, m.tags, m.source_chapters, m.attributes, m.description
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid
      WHERE c.is_alias = 1
    `
    
    const rawData = db.prepare(query).all()
    const aliases = rawData
      .map(transformSqliteToFrontend)
      .filter(alias => alias !== null)
    
    console.log(`✅ 成功加载 ${aliases.length} 个别名`)
    return aliases
    
  } catch (error) {
    console.error('❌ 加载别名数据失败:', error)
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

// 数据缓存
let charactersCache = null
let aliasesCache = null
let lastCacheTime = null

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
        source: 'sqlite',
        timestamp: new Date().toISOString()
      })
    }
    
    // 重新加载数据
    const characters = loadAllCharacters()
    charactersCache = characters
    lastCacheTime = now
    
    res.json({
      success: true,
      data: characters,
      cached: false,
      source: 'sqlite',
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
        source: 'sqlite',
        timestamp: new Date().toISOString()
      })
    }
    
    // 重新加载数据
    const aliases = loadAllAliases()
    aliasesCache = aliases
    
    res.json({
      success: true,
      data: aliases,
      cached: false,
      source: 'sqlite',
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
    const characters = loadAllCharacters()
    const aliases = loadAllAliases()
    const stats = calculateStats(characters, aliases)
    
    res.json({
      success: true,
      data: {
        characters,
        aliases,
        stats
      },
      source: 'sqlite',
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
 * 搜索角色 (新功能 - SQLite独有)
 */
app.get('/api/characters/search', async (req, res) => {
  try {
    const { q, category, minPower, maxPower } = req.query
    
    let query = `
      SELECT c.*, m.aliases, m.tags, m.source_chapters, m.attributes, m.description
      FROM characters c 
      LEFT JOIN character_metadata m ON c.unid = m.unid
      WHERE 1=1
    `
    const params = []
    
    if (q) {
      query += ` AND (c.name LIKE ? OR c.pinyin LIKE ? OR m.description LIKE ?)`
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }
    
    if (category) {
      query += ` AND c.category = ?`
      params.push(category)
    }
    
    if (minPower) {
      query += ` AND c.power >= ?`
      params.push(parseInt(minPower))
    }
    
    if (maxPower) {
      query += ` AND c.power <= ?`
      params.push(parseInt(maxPower))
    }
    
    query += ` ORDER BY c.rank`
    
    const rawData = db.prepare(query).all(...params)
    const results = rawData
      .map(transformSqliteToFrontend)
      .filter(char => char !== null)
    
    res.json({
      success: true,
      data: results,
      query: req.query,
      count: results.length,
      source: 'sqlite',
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
    const characters = charactersCache || loadAllCharacters()
    const aliases = aliasesCache || loadAllAliases()
    const stats = calculateStats(characters, aliases)
    
    res.json({
      success: true,
      data: stats,
      source: 'sqlite',
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
      source: 'sqlite',
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

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🔄 正在关闭服务器...')
  if (db) {
    db.close()
    console.log('✅ 数据库连接已关闭')
  }
  process.exit(0)
})

// 启动服务器
try {
  initDatabase()
  
  app.listen(PORT, () => {
    console.log(`🚀 西游记数据服务器启动成功！(SQLite版本)`)
    console.log(`📡 服务地址: http://localhost:${PORT}`)
    console.log(`🗄️ 数据库路径: ${DB_PATH}`)
    console.log(`⚡ 新功能: 支持高级搜索 /api/characters/search`)
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`)
  })
  
} catch (error) {
  console.error('❌ 服务器启动失败:', error)
  process.exit(1)
}

module.exports = app
