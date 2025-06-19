import { useState, useEffect, useMemo } from 'react'
import { useDataStore } from '../stores/useDataStore'

interface ModelMatchResult {
  exists: boolean
  modelPath: string | null
  matchType: 'name' | 'pinyin' | 'alias' | 'none'
  matchedValue: string | null
  confidence: number
}

/**
 * 智能模型检测Hook
 * 功能：
 * - 根据已加载的JSON角色数据动态匹配模型文件
 * - 支持多种匹配策略：name、pinyin、aliases
 * - 自动检测public/models目录中的可用模型
 * - 提供匹配置信度和详细信息
 */
export const useSmartModelDetection = (characterName: string) => {
  const [checking, setChecking] = useState(true)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const { characters } = useDataStore()

  // 获取可用的模型文件列表 - 动态检测
  useEffect(() => {
    const detectAvailableModels = async () => {
      try {
        console.log('🔍 开始动态检测模型文件...')

        // 尝试从索引文件加载
        try {
          const response = await fetch('/models/index.json')
          if (response.ok) {
            const indexData = await response.json()
            if (indexData.models && Array.isArray(indexData.models)) {
              setAvailableModels(indexData.models)
              console.log('✅ 从索引文件加载模型:', indexData.models)
              return
            }
          }
        } catch (indexError) {
          console.warn('⚠️ 无法加载模型索引文件，使用备用方案')
        }

        // 备用方案：硬编码列表
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

        setAvailableModels(fallbackModels)
        console.log('✅ 使用备用模型列表:', fallbackModels)
      } catch (error) {
        console.error('❌ 检测模型文件失败:', error)
        setAvailableModels([])
      }
    }

    detectAvailableModels()
  }, [])

  // 智能匹配算法
  const matchResult = useMemo((): ModelMatchResult => {
    if (!characterName || availableModels.length === 0 || characters.length === 0) {
      return {
        exists: false,
        modelPath: null,
        matchType: 'none',
        matchedValue: null,
        confidence: 0
      }
    }

    // 查找对应的角色数据
    const characterData = characters.find(char => 
      char.name === characterName || 
      char.pinyin === characterName ||
      char.id === characterName
    )

    if (!characterData) {
      console.warn(`⚠️ 未找到角色数据: ${characterName}`)
      return {
        exists: false,
        modelPath: null,
        matchType: 'none',
        matchedValue: null,
        confidence: 0
      }
    }

    console.log('🔍 正在匹配角色:', {
      name: characterData.name,
      pinyin: characterData.pinyin,
      aliases: characterData.aliases
    })

    // 匹配策略1: 直接名称匹配
    const nameMatches = availableModels.filter(model => {
      const modelName = model.replace('.glb', '')
      return modelName === characterData.name
    })

    if (nameMatches.length > 0) {
      const modelPath = `/models/${nameMatches[0]}`
      console.log(`✅ 名称匹配成功: ${characterData.name} -> ${modelPath}`)
      return {
        exists: true,
        modelPath,
        matchType: 'name',
        matchedValue: characterData.name,
        confidence: 1.0
      }
    }

    // 匹配策略2: 拼音匹配
    if (characterData.pinyin) {
      const pinyinMatches = availableModels.filter(model => {
        const modelName = model.replace('.glb', '')
        return modelName === characterData.pinyin
      })

      if (pinyinMatches.length > 0) {
        const modelPath = `/models/${pinyinMatches[0]}`
        console.log(`✅ 拼音匹配成功: ${characterData.pinyin} -> ${modelPath}`)
        return {
          exists: true,
          modelPath,
          matchType: 'pinyin',
          matchedValue: characterData.pinyin,
          confidence: 0.9
        }
      }
    }

    // 匹配策略3: 别名匹配
    if (characterData.aliases && characterData.aliases.length > 0) {
      for (const alias of characterData.aliases) {
        const aliasMatches = availableModels.filter(model => {
          const modelName = model.replace('.glb', '')
          return modelName === alias
        })

        if (aliasMatches.length > 0) {
          const modelPath = `/models/${aliasMatches[0]}`
          console.log(`✅ 别名匹配成功: ${alias} -> ${modelPath}`)
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
    // 这里可以添加更复杂的模糊匹配逻辑

    console.log(`❌ 未找到匹配的模型: ${characterName}`)
    return {
      exists: false,
      modelPath: null,
      matchType: 'none',
      matchedValue: null,
      confidence: 0
    }
  }, [characterName, availableModels, characters])

  // 完成检查
  useEffect(() => {
    if (availableModels.length > 0 && characters.length > 0) {
      setChecking(false)
    }
  }, [availableModels, characters])

  return {
    ...matchResult,
    checking,
    availableModels,
    characterData: characters.find(char => 
      char.name === characterName || 
      char.pinyin === characterName ||
      char.id === characterName
    )
  }
}

/**
 * 扩展模型检测Hook（向后兼容）
 */
export const useModelExists = (characterName: string) => {
  const smartResult = useSmartModelDetection(characterName)
  
  return {
    exists: smartResult.exists,
    checking: smartResult.checking,
    modelPath: smartResult.modelPath,
    matchInfo: {
      type: smartResult.matchType,
      value: smartResult.matchedValue,
      confidence: smartResult.confidence
    }
  }
}

export default useSmartModelDetection
