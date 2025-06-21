import React from 'react'
import { useDataStore } from '@/stores/useDataStore'

/**
 * 角色映射器组件
 * 负责将角色数据映射到3D银河系中
 */
export const CharacterMapper: React.FC = () => {
  const { characters, mapper } = useDataStore()

  return (
    <div className="character-mapper">
      <h3>🎯 角色映射器</h3>
      
      <div className="mapper-content">
        <p>角色映射功能正在开发中...</p>
        <p>当前角色数量: {characters.length}</p>
        <p>映射模式: {mapper.mappingMode}</p>
      </div>
    </div>
  )
}
