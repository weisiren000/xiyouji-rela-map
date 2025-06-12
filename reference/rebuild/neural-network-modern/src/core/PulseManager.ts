import * as THREE from 'three'
import { PulseData, ColorPalette } from '@/types'

/**
 * 脉冲管理器
 * 管理网络中的脉冲效果，包括创建、更新和清理脉冲
 */
export class PulseManager {
  private pulses: PulseData[] = []
  private maxPulses: number = 3
  private pulseSpeed: number = 15.0
  private colorPalettes: ColorPalette[]
  private activePaletteIndex: number = 0

  /**
   * 创建脉冲管理器
   * @param colorPalettes 颜色调色板数组
   * @param maxPulses 最大脉冲数量
   */
  constructor(colorPalettes: ColorPalette[], maxPulses: number = 3) {
    this.colorPalettes = colorPalettes
    this.maxPulses = maxPulses
    this.initializePulses()
  }

  /**
   * 初始化脉冲数组
   */
  private initializePulses(): void {
    this.pulses = []
    for (let i = 0; i < this.maxPulses; i++) {
      this.pulses.push({
        position: new THREE.Vector3(1000, 1000, 1000), // 远离场景的位置
        time: -1000, // 很久以前的时间，确保不会被渲染
        color: new THREE.Color(1, 1, 1)
      })
    }
  }

  /**
   * 创建新的脉冲
   * @param position 脉冲起始位置
   * @param currentTime 当前时间
   * @param colorIndex 颜色索引（可选）
   */
  public createPulse(position: THREE.Vector3, currentTime: number, colorIndex?: number): void {
    // 找到最旧的脉冲位置进行替换
    let oldestIndex = 0
    let oldestTime = this.pulses[0].time
    
    for (let i = 1; i < this.pulses.length; i++) {
      if (this.pulses[i].time < oldestTime) {
        oldestTime = this.pulses[i].time
        oldestIndex = i
      }
    }

    // 选择颜色
    const palette = this.colorPalettes[this.activePaletteIndex]
    const color = colorIndex !== undefined && colorIndex < palette.length
      ? palette[colorIndex].clone()
      : palette[Math.floor(Math.random() * palette.length)].clone()

    // 更新脉冲数据
    this.pulses[oldestIndex] = {
      position: position.clone(),
      time: currentTime,
      color: color
    }
  }

  /**
   * 更新脉冲状态
   * @param currentTime 当前时间
   */
  public update(currentTime: number): void {
    // 清理过期的脉冲
    for (const pulse of this.pulses) {
      const timeSinceCreation = currentTime - pulse.time
      if (timeSinceCreation > 3.0) {
        pulse.time = -1000 // 标记为无效
        pulse.position.set(1000, 1000, 1000) // 移到远处
      }
    }
  }

  /**
   * 获取当前活跃的脉冲数据
   * @returns 脉冲位置、时间和颜色数组
   */
  public getPulseData(): {
    positions: THREE.Vector3[]
    times: number[]
    colors: THREE.Color[]
  } {
    const positions: THREE.Vector3[] = []
    const times: number[] = []
    const colors: THREE.Color[] = []

    for (const pulse of this.pulses) {
      positions.push(pulse.position.clone())
      times.push(pulse.time)
      colors.push(pulse.color.clone())
    }

    return { positions, times, colors }
  }

  /**
   * 设置脉冲速度
   * @param speed 新的脉冲速度
   */
  public setPulseSpeed(speed: number): void {
    this.pulseSpeed = Math.max(0.1, speed)
  }

  /**
   * 获取脉冲速度
   * @returns 当前脉冲速度
   */
  public getPulseSpeed(): number {
    return this.pulseSpeed
  }

  /**
   * 设置活跃的颜色调色板
   * @param index 调色板索引
   */
  public setActivePalette(index: number): void {
    if (index >= 0 && index < this.colorPalettes.length) {
      this.activePaletteIndex = index
    }
  }

  /**
   * 获取活跃的颜色调色板索引
   * @returns 当前调色板索引
   */
  public getActivePaletteIndex(): number {
    return this.activePaletteIndex
  }

  /**
   * 添加新的颜色调色板
   * @param palette 新的调色板
   */
  public addColorPalette(palette: ColorPalette): void {
    this.colorPalettes.push(palette)
  }

  /**
   * 清除所有脉冲
   */
  public clearAllPulses(): void {
    this.initializePulses()
  }

  /**
   * 获取活跃脉冲的数量
   * @param currentTime 当前时间
   * @returns 活跃脉冲数量
   */
  public getActivePulseCount(currentTime: number): number {
    let count = 0
    for (const pulse of this.pulses) {
      const timeSinceCreation = currentTime - pulse.time
      if (timeSinceCreation >= 0 && timeSinceCreation <= 3.0) {
        count++
      }
    }
    return count
  }

  /**
   * 检查指定位置是否有活跃脉冲
   * @param position 检查位置
   * @param currentTime 当前时间
   * @param radius 检查半径
   * @returns 是否有活跃脉冲
   */
  public hasActivePulseAt(position: THREE.Vector3, currentTime: number, radius: number = 2.0): boolean {
    for (const pulse of this.pulses) {
      const timeSinceCreation = currentTime - pulse.time
      if (timeSinceCreation >= 0 && timeSinceCreation <= 3.0) {
        const pulseRadius = timeSinceCreation * this.pulseSpeed
        const distance = position.distanceTo(pulse.position)
        if (Math.abs(distance - pulseRadius) <= radius) {
          return true
        }
      }
    }
    return false
  }

  /**
   * 获取调试信息
   * @param currentTime 当前时间
   * @returns 调试信息字符串
   */
  public getDebugInfo(currentTime: number): string {
    const activePulses = this.getActivePulseCount(currentTime)
    return `PulseManager[Active:${activePulses}/${this.maxPulses}, Speed:${this.pulseSpeed}, Palette:${this.activePaletteIndex}]`
  }
}
