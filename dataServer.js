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
const EVENTS_DB_PATH = path.join(__dirname, '../../data/events.db')

// 中间件
app.use(cors())
app.use(express.json())

// 数据库连接
let db = null
let eventsDb = null

/**
 * 初始化数据库连接
 */
function initDatabase() {
  try {
    // 初始化角色数据库
    db = new Database(DB_PATH)
    console.log('✅ SQLite角色数据库连接成功')
    console.log(`📍 角色数据库路径: ${DB_PATH}`)

    // 验证角色数据库
    const count = db.prepare('SELECT COUNT(*) as count FROM characters').get().count
    console.log(`📊 数据库中有 ${count} 个角色`)

    // 初始化事件数据库
    eventsDb = new Database(EVENTS_DB_PATH)
    console.log('✅ SQLite事件数据库连接成功')
    console.log(`📍 事件数据库路径: ${EVENTS_DB_PATH}`)

    // 验证事件数据库
    const eventsCount = eventsDb.prepare('SELECT COUNT(*) as count FROM event').get().count
    console.log(`📊 数据库中有 ${eventsCount} 个事件(81难)`)

  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    throw error
  }
}

/**
 * 映射角色类型 (适配汉化后的数据库)
 */
function mapCharacterType(category) {
  const typeMap = {
    // 中文映射
    '主角': 'PROTAGONIST',
    '神仙': 'DEITY',
    '妖魔': 'DEMON',
    '人类': 'HUMAN',
    '龙族': 'DRAGON',
    '天庭': 'CELESTIAL',
    '佛教': 'BUDDHIST',
    '地府': 'UNDERWORLD',
    '仙人': 'IMMORTAL',
    '反派': 'ANTAGONIST',
    '别名': 'ALIAS',
    // 兼容英文映射
    'protagonist': 'PROTAGONIST',
    'deity': 'DEITY',
    'demon': 'DEMON',
    'human': 'HUMAN',
    'dragon': 'DRAGON',
    'celestial': 'CELESTIAL',
    'buddhist': 'BUDDHIST',
    'underworld': 'UNDERWORLD',
    'immortal': 'IMMORTAL',
    'antagonist': 'ANTAGONIST',
    'alias': 'ALIAS'
  }
  return typeMap[category] || 'HUMAN'
}

/**
 * 映射势力 (适配汉化后的数据库)
 */
function mapFaction(category, attributes) {
  // 中文分类映射
  if (category === '主角' || category === 'protagonist') return '取经团队'
  if (category === '佛教' || category === 'buddhist') return '佛教'
  if (category === '天庭' || category === 'celestial') return '天庭'
  if (category === '神仙' || category === 'deity') return '天庭'
  if (category === '妖魔' || category === 'demon') return '妖魔'
  if (category === '龙族' || category === 'dragon') return '龙族'
  if (category === '地府' || category === 'underworld') return '地府'
  if (category === '人类' || category === 'human') return '凡间'
  if (category === '仙人' || category === 'immortal') return '天庭'
  if (category === '反派' || category === 'antagonist') return '反派势力'

  // 基于属性的映射
  if (attributes?.level?.category === 'buddhist' || attributes?.level?.category === '佛教') return '佛教'
  if (attributes?.level?.category === 'immortal' || attributes?.level?.category === '仙人') return '天庭'

  return '其他'
}

/**
 * 生成可视化配置
 */
