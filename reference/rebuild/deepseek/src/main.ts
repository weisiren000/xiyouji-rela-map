import { SceneManager } from '@/components/SceneManager';
import { updateStarCount, handleError } from '@/utils/helpers';
import { DEFAULT_STARFIELD_CONFIG } from '@/utils/config';

/**
 * 应用程序主类
 * 负责应用程序的初始化和生命周期管理
 */
class App {
  private sceneManager: SceneManager | null = null;
  private container: HTMLElement | null = null;

  /**
   * 初始化应用程序
   */
  public async init(): Promise<void> {
    try {
      console.log('🚀 开始初始化3D星空场景...');
      
      // 获取容器元素
      this.container = document.getElementById('container');
      if (!this.container) {
        throw new Error('找不到容器元素 #container');
      }

      // 更新星星计数显示
      updateStarCount(DEFAULT_STARFIELD_CONFIG.starCount);

      // 创建场景管理器
      this.sceneManager = new SceneManager(this.container);
      
      // 检查初始化状态
      const state = this.sceneManager.getState();
      if (state.error) {
        throw new Error(state.error);
      }

      // 开始渲染
      this.sceneManager.start();
      
      console.log('✅ 3D星空场景初始化完成');
      
    } catch (error) {
      handleError(error as Error, 'App初始化');
      this.showErrorMessage(error as Error);
    }
  }

  /**
   * 显示错误信息
   * @param error 错误对象
   */
  private showErrorMessage(error: Error): void {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.innerHTML = `
        <div style="text-align: center; color: #ff6b6b;">
          <h2>😔 场景加载失败</h2>
          <p style="margin-top: 20px; font-size: 1.1rem;">
            ${error.message}
          </p>
          <button 
            onclick="location.reload()" 
            style="
              margin-top: 20px;
              padding: 10px 20px;
              background: #4b6cb7;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            重新加载
          </button>
        </div>
      `;
    }
  }

  /**
   * 销毁应用程序
   */
  public destroy(): void {
    if (this.sceneManager) {
      this.sceneManager.dispose();
      this.sceneManager = null;
    }
    console.log('🧹 应用程序已清理');
  }
}

/**
 * 应用程序入口点
 */
async function main(): Promise<void> {
  const app = new App();
  
  // 页面加载完成后初始化应用
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    await app.init();
  }
  
  // 页面卸载时清理资源
  window.addEventListener('beforeunload', () => {
    app.destroy();
  });
  
  // 开发环境下将app实例挂载到window对象，方便调试
  if (import.meta.env.DEV) {
    (window as any).__app = app;
  }
}

// 启动应用程序
main().catch((error) => {
  console.error('应用程序启动失败:', error);
});
