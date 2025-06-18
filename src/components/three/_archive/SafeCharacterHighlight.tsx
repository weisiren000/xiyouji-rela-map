import React, { Component, ReactNode } from 'react'
import { CharacterHighlight } from './CharacterHighlight'
import { Vector3 } from 'three'

interface SafeCharacterHighlightProps {
  position: Vector3 | null
  size: number
  color: string
  visible: boolean
}

interface SafeCharacterHighlightState {
  hasError: boolean
  errorCount: number
}

/**
 * 安全的角色高亮组件包装器
 * 提供错误边界保护，防止高亮效果导致整个应用崩溃
 */
export class SafeCharacterHighlight extends Component<
  SafeCharacterHighlightProps,
  SafeCharacterHighlightState
> {
  private errorResetTimer: NodeJS.Timeout | null = null

  constructor(props: SafeCharacterHighlightProps) {
    super(props)
    this.state = {
      hasError: false,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): SafeCharacterHighlightState {
    console.error('CharacterHighlight error caught by boundary:', error)
    return {
      hasError: true,
      errorCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CharacterHighlight error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })

    // 增加错误计数
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }))

    // 如果错误次数过多，禁用高亮效果
    if (this.state.errorCount >= 3) {
      console.warn('CharacterHighlight disabled due to repeated errors')
      return
    }

    // 3秒后尝试重置错误状态
    if (this.errorResetTimer) {
      clearTimeout(this.errorResetTimer)
    }
    
    this.errorResetTimer = setTimeout(() => {
      console.log('Attempting to reset CharacterHighlight error state')
      this.setState({
        hasError: false
      })
    }, 3000)
  }

  componentWillUnmount() {
    if (this.errorResetTimer) {
      clearTimeout(this.errorResetTimer)
    }
  }

  render(): ReactNode {
    const { hasError, errorCount } = this.state
    const { position, size, color, visible } = this.props

    // 如果错误次数过多，不渲染高亮效果
    if (errorCount >= 3) {
      return null
    }

    // 如果有错误，显示简化的高亮效果
    if (hasError) {
      return (
        <mesh position={position || undefined}>
          <sphereGeometry args={[size * 1.2, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent={true}
            opacity={0.3}
            wireframe={true}
          />
        </mesh>
      )
    }

    // 正常渲染
    try {
      return (
        <CharacterHighlight
          position={position}
          size={size}
          color={color}
          visible={visible}
        />
      )
    } catch (error) {
      console.error('Error rendering CharacterHighlight:', error)
      return null
    }
  }
}

/**
 * 函数式组件包装器，提供更简单的使用方式
 */
export const SafeCharacterHighlightWrapper: React.FC<SafeCharacterHighlightProps> = (props) => {
  return <SafeCharacterHighlight {...props} />
}
