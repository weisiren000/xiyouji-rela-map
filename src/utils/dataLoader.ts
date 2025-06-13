/**
 * 数据加载工具
 * 负责从文件系统加载JSON数据
 */

import { CharacterData, DataLoadResult, DataStats, CharacterType } from '@/types/character'

/**
 * 扫描指定目录下的JSON文件
 */
export async function scanJsonFiles(directoryPath: string): Promise<string[]> {
  try {
    // 使用Desktop Commander的list_directory功能
    // 这里需要调用MCP工具来扫描目录
    console.log(`扫描目录: ${directoryPath}`)
    
    // 模拟扫描结果，实际实现需要调用MCP工具
    const mockFiles = [
      'c0001.json', 'c0002.json', 'c0003.json', // 主角色
      'ca0001.json', 'ca0002.json', 'ca0003.json' // 别名
    ]
    
    return mockFiles.filter(file => file.endsWith('.json'))
  } catch (error) {
    console.error('扫描文件失败:', error)
    throw new Error(`无法扫描目录 ${directoryPath}: ${error}`)
  }
}

/**
 * 加载单个JSON文件
 */
export async function loadJsonFile(filePath: string): Promise<any> {
  try {
    // 使用Desktop Commander的read_file功能
    console.log(`加载文件: ${filePath}`)
    
    // 模拟文件内容，实际实现需要调用MCP工具
    const mockData = {
      id: 'c0001',
      name: '孙悟空',
      type: 'protagonist',
      faction: '取经团队',
      rank: 1,
      description: '齐天大圣，斗战胜佛'
    }
    
    return mockData
  } catch (error) {
    console.error('加载文件失败:', error)
    throw new Error(`无法加载文件 ${filePath}: ${error}`)
  }
}

/**
 * 批量加载JSON文件
 */
export async function loadMultipleJsonFiles(
  filePaths: string[],
  onProgress?: (progress: number) => void
): Promise<DataLoadResult> {
  const result: DataLoadResult = {
    success: true,
    data: [],
    errors: [],
    stats: {
      totalCharacters: 0,
      charactersByType: {} as Record<CharacterType, number>,
      charactersByFaction: {},
      relationshipCount: 0,
      lastUpdated: new Date().toISOString()
    }
  }
  
  try {
    for (let i = 0; i < filePaths.length; i++) {
      try {
        const rawData = await loadJsonFile(filePaths[i])
        const characterData = validateAndTransformCharacterData(rawData, filePaths[i])
        
        if (characterData) {
          result.data.push(characterData)
        }
        
        // 更新进度
        if (onProgress) {
          onProgress((i + 1) / filePaths.length * 100)
        }
        
      } catch (error) {
        result.errors.push(`文件 ${filePaths[i]}: ${error}`)
        result.success = false
      }
    }
    
    // 计算统计信息
    result.stats = calculateDataStats(result.data)
    
  } catch (error) {
    result.success = false
    result.errors.push(`批量加载失败: ${error}`)
  }
  
  return result
}

/**
 * 验证和转换角色数据
 */
function validateAndTransformCharacterData(rawData: any, filePath: string): CharacterData | null {
  try {
    // 基础验证
    if (!rawData.id || !rawData.name) {
      throw new Error('缺少必需字段: id 或 name')
    }
    
    // 转换为标准格式
    const characterData: CharacterData = {
      id: rawData.id,
      name: rawData.name,
      aliases: rawData.aliases || [],
      type: rawData.type || CharacterType.HUMAN,
      faction: rawData.faction || '未知',
      rank: rawData.rank || 999,
      level: rawData.level || { id: 'unknown', name: '未知', tier: 0 },
      description: rawData.description || '',
      chapter: rawData.chapter,
      abilities: rawData.abilities || [],
      visual: {
        color: rawData.visual?.color || '#ffffff',
        size: rawData.visual?.size || 1.0,
        emissiveIntensity: rawData.visual?.emissiveIntensity || 0.2,
        position: rawData.visual?.position
      },
      relationships: rawData.relationships || [],
      metadata: {
        source: filePath,
        lastModified: new Date().toISOString(),
        tags: rawData.metadata?.tags || [],
        verified: rawData.metadata?.verified || false
      }
    }
    
    return characterData
  } catch (error) {
    console.error(`验证数据失败 (${filePath}):`, error)
    return null
  }
}

/**
 * 计算数据统计信息
 */
function calculateDataStats(characters: CharacterData[]): DataStats {
  const stats: DataStats = {
    totalCharacters: characters.length,
    charactersByType: {} as Record<CharacterType, number>,
    charactersByFaction: {},
    relationshipCount: 0,
    lastUpdated: new Date().toISOString()
  }
  
  // 统计角色类型
  Object.values(CharacterType).forEach(type => {
    stats.charactersByType[type] = 0
  })
  
  characters.forEach(character => {
    // 按类型统计
    stats.charactersByType[character.type] = 
      (stats.charactersByType[character.type] || 0) + 1
    
    // 按势力统计
    stats.charactersByFaction[character.faction] = 
      (stats.charactersByFaction[character.faction] || 0) + 1
    
    // 统计关系数量
    stats.relationshipCount += character.relationships?.length || 0
  })
  
  return stats
}

/**
 * 保存角色数据到JSON文件
 */
export async function saveCharacterData(character: CharacterData, filePath: string): Promise<void> {
  try {
    const jsonData = JSON.stringify(character, null, 2)
    
    // 使用Desktop Commander的write_file功能
    console.log(`保存文件: ${filePath}`)
    console.log('数据:', jsonData)
    
    // 实际实现需要调用MCP工具
    // await writeFile(filePath, jsonData)
    
  } catch (error) {
    console.error('保存文件失败:', error)
    throw new Error(`无法保存文件 ${filePath}: ${error}`)
  }
}

/**
 * 删除JSON文件
 */
export async function deleteJsonFile(filePath: string): Promise<void> {
  try {
    // 使用Desktop Commander的remove_files功能
    console.log(`删除文件: ${filePath}`)
    
    // 实际实现需要调用MCP工具
    // await removeFile(filePath)
    
  } catch (error) {
    console.error('删除文件失败:', error)
    throw new Error(`无法删除文件 ${filePath}: ${error}`)
  }
}

/**
 * 导出数据为JSON格式
 */
export function exportDataAsJson(characters: CharacterData[]): string {
  return JSON.stringify({
    version: '1.0',
    exportTime: new Date().toISOString(),
    totalCharacters: characters.length,
    characters: characters
  }, null, 2)
}

/**
 * 从导出的JSON导入数据
 */
export function importDataFromJson(jsonString: string): CharacterData[] {
  try {
    const data = JSON.parse(jsonString)
    
    if (!data.characters || !Array.isArray(data.characters)) {
      throw new Error('无效的数据格式')
    }
    
    return data.characters.map((char: any, index: number) => 
      validateAndTransformCharacterData(char, `import_${index}`)
    ).filter(Boolean)
    
  } catch (error) {
    console.error('导入数据失败:', error)
    throw new Error(`数据导入失败: ${error}`)
  }
}
