import React, { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { CharacterData, CharacterType } from '@/types/character'

/**
 * 数据编辑器组件
 * 负责角色数据的编辑和管理
 */
export const DataEditor: React.FC = () => {
  const {
    characters,
    editor,
    selectCharacter,
    setEditingCharacter,
    updateCharacter,
    deleteCharacter,

    setSort
  } = useDataStore()

  const [searchQuery, setSearchQuery] = useState('')

  // 过滤和排序角色列表
  const filteredCharacters = useMemo(() => {
    let filtered = characters

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(char => 
        char.name.toLowerCase().includes(query) ||
        char.description.toLowerCase().includes(query) ||
        char.faction.toLowerCase().includes(query) ||
        char.aliases?.some(alias => alias.toLowerCase().includes(query))
      )
    }

    // 类型过滤
    if (editor.filter.type && editor.filter.type.length > 0) {
      filtered = filtered.filter(char => 
        editor.filter.type!.includes(char.type)
      )
    }

    // 势力过滤
    if (editor.filter.faction && editor.filter.faction.length > 0) {
      filtered = filtered.filter(char => 
        editor.filter.faction!.includes(char.faction)
      )
    }

    // 排名范围过滤
    if (editor.filter.rankRange) {
      const [min, max] = editor.filter.rankRange
      filtered = filtered.filter(char => 
        char.rank >= min && char.rank <= max
      )
    }

    // 排序
    filtered.sort((a, b) => {
      const field = editor.sort.field
      const direction = editor.sort.direction === 'asc' ? 1 : -1
      
      if (field === 'rank') {
        return (a.rank - b.rank) * direction
      } else if (field === 'name') {
        return a.name.localeCompare(b.name) * direction
      } else if (field === 'type') {
        return a.type.localeCompare(b.type) * direction
      } else if (field === 'faction') {
        return a.faction.localeCompare(b.faction) * direction
      }
      
      return 0
    })

    return filtered
  }, [characters, searchQuery, editor.filter, editor.sort])

  // 处理角色选择
  const handleCharacterSelect = (character: CharacterData) => {
    selectCharacter(character)
    setEditingCharacter({ ...character }) // 创建副本用于编辑
  }

  // 保存编辑
  const handleSave = () => {
    if (editor.editingCharacter) {
      updateCharacter(editor.editingCharacter)
      selectCharacter(editor.editingCharacter)
      setEditingCharacter(null)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    setEditingCharacter(null)
  }

  // 删除角色
  const handleDelete = (character: CharacterData) => {
    if (confirm(`确定要删除角色 "${character.name}" 吗？`)) {
      deleteCharacter(character.id)
      if (editor.selectedCharacter?.id === character.id) {
        selectCharacter(null)
      }
    }
  }

  return (
    <div className="data-editor">
      <h3>✏️ 数据编辑器</h3>
      
      <div className="editor-layout">
        {/* 左侧：角色列表 */}
        <div className="character-list-panel">
          {/* 搜索和过滤 */}
          <div className="list-controls">
            <input
              type="text"
              placeholder="搜索角色..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            
            <div className="filter-controls">
              <select
                value={editor.sort.field}
                onChange={(e) => setSort({ 
                  ...editor.sort, 
                  field: e.target.value as keyof CharacterData 
                })}
                className="sort-select"
              >
                <option value="rank">按排名</option>
                <option value="name">按姓名</option>
                <option value="type">按类型</option>
                <option value="faction">按势力</option>
              </select>
              
              <button
                onClick={() => setSort({ 
                  ...editor.sort, 
                  direction: editor.sort.direction === 'asc' ? 'desc' : 'asc' 
                })}
                className="sort-direction-btn"
              >
                {editor.sort.direction === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* 角色列表 */}
          <div className="character-list">
            {filteredCharacters.map((character) => (
              <div
                key={character.id}
                className={`character-item ${
                  editor.selectedCharacter?.id === character.id ? 'selected' : ''
                }`}
                onClick={() => handleCharacterSelect(character)}
              >
                <div className="character-header">
                  <span className="character-name">{character.name}</span>
                  <span className="character-rank">#{character.rank}</span>
                </div>
                
                <div className="character-meta">
                  <span className="character-type">{character.type}</span>
                  <span className="character-faction">{character.faction}</span>
                </div>
                
                <div className="character-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingCharacter({ ...character })
                    }}
                    className="action-btn edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(character)
                    }}
                    className="action-btn delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="list-footer">
            显示 {filteredCharacters.length} / {characters.length} 个角色
          </div>
        </div>

        {/* 右侧：编辑面板 */}
        <div className="character-edit-panel">
          {editor.editingCharacter ? (
            <CharacterEditForm
              character={editor.editingCharacter}
              onChange={setEditingCharacter}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : editor.selectedCharacter ? (
            <CharacterDetailView character={editor.selectedCharacter} />
          ) : (
            <div className="no-selection">
              <p>请选择一个角色进行查看或编辑</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 角色编辑表单
 */
interface CharacterEditFormProps {
  character: CharacterData
  onChange: (character: CharacterData) => void
  onSave: () => void
  onCancel: () => void
}

const CharacterEditForm: React.FC<CharacterEditFormProps> = ({
  character,
  onChange,
  onSave,
  onCancel
}) => {
  const updateField = (field: keyof CharacterData, value: any) => {
    onChange({ ...character, [field]: value })
  }

  return (
    <div className="character-edit-form">
      <h4>编辑角色: {character.name}</h4>
      
      <div className="form-section">
        <label>角色名称</label>
        <input
          type="text"
          value={character.name}
          onChange={(e) => updateField('name', e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-section">
        <label>角色类型</label>
        <select
          value={character.type}
          onChange={(e) => updateField('type', e.target.value)}
          className="form-select"
        >
          {Object.values(CharacterType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label>所属势力</label>
        <input
          type="text"
          value={character.faction}
          onChange={(e) => updateField('faction', e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-section">
        <label>重要性排名</label>
        <input
          type="number"
          value={character.rank}
          onChange={(e) => updateField('rank', parseInt(e.target.value))}
          className="form-input"
          min="1"
          max="999"
        />
      </div>

      <div className="form-section">
        <label>角色描述</label>
        <textarea
          value={character.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="form-textarea"
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button onClick={onSave} className="form-btn primary">
          💾 保存
        </button>
        <button onClick={onCancel} className="form-btn secondary">
          ❌ 取消
        </button>
      </div>
    </div>
  )
}

/**
 * 角色详情视图
 */
interface CharacterDetailViewProps {
  character: CharacterData
}

const CharacterDetailView: React.FC<CharacterDetailViewProps> = ({ character }) => {
  return (
    <div className="character-detail-view">
      <h4>{character.name}</h4>
      
      <div className="detail-section">
        <strong>基本信息</strong>
        <p>ID: {character.id}</p>
        <p>类型: {character.type}</p>
        <p>势力: {character.faction}</p>
        <p>排名: #{character.rank}</p>
      </div>

      <div className="detail-section">
        <strong>描述</strong>
        <p>{character.description}</p>
      </div>

      {character.aliases && character.aliases.length > 0 && (
        <div className="detail-section">
          <strong>别名</strong>
          <p>{character.aliases.join(', ')}</p>
        </div>
      )}

      {character.abilities && character.abilities.length > 0 && (
        <div className="detail-section">
          <strong>能力技能</strong>
          <ul>
            {character.abilities.map((ability, index) => (
              <li key={index}>{ability}</li>
            ))}
          </ul>
        </div>
      )}

      {character.relationships && character.relationships.length > 0 && (
        <div className="detail-section">
          <strong>关系</strong>
          <ul>
            {character.relationships.map((rel, index) => (
              <li key={index}>
                {rel.type}: {rel.targetId} (强度: {rel.strength})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
