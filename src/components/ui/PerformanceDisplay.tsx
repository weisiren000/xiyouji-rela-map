import React, { useState, useEffect } from 'react'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import { useGalaxyStore } from '@/stores/useGalaxyStore'


/**
 * 性能显示组件
 * 显示当前FPS和性能等级
 */
export const PerformanceDisplay: React.FC = () => {
  const { fps, performanceLevel: detectedLevel } = usePerformanceMonitor()
  const { performanceLevel, autoPerformance } = useGalaxyStore()


  const getFPSColor = (fps: number): string => {
    if (fps >= 55) return '#4CAF50' // 绿色
    if (fps >= 45) return '#FF9800' // 橙色
    if (fps >= 30) return '#FF5722' // 红橙色
    return '#F44336' // 红色
  }

  const getPerformanceLevelText = (level: string): string => {
    switch (level) {
      case 'low': return '低配'
      case 'medium': return '中等'
      case 'high': return '高配'
      case 'ultra': return '极致'
      default: return level
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        minWidth: '120px',
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>FPS:</span>
          <span style={{ 
            color: getFPSColor(fps),
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {fps}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>当前:</span>
          <span style={{ 
            color: '#2196F3',
            fontWeight: 'bold'
          }}>
            {getPerformanceLevelText(performanceLevel)}
          </span>
        </div>
      </div>

      {autoPerformance && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>检测:</span>
            <span style={{ 
              color: '#9C27B0',
              fontWeight: 'bold'
            }}>
              {getPerformanceLevelText(detectedLevel)}
            </span>
          </div>
        </div>
      )}



      <div style={{
        fontSize: '10px',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '6px'
      }}>
{autoPerformance ? '自动调节' : '手动控制'} | WebGL 🔧
      </div>
    </div>
  )
}
