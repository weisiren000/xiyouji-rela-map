import './styles/main.css'
import { NeuralNetworkApp } from './core/NeuralNetworkApp'

/**
 * 应用入口点
 * 初始化并启动神经网络可视化应用
 */
class Application {
  private app: NeuralNetworkApp | null = null
  private loadingElement: HTMLElement | null = null

  constructor() {
    this.init()
  }

  /**
   * 初始化应用
   */
  private async init(): Promise<void> {
    try {
      // 获取加载元素
      this.loadingElement = document.getElementById('loading')
      
      // 显示加载状态
      this.showLoading('初始化应用...')

      // 等待DOM完全加载
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve)
        })
      }

      // 创建应用实例
      this.showLoading('创建3D场景...')
      this.app = new NeuralNetworkApp()

      // 初始化应用
      this.showLoading('加载神经网络...')
      await this.app.init()

      // 启动应用
      this.showLoading('启动渲染...')
      this.app.start()

      // 隐藏加载界面
      this.hideLoading()

      // 设置错误处理
      this.setupErrorHandling()

      console.log('🧠 神经网络可视化应用启动成功!')

    } catch (error) {
      console.error('❌ 应用初始化失败:', error)
      this.showError('应用初始化失败，请刷新页面重试')
    }
  }

  /**
   * 显示加载状态
   * @param message 加载消息
   */
  private showLoading(message: string): void {
    if (this.loadingElement) {
      const textElement = this.loadingElement.querySelector('span')
      if (textElement) {
        textElement.textContent = message
      }
      this.loadingElement.style.display = 'flex'
    }
  }

  /**
   * 隐藏加载界面
   */
  private hideLoading(): void {
    if (this.loadingElement) {
      this.loadingElement.style.opacity = '0'
      setTimeout(() => {
        if (this.loadingElement) {
          this.loadingElement.style.display = 'none'
        }
      }, 500)
    }
  }

  /**
   * 显示错误信息
   * @param message 错误消息
   */
  private showError(message: string): void {
    if (this.loadingElement) {
      this.loadingElement.innerHTML = `
        <div style="text-align: center; color: #ff6b6b;">
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <div style="font-size: 18px; margin-bottom: 10px;">出现错误</div>
          <div style="font-size: 14px; opacity: 0.8;">${message}</div>
          <button onclick="location.reload()" style="
            margin-top: 20px;
            padding: 10px 20px;
            background: rgba(255, 120, 50, 0.2);
            border: 1px solid rgba(255, 150, 50, 0.3);
            border-radius: 6px;
            color: #eee;
            cursor: pointer;
            font-size: 14px;
          ">刷新页面</button>
        </div>
      `
    }
  }

  /**
   * 设置全局错误处理
   */
  private setupErrorHandling(): void {
    // 处理未捕获的错误
    window.addEventListener('error', (event) => {
      console.error('❌ 全局错误:', event.error)
      this.handleError(event.error)
    })

    // 处理未捕获的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ 未处理的Promise拒绝:', event.reason)
      this.handleError(event.reason)
    })

    // 处理页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (this.app) {
        if (document.hidden) {
          this.app.pause()
        } else {
          this.app.resume()
        }
      }
    })

    // 处理窗口大小变化
    window.addEventListener('resize', () => {
      if (this.app) {
        this.app.handleResize()
      }
    })

    // 处理页面卸载
    window.addEventListener('beforeunload', () => {
      if (this.app) {
        this.app.dispose()
      }
    })
  }

  /**
   * 处理错误
   * @param error 错误对象
   */
  private handleError(error: any): void {
    // 在开发环境中显示详细错误信息
    if (import.meta.env.DEV) {
      console.error('详细错误信息:', error)
    }

    // 在生产环境中可以发送错误报告到服务器
    if (import.meta.env.PROD) {
      // TODO: 发送错误报告
    }
  }
}

// 启动应用
new Application()

// 开发环境下的热重载支持
if (import.meta.hot) {
  import.meta.hot.accept()
}
