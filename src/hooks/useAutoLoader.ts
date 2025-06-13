import { useEffect, useCallback, useState } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { DataApi } from '@/services/dataApi'

/**
 * 自动数据加载Hook
 * 在应用启动时自动检查并加载数据
 */
export const useAutoLoader = () => {
  const {
    characters,
    setCharacters,
    setLoading,
    setError,
    setFoundFiles,
    setSelectedFiles,
    setLoadProgress
  } = useDataStore()

  const [isInitialized, setIsInitialized] = useState(false)
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(true)

  // 检查服务器状态
  const checkServerStatus = useCallback(async () => {
    try {
      const status = await DataApi.getServerStatus()
      return status.online
    } catch (error) {
      console.warn('服务器状态检查失败:', error)
      return false
    }
  }, [])

  // 自动加载数据
  const autoLoadData = useCallback(async () => {
    if (!autoLoadEnabled || characters.length > 0) {
      return // 如果已有数据或禁用自动加载，则跳过
    }

    setLoading(true)
    setError(null)
    setLoadProgress(0)

    try {
      console.log('🔄 开始自动加载数据...')
      
      // 检查服务器连接
      setLoadProgress(10)
      const isServerOnline = await checkServerStatus()
      
      if (!isServerOnline) {
        console.warn('⚠️ 服务器离线，跳过自动加载')
        setError('数据服务器离线，请手动启动服务器后重新加载')
        return
      }

      // 模拟扫描文件
      setLoadProgress(20)
      const mockFiles = [
        'character_c0001_sunwukong.json',
        'character_c0002_tangseng.json', 
        'character_c0003_zhubajie.json',
        'character_c0004_shaheshang.json',
        'character_c0005_xiaobailong.json'
      ]
      setFoundFiles(mockFiles)
      setSelectedFiles(mockFiles)

      // 加载完整数据
      setLoadProgress(40)
      console.log('📡 正在从服务器获取数据...')
      
      const completeData = await DataApi.getCompleteData()
      setLoadProgress(80)

      // 设置数据
      setCharacters(completeData.characters)
      setLoadProgress(100)

      console.log(`✅ 自动加载完成！`)
      console.log(`📊 加载了 ${completeData.characters.length} 个角色`)
      console.log(`🏷️ 加载了 ${completeData.aliases.length} 个别名`)

    } catch (error) {
      console.error('❌ 自动加载失败:', error)
      setError(`自动加载失败: ${error}`)
    } finally {
      setLoading(false)
      setIsInitialized(true)
      setTimeout(() => setLoadProgress(0), 1000)
    }
  }, [
    autoLoadEnabled,
    characters.length,
    setLoading,
    setError,
    setLoadProgress,
    setFoundFiles,
    setSelectedFiles,
    setCharacters,
    checkServerStatus
  ])

  // 手动重新加载
  const manualReload = useCallback(async () => {
    setIsInitialized(false)
    await autoLoadData()
  }, [autoLoadData])

  // 启用/禁用自动加载
  const toggleAutoLoad = useCallback((enabled: boolean) => {
    setAutoLoadEnabled(enabled)
    localStorage.setItem('autoLoadEnabled', JSON.stringify(enabled))
  }, [])

  // 初始化时从localStorage读取设置
  useEffect(() => {
    const saved = localStorage.getItem('autoLoadEnabled')
    if (saved !== null) {
      setAutoLoadEnabled(JSON.parse(saved))
    }
  }, [])

  // 应用启动时自动加载
  useEffect(() => {
    if (!isInitialized && autoLoadEnabled) {
      // 延迟一点时间，确保组件完全挂载
      const timer = setTimeout(() => {
        autoLoadData()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isInitialized, autoLoadEnabled, autoLoadData])

  return {
    isInitialized,
    autoLoadEnabled,
    toggleAutoLoad,
    manualReload,
    checkServerStatus
  }
}

/**
 * 数据加载状态Hook
 * 提供加载状态的便捷访问
 */
export const useLoadingStatus = () => {
  const { dashboard, loader, characters, stats } = useDataStore()

  return {
    isLoading: dashboard.isLoading,
    hasError: !!dashboard.error,
    error: dashboard.error,
    loadProgress: loader.loadProgress,
    hasData: characters.length > 0,
    dataCount: characters.length,
    stats
  }
}

/**
 * 服务器连接状态Hook
 */
export const useServerConnection = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkConnection = useCallback(async () => {
    try {
      const online = await DataApi.checkConnection()
      setIsOnline(online)
      setLastCheck(new Date())
      return online
    } catch (error) {
      setIsOnline(false)
      setLastCheck(new Date())
      return false
    }
  }, [])

  // 定期检查连接状态
  useEffect(() => {
    checkConnection()
    
    const interval = setInterval(checkConnection, 30000) // 每30秒检查一次
    return () => clearInterval(interval)
  }, [checkConnection])

  return {
    isOnline,
    lastCheck,
    checkConnection
  }
}
