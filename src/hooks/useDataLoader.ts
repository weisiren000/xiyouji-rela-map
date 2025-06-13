import { useState, useCallback } from 'react'
import { CharacterData, DataLoadResult } from '@/types/character'

/**
 * 数据加载Hook
 * 集成MCP工具进行文件系统操作
 */
export const useDataLoader = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 扫描JSON文件
  const scanJsonFiles = useCallback(async (directoryPath: string): Promise<string[]> => {
    setIsLoading(true)
    setError(null)

    try {
      // 这里需要调用MCP的list_directory工具
      // 暂时返回模拟数据
      console.log(`扫描目录: ${directoryPath}`)
      
      // 模拟扫描结果
      const mockFiles = [
        'c0001.json', 'c0002.json', 'c0003.json', 'c0004.json', 'c0005.json',
        'c0006.json', 'c0007.json', 'c0008.json', 'c0009.json', 'c0010.json',
        'ca0001.json', 'ca0002.json', 'ca0003.json', 'ca0004.json', 'ca0005.json'
      ]
      
      return mockFiles.filter(file => file.endsWith('.json'))
    } catch (err) {
      const errorMessage = `扫描目录失败: ${err}`
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 加载单个JSON文件
  const loadJsonFile = useCallback(async (filePath: string): Promise<any> => {
    try {
      // 这里需要调用MCP的read_file工具
      console.log(`加载文件: ${filePath}`)
      
      // 模拟文件内容
      const fileName = filePath.split('/').pop() || ''
      const isAlias = fileName.startsWith('ca')
      const id = fileName.replace('.json', '')
      
      if (isAlias) {
        return {
          id: id,
          name: `别名${id.slice(2)}`,
          type: 'alias',
          parentId: `c${id.slice(2)}`,
          description: `这是一个别名角色`
        }
      } else {
        const characterNumber = parseInt(id.slice(1))
        return {
          id: id,
          name: `角色${characterNumber}`,
          type: characterNumber <= 5 ? 'protagonist' : 'deity',
          faction: characterNumber <= 5 ? '取经团队' : '天庭',
          rank: characterNumber,
          description: `这是第${characterNumber}个角色的描述`,
          visual: {
            color: `hsl(${characterNumber * 30}, 70%, 60%)`,
            size: 1.0,
            emissiveIntensity: 0.2
          },
          metadata: {
            source: filePath,
            lastModified: new Date().toISOString(),
            tags: [],
            verified: true
          }
        }
      }
    } catch (err) {
      throw new Error(`加载文件失败: ${err}`)
    }
  }, [])

  // 批量加载JSON文件
  const loadMultipleJsonFiles = useCallback(async (
    filePaths: string[],
    onProgress?: (progress: number) => void
  ): Promise<DataLoadResult> => {
    setIsLoading(true)
    setError(null)

    const result: DataLoadResult = {
      success: true,
      data: [],
      errors: [],
      stats: {
        totalCharacters: 0,
        charactersByType: {
        protagonist: 0,
        deity: 0,
        demon: 0,
        human: 0,
        dragon: 0,
        celestial: 0,
        buddhist: 0,
        underworld: 0
      },
        charactersByFaction: {},
        relationshipCount: 0,
        lastUpdated: new Date().toISOString()
      }
    }

    try {
      for (let i = 0; i < filePaths.length; i++) {
        try {
          const rawData = await loadJsonFile(filePaths[i])
          
          // 跳过别名文件，只处理主角色文件
          if (!rawData.type || rawData.type === 'alias') {
            if (onProgress) {
              onProgress((i + 1) / filePaths.length * 100)
            }
            continue
          }
          
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
        }
      }
      
      // 计算统计信息
      result.stats = calculateDataStats(result.data)
      
      if (result.errors.length > 0) {
        result.success = false
      }
      
    } catch (error) {
      result.success = false
      result.errors.push(`批量加载失败: ${error}`)
      setError(`批量加载失败: ${error}`)
    } finally {
      setIsLoading(false)
    }
    
    return result
  }, [loadJsonFile])

  // 保存角色数据
  const saveCharacterData = useCallback(async (character: CharacterData, filePath: string): Promise<void> => {
    try {
      const jsonData = JSON.stringify(character, null, 2)
      
      // 这里需要调用MCP的write_file工具
      console.log(`保存文件: ${filePath}`)
      console.log('数据:', jsonData)
      
      // 实际实现需要调用MCP工具
      
    } catch (err) {
      const errorMessage = `保存文件失败: ${err}`
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    isLoading,
    error,
    scanJsonFiles,
    loadJsonFile,
    loadMultipleJsonFiles,
    saveCharacterData,
    clearError: () => setError(null)
  }
}

// 验证和转换角色数据
function validateAndTransformCharacterData(rawData: any, filePath: string): CharacterData | null {
  try {
    if (!rawData.id || !rawData.name) {
      throw new Error('缺少必需字段: id 或 name')
    }
    
    const characterData: CharacterData = {
      id: rawData.id,
      name: rawData.name,
      aliases: rawData.aliases || [],
      type: rawData.type || 'human',
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
        lastModified: rawData.metadata?.lastModified || new Date().toISOString(),
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

// 计算数据统计信息
function calculateDataStats(characters: CharacterData[]) {
  const stats = {
    totalCharacters: characters.length,
    charactersByType: {} as Record<string, number>,
    charactersByFaction: {} as Record<string, number>,
    relationshipCount: 0,
    lastUpdated: new Date().toISOString()
  }
  
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
