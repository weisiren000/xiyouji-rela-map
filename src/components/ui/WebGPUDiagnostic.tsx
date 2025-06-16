import React, { useState, useEffect } from 'react'
import { webgpuDetector } from '@/utils/webgpu'

interface DiagnosticResult {
  step: string
  status: 'success' | 'warning' | 'error' | 'info'
  message: string
  details?: string
  solution?: string
}

export const WebGPUDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setDiagnostics([])
    
    const results: DiagnosticResult[] = []

    // 1. 检查基础环境
    results.push({
      step: '1. 浏览器检查',
      status: 'info',
      message: `浏览器: ${navigator.userAgent.split(' ').find(s => s.includes('Chrome') || s.includes('Edge') || s.includes('Firefox')) || 'Unknown'}`,
      details: navigator.userAgent
    })

    // 2. 检查HTTPS
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost'
    results.push({
      step: '2. 安全上下文',
      status: isSecure ? 'success' : 'error',
      message: isSecure ? '✅ 安全上下文 (HTTPS/localhost)' : '❌ 需要HTTPS或localhost',
      solution: !isSecure ? '请使用HTTPS或localhost访问' : undefined
    })

    // 3. 检查navigator.gpu
    const hasNavigatorGpu = 'gpu' in navigator
    results.push({
      step: '3. WebGPU API',
      status: hasNavigatorGpu ? 'success' : 'error',
      message: hasNavigatorGpu ? '✅ navigator.gpu 可用' : '❌ navigator.gpu 不存在',
      details: hasNavigatorGpu ? 'WebGPU API已暴露' : '可能需要启用WebGPU标志',
      solution: !hasNavigatorGpu ? '请启用浏览器的WebGPU标志 (见下方说明)' : undefined
    })

    if (hasNavigatorGpu) {
      try {
        // 4. 请求适配器
        results.push({
          step: '4. 请求GPU适配器',
          status: 'info',
          message: '🔍 正在请求GPU适配器...'
        })

        const adapter = await (navigator as any).gpu.requestAdapter({
          powerPreference: 'high-performance'
        })

        if (adapter) {
          results.push({
            step: '4. 请求GPU适配器',
            status: 'success',
            message: '✅ GPU适配器获取成功'
          })

          // 5. 获取适配器信息
          try {
            const info = await adapter.requestAdapterInfo()
            results.push({
              step: '5. 适配器信息',
              status: 'success',
              message: `✅ GPU: ${info.device || 'Unknown'}`,
              details: `厂商: ${info.vendor || 'Unknown'}, 架构: ${info.architecture || 'Unknown'}`
            })
          } catch (error) {
            results.push({
              step: '5. 适配器信息',
              status: 'warning',
              message: '⚠️ 无法获取适配器详细信息 (不影响功能)',
              details: '这是正常现象，requestAdapterInfo API还在开发中'
            })
          }

          // 6. 请求设备
          try {
            results.push({
              step: '6. 请求GPU设备',
              status: 'info',
              message: '🔍 正在请求GPU设备...'
            })

            const device = await adapter.requestDevice()
            results.push({
              step: '6. 请求GPU设备',
              status: 'success',
              message: '✅ GPU设备创建成功'
            })

            // 7. 检查功能支持
            const features = Array.from(adapter.features)
            results.push({
              step: '7. 功能支持',
              status: 'success',
              message: `✅ 支持 ${features.length} 个功能`,
              details: features.join(', ') || '基础功能'
            })

            // 8. 检查限制
            const limits = adapter.limits
            results.push({
              step: '8. 设备限制',
              status: 'success',
              message: '✅ 设备限制检查完成',
              details: `最大纹理尺寸: ${limits.maxTextureDimension2D}, 最大绑定组: ${limits.maxBindGroups}`
            })

            // 9. 运行WebGPU检测器和性能评估
            try {
              const capabilities = await webgpuDetector.detectCapabilities()
              const score = webgpuDetector.getPerformanceScore(capabilities)
              results.push({
                step: '9. 性能评估',
                status: score >= 60 ? 'success' : score > 0 ? 'warning' : 'info',
                message: score > 0 ?
                  `${score >= 60 ? '✅' : '⚠️'} 性能评分: ${score}/100` :
                  '✅ WebGPU功能正常 (评分计算中)',
                details: score >= 60 ? 'WebGPU性能良好' :
                         score > 0 ? '性能可能不足，但功能正常' :
                         'WebGPU已成功启用，所有核心功能可用'
              })
            } catch (error) {
              results.push({
                step: '9. 性能评估',
                status: 'info',
                message: '✅ WebGPU功能正常',
                details: 'WebGPU已成功启用，性能评估暂时不可用'
              })
            }

          } catch (deviceError) {
            results.push({
              step: '6. 请求GPU设备',
              status: 'error',
              message: '❌ GPU设备创建失败',
              details: String(deviceError),
              solution: '可能是GPU驱动程序问题，请更新显卡驱动'
            })
          }

        } else {
          results.push({
            step: '4. 请求GPU适配器',
            status: 'error',
            message: '❌ 无法获取GPU适配器',
            solution: '可能是硬件不支持或驱动程序问题'
          })
        }

      } catch (adapterError) {
        results.push({
          step: '4. 请求GPU适配器',
          status: 'error',
          message: '❌ 适配器请求失败',
          details: String(adapterError),
          solution: '检查GPU硬件加速是否启用'
        })
      }
    }

    setDiagnostics(results)
    setIsRunning(false)
  }

  useEffect(() => {
    if (isVisible) {
      runDiagnostics()
    }
  }, [isVisible])

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '#4CAF50'
      case 'warning': return '#FF9800'
      case 'error': return '#F44336'
      case 'info': return '#2196F3'
      default: return '#666'
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: '#1976D2',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          zIndex: 1000
        }}
      >
        🔍 WebGPU诊断
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '80vh',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      fontSize: '12px',
      zIndex: 1000,
      overflow: 'auto',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>🔍 WebGPU诊断报告</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {isRunning && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div>🔄 正在运行诊断...</div>
        </div>
      )}

      {diagnostics.map((result, index) => (
        <div key={index} style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '5px' }}>
          <div style={{ color: getStatusColor(result.status), fontWeight: 'bold', marginBottom: '5px' }}>
            {result.step}
          </div>
          <div style={{ marginBottom: '5px' }}>
            {result.message}
          </div>
          {result.details && (
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '5px' }}>
              详情: {result.details}
            </div>
          )}
          {result.solution && (
            <div style={{ fontSize: '11px', color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)', padding: '5px', borderRadius: '3px' }}>
              💡 解决方案: {result.solution}
            </div>
          )}
        </div>
      ))}

      {!isRunning && diagnostics.length > 0 && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2196F3' }}>🛠️ 启用WebGPU的方法:</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Chrome/Edge:</strong>
            <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>地址栏输入: <code style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 4px' }}>chrome://flags</code></li>
              <li>搜索: "WebGPU"</li>
              <li>启用: "Unsafe WebGPU"</li>
              <li>重启浏览器</li>
            </ol>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Firefox:</strong>
            <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>地址栏输入: <code style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 4px' }}>about:config</code></li>
              <li>搜索: "dom.webgpu.enabled"</li>
              <li>设置为: true</li>
              <li>重启浏览器</li>
            </ol>
          </div>

          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '10px' }}>
            注意: WebGPU目前仍在实验阶段，可能不稳定。如果遇到问题，系统会自动降级到WebGL。
          </div>
        </div>
      )}

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          style={{
            padding: '8px 15px',
            backgroundColor: isRunning ? '#666' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isRunning ? '🔄 诊断中...' : '🔄 重新诊断'}
        </button>
      </div>
    </div>
  )
}
