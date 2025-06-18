import React, { useState, useEffect } from 'react'
import { DataApi } from '@/services/dataApi'

/**
 * 端口状态指示器组件
 * 显示当前后端服务器的连接状态和端口信息
 */

interface PortStatusIndicatorProps {
  className?: string
}

export const PortStatusIndicator: React.FC<PortStatusIndicatorProps> = ({
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [currentPort, setCurrentPort] = useState<number | null>(null)
  const [apiUrl, setApiUrl] = useState<string>('')
  const [isChecking, setIsChecking] = useState(false)

  /**
   * 检查连接状态
   */
  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const connected = await DataApi.checkConnection()
      setIsConnected(connected)
      setCurrentPort(DataApi.getDetectedPort())
      setApiUrl(DataApi.getCurrentApiUrl())
      
      if (connected) {
        console.log(`✅ 后端连接正常 - 端口: ${DataApi.getDetectedPort()}`)
      } else {
        console.warn('⚠️ 后端连接失败')
      }
    } catch (error) {
      console.error('❌ 连接检查失败:', error)
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  // 组件挂载时检查连接
  useEffect(() => {
    checkConnection()
    
    // 定期检查连接状态（每30秒）
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [])

  /**
   * 获取状态显示信息
   */
  const getStatusInfo = () => {
    if (isChecking) {
      return {
        icon: '🔍',
        text: '检测中...',
        color: '#ffa500',
        detail: '正在检测后端服务器'
      }
    }
    
    if (isConnected === null) {
      return {
        icon: '❓',
        text: '未知',
        color: '#666666',
        detail: '连接状态未知'
      }
    }
    
    if (isConnected) {
      return {
        icon: '✅',
        text: `端口 ${currentPort}`,
        color: '#00ff00',
        detail: `后端服务正常 - ${apiUrl}`
      }
    }
    
    return {
      icon: '❌',
      text: '连接失败',
      color: '#ff0000',
      detail: '后端服务器不可用，请检查服务器是否启动'
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div 
      className={`port-status-indicator ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: `1px solid ${statusInfo.color}`,
        color: statusInfo.color,
        fontSize: '12px',
        fontFamily: 'monospace',
        cursor: 'pointer'
      }}
      onClick={checkConnection}
      title={`${statusInfo.detail}\n点击重新检测`}
    >
      <span style={{ fontSize: '14px' }}>{statusInfo.icon}</span>
      <span>{statusInfo.text}</span>
      {isChecking && (
        <span 
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid transparent',
            borderTop: `2px solid ${statusInfo.color}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * 端口状态面板组件
 * 提供更详细的端口信息和手动配置选项
 */
interface PortStatusPanelProps {
  isExpanded?: boolean
  onToggle?: () => void
}

export const PortStatusPanel: React.FC<PortStatusPanelProps> = ({
  isExpanded = false,
  onToggle
}) => {
  const [customPort, setCustomPort] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [currentPort, setCurrentPort] = useState<number | null>(null)

  /**
   * 手动设置端口
   */
  const handleSetCustomPort = async () => {
    const port = parseInt(customPort)
    if (isNaN(port) || port < 1 || port > 65535) {
      alert('请输入有效的端口号 (1-65535)')
      return
    }

    try {
      DataApi.setApiPort(port)
      const connected = await DataApi.checkConnection()
      setIsConnected(connected)
      setCurrentPort(DataApi.getDetectedPort())
      
      if (connected) {
        alert(`✅ 成功连接到端口 ${port}`)
        setCustomPort('')
      } else {
        alert(`❌ 无法连接到端口 ${port}`)
      }
    } catch (error) {
      alert(`❌ 连接失败: ${error}`)
    }
  }

  /**
   * 自动检测端口
   */
  const handleAutoDetect = async () => {
    try {
      const connected = await DataApi.checkConnection()
      setIsConnected(connected)
      setCurrentPort(DataApi.getDetectedPort())
      
      if (connected) {
        alert(`✅ 自动检测成功，使用端口 ${DataApi.getDetectedPort()}`)
      } else {
        alert('❌ 自动检测失败，未找到可用的后端服务')
      }
    } catch (error) {
      alert(`❌ 自动检测失败: ${error}`)
    }
  }

  if (!isExpanded) {
    return (
      <div 
        style={{
          padding: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={onToggle}
      >
        <PortStatusIndicator />
        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#ccc' }}>
          点击展开端口设置
        </span>
      </div>
    )
  }

  return (
    <div 
      style={{
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '8px',
        border: '1px solid #333'
      }}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          cursor: 'pointer'
        }}
        onClick={onToggle}
      >
        <h4 style={{ margin: 0, color: '#fff' }}>🔌 端口配置</h4>
        <span style={{ color: '#ccc' }}>▲</span>
      </div>

      <PortStatusIndicator className="mb-3" />

      <div style={{ marginTop: '12px' }}>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ color: '#ccc', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
            手动设置端口:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              value={customPort}
              onChange={(e) => setCustomPort(e.target.value)}
              placeholder="例如: 3003"
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #555',
                backgroundColor: '#222',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <button
              onClick={handleSetCustomPort}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: '1px solid #555',
                backgroundColor: '#333',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              连接
            </button>
          </div>
        </div>

        <button
          onClick={handleAutoDetect}
          style={{
            width: '100%',
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #555',
            backgroundColor: '#444',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🔍 自动检测端口
        </button>
      </div>
    </div>
  )
}