function generateVisualConfig(character) {
  const rank = character.rank || 0
  const power = character.power || 50
  const category = character.category
  
  // 基于类型的颜色映射 (适配汉化后的数据库)
  const colorMap = {
    // 中文分类映射
    '主角': '#FFD700',           // 金色
    '神仙': '#87CEEB',           // 天蓝色
    '妖魔': '#FF6347',           // 红色
    '龙族': '#00CED1',           // 青色
    '佛教': '#DDA0DD',           // 紫色
    '天庭': '#F0E68C',           // 卡其色
    '地府': '#696969',           // 灰色
    '人类': '#FFA500',           // 橙色
    '仙人': '#98FB98',           // 浅绿色
    '反派': '#DC143C',           // 深红色
    '别名': '#C0C0C0',           // 银色
    // 兼容英文分类映射
    'protagonist': '#FFD700',    // 金色
    'deity': '#87CEEB',          // 天蓝色
    'demon': '#FF6347',          // 红色
    'dragon': '#00CED1',         // 青色
    'buddhist': '#DDA0DD',       // 紫色
    'celestial': '#F0E68C',      // 卡其色
    'underworld': '#696969',     // 灰色
    'human': '#FFA500',          // 橙色
    'immortal': '#98FB98',       // 浅绿色
    'antagonist': '#DC143C',     // 深红色
    'alias': '#C0C0C0'           // 银色
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
 * 转换事件数据为前端格式
 */
function transformEventToFrontend(eventData) {
  try {
    return {
      id: eventData.id,
      nanci: eventData.nanci,           // 难次
      nanming: eventData.nanming,       // 难名
      zhuyaorenwu: eventData.zhuyaorenwu, // 主要人物
      didian: eventData.didian,         // 地点
      shijianmiaoshu: eventData.shijianmiaoshu, // 事件描述
      xiangzhengyi: eventData.xiangzhengyi,     // 象征意义
      wenhuaneihan: eventData.wenhuaneihan,     // 文化内涵
      metadata: {
        source: 'sqlite',
        lastModified: new Date().toISOString(),
        verified: true
      }
    }
  } catch (error) {
    console.error('转换事件数据失败:', error)
    return null
  }
}

/**
 * 加载所有81难事件数据
 */
function loadAllEvents() {
  try {
    console.log('开始从SQLite加载81难事件数据...')

    const query = `SELECT * FROM event ORDER BY nanci`
    const rawData = eventsDb.prepare(query).all()
    const events = rawData
      .map(transformEventToFrontend)
      .filter(event => event !== null)

    console.log(`✅ 成功加载 ${events.length} 个事件`)
    return events

  } catch (error) {
    console.error('❌ 加载事件数据失败:', error)
    throw error
  }
}

/**
 * 根据难次获取单个事件
 */
function getEventByNanci(nanci) {
  try {
    const query = `SELECT * FROM event WHERE nanci = ?`
    const rawData = eventsDb.prepare(query).get(nanci)

    if (!rawData) {
      return null
    }

    return transformEventToFrontend(rawData)

  } catch (error) {
    console.error(`❌ 获取第${nanci}难数据失败:`, error)
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
let eventsCache = null
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
 * 获取所有81难事件数据
 */
app.get('/api/events', async (req, res) => {
  try {
    // 检查缓存
    const now = Date.now()
    if (eventsCache && lastCacheTime && (now - lastCacheTime < 5 * 60 * 1000)) {
      return res.json({
        success: true,
        data: eventsCache,
        cached: true,
        source: 'sqlite',
        timestamp: new Date().toISOString()
      })
    }

    // 重新加载数据
    const events = loadAllEvents()
    eventsCache = events
    lastCacheTime = now

    res.json({
      success: true,
      data: events,
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
 * 根据难次获取单个事件
 */
app.get('/api/events/:nanci', async (req, res) => {
  try {
    const nanci = parseInt(req.params.nanci)

    if (isNaN(nanci) || nanci < 1 || nanci > 81) {
      return res.status(400).json({
        success: false,
        error: '难次必须是1-81之间的数字',
        timestamp: new Date().toISOString()
      })
    }

    const event = getEventByNanci(nanci)

    if (!event) {
      return res.status(404).json({
        success: false,
        error: `未找到第${nanci}难的数据`,
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      success: true,
      data: event,
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
 * 搜索事件
 */
app.get('/api/events/search', async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: '请提供搜索关键词',
        timestamp: new Date().toISOString()
      })
    }

    const query = `
      SELECT * FROM event
      WHERE nanming LIKE ?
      OR zhuyaorenwu LIKE ?
      OR didian LIKE ?
      OR shijianmiaoshu LIKE ?
      ORDER BY nanci
    `
    const searchTerm = `%${q}%`
    const rawData = eventsDb.prepare(query).all(searchTerm, searchTerm, searchTerm, searchTerm)
    const results = rawData
      .map(transformEventToFrontend)
      .filter(event => event !== null)

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
 * 刷新缓存
 */
app.post('/api/cache/refresh', async (req, res) => {
  try {
    charactersCache = null
    aliasesCache = null
    eventsCache = null
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
    console.log('✅ 角色数据库连接已关闭')
  }
  if (eventsDb) {
    eventsDb.close()
    console.log('✅ 事件数据库连接已关闭')
  }
  process.exit(0)
})

// 启动服务器
try {
  initDatabase()
  
  app.listen(PORT, () => {
    console.log(`🚀 西游记数据服务器启动成功！(SQLite版本)`)
    console.log(`📡 服务地址: http://localhost:${PORT}`)
    console.log(`🗄️ 角色数据库: ${DB_PATH}`)
    console.log(`📚 事件数据库: ${EVENTS_DB_PATH}`)
    console.log(`⚡ 新功能: 支持高级搜索 /api/characters/search`)
    console.log(`🎯 新功能: 支持81难事件 /api/events`)
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`)
  })
  
} catch (error) {
  console.error('❌ 服务器启动失败:', error)
  process.exit(1)
}

module.exports = app
