/**
 * 角色搜索Hook
 * 提供角色搜索功能的便捷接口
 */

import { useState, useCallback } from 'react'
import { DataApi } from '@/services/dataApi'
import { CharacterData } from '@/types/character'

export interface SearchParams {
  q?: string           // 搜索关键词
  category?: string    // 角色分类  
  minPower?: number    // 最低能力值
  maxPower?: number    // 最高能力值
}

export interface SearchResult {
  data: CharacterData[]
  count: number
  query: any
}

export const useCharacterSearch = () => {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchCharacters = useCallback(async (params: SearchParams) => {
    if (!params.q && !params.category && params.minPower === undefined && params.maxPower === undefined) {
      setSearchError('请提供至少一个搜索条件')
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const result = await DataApi.searchCharacters(params)
      setSearchResults(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '搜索失败'
      setSearchError(errorMessage)
      setSearchResults(null)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setSearchResults(null)
    setSearchError(null)
  }, [])

  return {
    // 状态
    isSearching,
    searchResults,
    searchError,
    hasResults: searchResults !== null,
    
    // 方法
    searchCharacters,
    clearResults
  }
}

/**
 * 健康检查Hook
 */
export const useHealthCheck = () => {
  const [isChecking, setIsChecking] = useState(false)
  const [healthStatus, setHealthStatus] = useState<{
    status: string
    timestamp: string
    uptime: number
    database: {
      characters: string
      events: string
    }
  } | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)

  const checkHealth = useCallback(async () => {
    setIsChecking(true)
    setHealthError(null)

    try {
      const result = await DataApi.healthCheck()
      setHealthStatus(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '健康检查失败'
      setHealthError(errorMessage)
      setHealthStatus(null)
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    // 状态
    isChecking,
    healthStatus,
    healthError,
    isHealthy: healthStatus?.status === 'healthy',
    
    // 方法
    checkHealth
  }
}
