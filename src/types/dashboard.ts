/**
 * Dashboard界面相关类型定义
 */

import { CharacterData, DataStats, DataFilter, DataSort } from './character'

// Dashboard主界面状态
export interface DashboardState {
  isVisible: boolean
  activeTab: DashboardTab
  isLoading: boolean
  error: string | null
}

export enum DashboardTab {
  DATA_LOADER = 'data_loader',
  DATA_EDITOR = 'data_editor',
  CHARACTER_MAPPER = 'character_mapper',
  DATA_PREVIEW = 'data_preview',
  SETTINGS = 'settings'
}

// 数据加载器
export interface DataLoaderState {
  dataPath: string
  isScanning: boolean
  foundFiles: string[]
  selectedFiles: string[]
  loadProgress: number
  loadedData: CharacterData[]
  stats: DataStats | null
}

// 数据编辑器
export interface DataEditorState {
  selectedCharacter: CharacterData | null
  editingCharacter: CharacterData | null
  hasUnsavedChanges: boolean
  validationErrors: ValidationError[]
  searchQuery: string
  filter: DataFilter
  sort: DataSort
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

// 角色映射器
export interface CharacterMapperState {
  mappingMode: MappingMode
  mappingRules: MappingRule[]
  previewEnabled: boolean
  selectedCharacters: string[]
}

export enum MappingMode {
  IMPORTANCE_BASED = 'importance_based',    // 基于重要性
  TYPE_BASED = 'type_based',               // 基于类型
  FACTION_BASED = 'faction_based',         // 基于势力
  CUSTOM = 'custom'                        // 自定义
}

export interface MappingRule {
  id: string
  name: string
  description: string
  condition: MappingCondition
  action: MappingAction
  enabled: boolean
}

export interface MappingCondition {
  field: keyof CharacterData
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'range'
  value: any
}

export interface MappingAction {
  type: 'position' | 'color' | 'size' | 'emissive'
  value: any
  formula?: string  // 可选的计算公式
}

// 数据预览
export interface DataPreviewState {
  viewMode: PreviewMode
  selectedCharacter: string | null
  showRelationships: boolean
  highlightedRelationships: string[]
}

export enum PreviewMode {
  GALAXY_VIEW = 'galaxy_view',
  LIST_VIEW = 'list_view',
  RELATIONSHIP_VIEW = 'relationship_view',
  STATS_VIEW = 'stats_view'
}

// 文件系统操作
export interface FileSystemOperation {
  type: 'read' | 'write' | 'delete' | 'scan'
  path: string
  data?: any
  options?: FileSystemOptions
}

export interface FileSystemOptions {
  recursive?: boolean
  filter?: string[]
  encoding?: string
}

// Dashboard配置
export interface DashboardConfig {
  dataPath: string
  autoSave: boolean
  autoSaveInterval: number  // 秒
  maxUndoSteps: number
  theme: 'light' | 'dark'
  language: 'zh' | 'en'
}

// 操作历史
export interface OperationHistory {
  operations: DataOperation[]
  currentIndex: number
  maxSize: number
}

export interface DataOperation {
  id: string
  type: 'create' | 'update' | 'delete' | 'batch'
  timestamp: string
  description: string
  data: {
    before?: any
    after?: any
  }
  reversible: boolean
}

// UI组件Props
export interface DashboardProps {
  isVisible: boolean
  onToggle: () => void
  config: DashboardConfig
}

export interface DataLoaderProps {
  state: DataLoaderState
  onPathChange: (path: string) => void
  onScan: () => void
  onLoad: (files: string[]) => void
  onFileSelect: (files: string[]) => void
}

export interface DataEditorProps {
  state: DataEditorState
  onCharacterSelect: (character: CharacterData) => void
  onCharacterUpdate: (character: CharacterData) => void
  onCharacterDelete: (id: string) => void
  onFilterChange: (filter: DataFilter) => void
  onSortChange: (sort: DataSort) => void
}

export interface CharacterMapperProps {
  state: CharacterMapperState
  characters: CharacterData[]
  onMappingModeChange: (mode: MappingMode) => void
  onRuleAdd: (rule: MappingRule) => void
  onRuleUpdate: (rule: MappingRule) => void
  onRuleDelete: (id: string) => void
  onPreviewToggle: (enabled: boolean) => void
}

export interface DataPreviewProps {
  state: DataPreviewState
  characters: CharacterData[]
  onViewModeChange: (mode: PreviewMode) => void
  onCharacterSelect: (id: string) => void
  onRelationshipToggle: (enabled: boolean) => void
}
