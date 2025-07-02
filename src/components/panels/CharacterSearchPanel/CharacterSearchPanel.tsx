/**
 * 角色搜索组件
 * 提供高级角色搜索功能
 */

import React, { useState } from 'react'
import { useCharacterSearch, SearchParams } from '@/hooks/useCharacterSearch'

interface CharacterSearchProps {
  onResultsChange?: (results: any) => void
  className?: string
}

export const CharacterSearch: React.FC<CharacterSearchProps> = ({
  onResultsChange,
  className = ''
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const { 
    isSearching, 
    searchResults, 
    searchError, 
    hasResults,
    searchCharacters, 
    clearResults 
  } = useCharacterSearch()

  const handleSearch = async () => {
    await searchCharacters(searchParams)
    if (onResultsChange && searchResults) {
      onResultsChange(searchResults)
    }
  }

  const handleClear = () => {
    setSearchParams({})
    clearResults()
    if (onResultsChange) {
      onResultsChange(null)
    }
  }

  return (
    <div className={`character-search ${className}`}>
      <div className="search-form">
        <h3>🔍 角色搜索</h3>
        
        {/* 关键词搜索 */}
        <div className="search-field">
          <label>关键词:</label>
          <input
            type="text"
            value={searchParams.q || ''}
            onChange={(e) => setSearchParams(prev => ({ ...prev, q: e.target.value }))}
            placeholder="输入角色名称、别名或描述"
          />
        </div>

        {/* 分类筛选 */}
        <div className="search-field">
          <label>分类:</label>
          <select
            value={searchParams.category || ''}
            onChange={(e) => setSearchParams(prev => ({ ...prev, category: e.target.value || undefined }))}
          >
            <option value="">全部分类</option>
            <option value="主角">主角</option>
            <option value="神仙">神仙</option>
            <option value="妖魔">妖魔</option>
            <option value="佛教">佛教</option>
            <option value="天庭">天庭</option>
            <option value="龙族">龙族</option>
            <option value="地府">地府</option>
            <option value="凡人">凡人</option>
          </select>
        </div>

        {/* 能力值范围 */}
        <div className="search-field">
          <label>能力值范围:</label>
          <div className="range-inputs">
            <input
              type="number"
              min="0"
              max="100"
              value={searchParams.minPower || ''}
              onChange={(e) => setSearchParams(prev => ({ 
                ...prev, 
                minPower: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="最低"
            />
            <span>-</span>
            <input
              type="number"
              min="0"
              max="100"
              value={searchParams.maxPower || ''}
              onChange={(e) => setSearchParams(prev => ({ 
                ...prev, 
                maxPower: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="最高"
            />
          </div>
        </div>

        {/* 搜索按钮 */}
        <div className="search-actions">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="search-btn"
          >
            {isSearching ? '搜索中...' : '搜索'}
          </button>
          <button
            onClick={handleClear}
            className="clear-btn"
          >
            清空
          </button>
        </div>
      </div>

      {/* 搜索结果 */}
      {searchError && (
        <div className="search-error">
          ❌ {searchError}
        </div>
      )}

      {hasResults && searchResults && (
        <div className="search-results">
          <h4>搜索结果 ({searchResults.count} 个角色)</h4>
          <div className="results-list">
            {searchResults.data.map((character) => (
              <div key={character.id} className="character-item">
                <div className="character-name">{character.name}</div>
                <div className="character-info">
                  <span className="category">{character.type}</span>
                  <span className="power">能力: {character.power}</span>
                  {character.aliases && character.aliases.length > 0 && (
                    <span className="aliases">
                      别名: {character.aliases.join(', ')}
                    </span>
                  )}
                </div>
                {character.description && (
                  <div className="character-desc">
                    {character.description.substring(0, 100)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 样式已移至全局CSS */}
    </div>
  )
}
