import { create } from 'zustand'
import { CharacterData, DataStats, DataFilter, DataSort, CharacterMapping } from '@/types/character'
import { DashboardState, DashboardTab, DataLoaderState, DataEditorState, CharacterMapperState, DataPreviewState, DashboardConfig, MappingMode, PreviewMode } from '@/types/dashboard'

/**
 * 数据管理状态存储
 */
interface DataState {
  // Dashboard状态
  dashboard: DashboardState
  config: DashboardConfig
  
  // 数据状态
  characters: CharacterData[]
  mappings: CharacterMapping[]
  stats: DataStats | null
  
  // 子模块状态
  loader: DataLoaderState
  editor: DataEditorState
  mapper: CharacterMapperState
  preview: DataPreviewState
  
  // 操作方法
  // Dashboard控制
  setDashboardVisible: (visible: boolean) => void
  setActiveTab: (tab: DashboardTab) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // 数据操作
  setCharacters: (characters: CharacterData[]) => void
  addCharacter: (character: CharacterData) => void
  updateCharacter: (character: CharacterData) => void
  deleteCharacter: (id: string) => void
  
  // 映射操作
  setMappings: (mappings: CharacterMapping[]) => void
  updateMapping: (mapping: CharacterMapping) => void
  
  // 数据加载器
  setDataPath: (path: string) => void
  setFoundFiles: (files: string[]) => void
  setSelectedFiles: (files: string[]) => void
  setLoadProgress: (progress: number) => void
  
  // 数据编辑器
  selectCharacter: (character: CharacterData | null) => void
  setEditingCharacter: (character: CharacterData | null) => void
  setFilter: (filter: DataFilter) => void
  setSort: (sort: DataSort) => void
  
  // 角色映射器
  setMappingMode: (mode: string) => void
  setPreviewEnabled: (enabled: boolean) => void
  
  // 数据预览
  setViewMode: (mode: string) => void
  setSelectedCharacterPreview: (id: string | null) => void
  setShowRelationships: (show: boolean) => void
  
  // 配置
  updateConfig: (config: Partial<DashboardConfig>) => void
}

export const useDataStore = create<DataState>((set) => ({
  // 初始状态
  dashboard: {
    isVisible: false,
    activeTab: DashboardTab.DATA_LOADER,
    isLoading: false,
    error: null
  },
  
  config: {
    dataPath: 'D:\\codee\\xiyouji-rela-map\\docs\\data\\JSON',
    autoSave: true,
    autoSaveInterval: 30,
    maxUndoSteps: 50,
    theme: 'dark',
    language: 'zh'
  },
  
  characters: [],
  mappings: [],
  stats: null,
  
  loader: {
    dataPath: 'D:\\codee\\xiyouji-rela-map\\docs\\data\\JSON',
    isScanning: false,
    foundFiles: [],
    selectedFiles: [],
    loadProgress: 0,
    loadedData: [],
    stats: null
  },
  
  editor: {
    selectedCharacter: null,
    editingCharacter: null,
    hasUnsavedChanges: false,
    validationErrors: [],
    searchQuery: '',
    filter: {},
    sort: { field: 'rank', direction: 'asc' }
  },
  
  mapper: {
    mappingMode: MappingMode.IMPORTANCE_BASED,
    mappingRules: [],
    previewEnabled: true,
    selectedCharacters: []
  },

  preview: {
    viewMode: PreviewMode.GALAXY_VIEW,
    selectedCharacter: null,
    showRelationships: true,
    highlightedRelationships: []
  },
  
  // Dashboard控制方法
  setDashboardVisible: (visible) =>
    set((state) => ({
      dashboard: { ...state.dashboard, isVisible: visible }
    })),
    
  setActiveTab: (tab) =>
    set((state) => ({
      dashboard: { ...state.dashboard, activeTab: tab }
    })),
    
  setLoading: (loading) =>
    set((state) => ({
      dashboard: { ...state.dashboard, isLoading: loading }
    })),
    
  setError: (error) =>
    set((state) => ({
      dashboard: { ...state.dashboard, error }
    })),
  
  // 数据操作方法
  setCharacters: (characters) => {
    const stats: DataStats = {
      totalCharacters: characters.length,
      charactersByType: characters.reduce((acc, char) => {
        acc[char.type] = (acc[char.type] || 0) + 1
        return acc
      }, {} as any),
      charactersByFaction: characters.reduce((acc, char) => {
        acc[char.faction] = (acc[char.faction] || 0) + 1
        return acc
      }, {} as any),
      relationshipCount: characters.reduce((acc, char) => 
        acc + (char.relationships?.length || 0), 0),
      lastUpdated: new Date().toISOString()
    }
    
    set({ characters, stats })
  },
  
  addCharacter: (character) =>
    set((state) => {
      const newCharacters = [...state.characters, character]
      return { characters: newCharacters }
    }),
    
  updateCharacter: (character) =>
    set((state) => ({
      characters: state.characters.map(c => 
        c.id === character.id ? character : c
      )
    })),
    
  deleteCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter(c => c.id !== id)
    })),
  
  // 映射操作方法
  setMappings: (mappings) => set({ mappings }),
  
  updateMapping: (mapping) =>
    set((state) => ({
      mappings: state.mappings.map(m => 
        m.characterId === mapping.characterId ? mapping : m
      )
    })),
  
  // 数据加载器方法
  setDataPath: (path) =>
    set((state) => ({
      loader: { ...state.loader, dataPath: path },
      config: { ...state.config, dataPath: path }
    })),
    
  setFoundFiles: (files) =>
    set((state) => ({
      loader: { ...state.loader, foundFiles: files }
    })),
    
  setSelectedFiles: (files) =>
    set((state) => ({
      loader: { ...state.loader, selectedFiles: files }
    })),
    
  setLoadProgress: (progress) =>
    set((state) => ({
      loader: { ...state.loader, loadProgress: progress }
    })),
  
  // 数据编辑器方法
  selectCharacter: (character) =>
    set((state) => ({
      editor: { ...state.editor, selectedCharacter: character }
    })),
    
  setEditingCharacter: (character) =>
    set((state) => ({
      editor: { ...state.editor, editingCharacter: character }
    })),
    
  setFilter: (filter) =>
    set((state) => ({
      editor: { ...state.editor, filter }
    })),
    
  setSort: (sort) =>
    set((state) => ({
      editor: { ...state.editor, sort }
    })),
  
  // 角色映射器方法
  setMappingMode: (mode) =>
    set((state) => ({
      mapper: { ...state.mapper, mappingMode: mode as MappingMode }
    })),
    
  setPreviewEnabled: (enabled) =>
    set((state) => ({
      mapper: { ...state.mapper, previewEnabled: enabled }
    })),
  
  // 数据预览方法
  setViewMode: (mode) =>
    set((state) => ({
      preview: { ...state.preview, viewMode: mode as PreviewMode }
    })),
    
  setSelectedCharacterPreview: (id) =>
    set((state) => ({
      preview: { ...state.preview, selectedCharacter: id }
    })),
    
  setShowRelationships: (show) =>
    set((state) => ({
      preview: { ...state.preview, showRelationships: show }
    })),
  
  // 配置方法
  updateConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config }
    }))
}))
