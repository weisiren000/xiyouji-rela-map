import React from 'react'
import { CharacterDetailScene } from '../three/CharacterDetailScene'
import { CharacterDetailPanel } from './CharacterDetailPanel'
import { DetailViewBackButton } from './DetailViewBackButton'
import ModelGUIManager from './ModelGUIManager'
import { useGalaxyStore } from '@/stores/useGalaxyStore'
import './CharacterDetailView.css'

/**
 * 角色详情视图组件
 * 功能：
 * - 左右分屏布局：左侧3D场景，右侧信息面板
 * - 左上角返回按钮
 * - 响应式设计
 */
export const CharacterDetailView: React.FC = () => {
  const { selectedCharacter } = useGalaxyStore()

  // 如果没有选中角色，不应该渲染此组件
  if (!selectedCharacter) {
    return (
      <div className="character-detail-view">
        <div className="detail-error">
          <h2>错误：未选择角色</h2>
          <p>请返回主视图选择一个角色</p>
        </div>
      </div>
    )
  }

  return (
    <div className="character-detail-view">
      {/* 返回按钮 - 左上角固定定位 */}
      <DetailViewBackButton />
      
      {/* 左侧：3D场景容器 */}
      <div className="detail-scene-container">
        <CharacterDetailScene />
      </div>
      
      {/* 右侧：信息面板容器 */}
      <div className="detail-panel-container">
        <CharacterDetailPanel character={selectedCharacter} />
      </div>

      {/* 模型GUI管理器 - 在Canvas外部 */}
      <ModelGUIManager
        characterName={selectedCharacter.name}
        visible={true}
      />
    </div>
  )
}

export default CharacterDetailView
