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
                  <span className="category">{character.category}</span>
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

      <style jsx>{`
        .character-search {
          background: rgba(0, 0, 0, 0.8);
          padding: 20px;
          border-radius: 8px;
          margin: 10px;
          color: white;
        }

        .search-form h3 {
          margin: 0 0 15px 0;
          color: #FFD700;
        }

        .search-field {
          margin-bottom: 15px;
        }

        .search-field label {
          display: block;
          margin-bottom: 5px;
          color: #ccc;
        }

        .search-field input,
        .search-field select {
          width: 100%;
          padding: 8px;
          border: 1px solid #555;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .range-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .range-inputs input {
          width: 80px;
        }

        .search-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .search-btn,
        .clear-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .search-btn {
          background: #4CAF50;
          color: white;
        }

        .search-btn:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .clear-btn {
          background: #f44336;
          color: white;
        }

        .search-error {
          color: #ff6b6b;
          margin-top: 15px;
          padding: 10px;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 4px;
        }

        .search-results {
          margin-top: 20px;
        }

        .search-results h4 {
          color: #FFD700;
          margin-bottom: 15px;
        }

        .results-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .character-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 4px;
          border-left: 3px solid #FFD700;
        }

        .character-name {
          font-size: 16px;
          font-weight: bold;
          color: #FFD700;
          margin-bottom: 8px;
        }

        .character-info {
          display: flex;
          gap: 15px;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .character-info span {
          color: #ccc;
        }

        .category {
          background: rgba(76, 175, 80, 0.3);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .power {
          background: rgba(255, 193, 7, 0.3);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .character-desc {
          font-size: 12px;
          color: #aaa;
          line-height: 1.4;
        }
      `}</style>
    </div>
  )
}
