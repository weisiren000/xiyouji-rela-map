import { useState, useEffect, useMemo } from 'react'
import { useDataStore } from '../stores/useDataStore'
import { CharacterData } from '../types/character'

interface ModelCharacter extends CharacterData {
  modelPath: string
  matchType: 'name' | 'pinyin' | 'alias' | 'none'
  matchedValue: string | null
  confidence: number
}

/**
 * 批量模型检测Hook
 * 功能：
 * - 批量检测所有角色的模型匹配状态
 * - 提供已加载模型的角色列表
 * - 支持多种匹配策略
 * - 缓存检测结果提高性能
 */
export const useBatchModelDetection = () => {
  const [checking, setChecking] = useState(true)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const { characters } = useDataStore()

  // 获取可用的模型文件列表 - 动态检测
  useEffect(() => {
    const detectAvailableModels = async () => {
      try {
        console.log('🔍 开始动态检测模型文件...')

        // 方法1: 尝试从索引文件加载
        try {
          const response = await fetch('/models/index.json')
          if (response.ok) {
            const indexData = await response.json()
            if (indexData.models && Array.isArray(indexData.models)) {
              setAvailableModels(indexData.models)
              console.log('✅ 从索引文件加载模型:', indexData.models)
              console.log(`📊 索引信息: ${indexData.count} 个模型, 更新时间: ${indexData.lastUpdated}`)
              return
            }
          }
        } catch (indexError) {
          console.warn('⚠️ 无法加载模型索引文件，尝试备用方案')
        }

        // 方法2: 备用硬编码列表（向后兼容）
        const fallbackModels = [
          '唐僧.glb',
          '太上老君.glb',
          '如来佛祖.glb',
          '孙悟空.glb',
          '沙僧.glb',
          '牛魔王.glb',
          '猪八戒.glb',
          '白龙马.glb',
          '观音菩萨.glb'
        ]

        // 验证模型文件是否真实存在
        const verifiedModels = []
        for (const model of fallbackModels) {
          try {
            const testResponse = await fetch(`/models/${model}`, { method: 'HEAD' })
            if (testResponse.ok) {
              verifiedModels.push(model)
            }
          } catch (error) {
            console.warn(`⚠️ 模型文件不存在或无法访问: ${model}`)
          }
        }

        setAvailableModels(verifiedModels)
        console.log('✅ 备用方案检测到可用模型:', verifiedModels)

      } catch (error) {
        console.error('❌ 动态检测模型文件失败:', error)
        setAvailableModels([])
      }
    }

    detectAvailableModels()
  }, [])

  // 智能匹配算法 - 批量处理
  const charactersWithModels = useMemo((): ModelCharacter[] => {
    if (availableModels.length === 0 || characters.length === 0) {
      return []
    }

    const results: ModelCharacter[] = []

    characters.forEach(character => {
      const matchResult = matchCharacterToModel(character, availableModels)
      
      if (matchResult.exists) {
        results.push({
          ...character,
          modelPath: matchResult.modelPath!,
          matchType: matchResult.matchType,
          matchedValue: matchResult.matchedValue,
          confidence: matchResult.confidence
        })
      }
    })

    console.log(`🎯 批量检测完成: 找到 ${results.length} 个有模型的角色`)
    return results
  }, [characters, availableModels])

  // 完成检查
  useEffect(() => {
    if (availableModels.length > 0 && characters.length > 0) {
      setChecking(false)
    }
  }, [availableModels, characters])

  return {
    checking,
    availableModels,
    charactersWithModels,
    totalCharacters: characters.length,
    modelCount: charactersWithModels.length
  }
}

/**
 * 单个角色模型匹配函数
 */
function matchCharacterToModel(
  character: CharacterData, 
  availableModels: string[]
): {
  exists: boolean
  modelPath: string | null
  matchType: 'name' | 'pinyin' | 'alias' | 'none'
  matchedValue: string | null
  confidence: number
} {
  // 匹配策略1: 直接名称匹配
  const nameMatches = availableModels.filter(model => {
    const modelName = model.replace('.glb', '')
    return modelName === character.name
  })

  if (nameMatches.length > 0) {
    const modelPath = `/models/${nameMatches[0]}`
    return {
      exists: true,
      modelPath,
      matchType: 'name',
      matchedValue: character.name,
      confidence: 1.0
    }
  }

  // 匹配策略2: 拼音匹配
  if (character.pinyin) {
    const pinyinMatches = availableModels.filter(model => {
      const modelName = model.replace('.glb', '')
      return modelName === character.pinyin
    })

    if (pinyinMatches.length > 0) {
      const modelPath = `/models/${pinyinMatches[0]}`
      return {
        exists: true,
        modelPath,
        matchType: 'pinyin',
        matchedValue: character.pinyin,
        confidence: 0.9
      }
    }
  }

  // 匹配策略3: 别名匹配
  if (character.aliases && character.aliases.length > 0) {
    for (const alias of character.aliases) {
      const aliasMatches = availableModels.filter(model => {
        const modelName = model.replace('.glb', '')
        return modelName === alias
      })

      if (aliasMatches.length > 0) {
        const modelPath = `/models/${aliasMatches[0]}`
        return {
          exists: true,
          modelPath,
          matchType: 'alias',
          matchedValue: alias,
          confidence: 0.8
        }
      }
    }
  }

  // 匹配策略4: 模糊匹配（可选）
  // 这里可以添加更复杂的模糊匹配逻辑，比如：
  // - 去除特殊字符后匹配
  // - 部分字符串匹配
  // - 同音字匹配等

  return {
    exists: false,
    modelPath: null,
    matchType: 'none',
    matchedValue: null,
    confidence: 0
  }
}

export default useBatchModelDetection
