/**
 * 生产环境日志工具
 * 在生产环境中禁用调试日志，只保留错误日志
 */

// 检查是否为生产环境
const isProduction = import.meta.env.PROD

/**
 * 生产环境安全的日志工�? */
export const logger = {
  /**
   * 调试日志 - 生产环境中被禁用
   */
  log: (...args: any[]) => {
    if (!isProduction) {
      logger.log(...args)
    }
  },

  /**
   * 信息日志 - 生产环境中被禁用
   */
  info: (...args: any[]) => {
    if (!isProduction) {
      logger.info(...args)
    }
  },

  /**
   * 警告日志 - 生产环境中被禁用
   */
  warn: (...args: any[]) => {
    if (!isProduction) {
      logger.warn(...args)
    }
  },

  /**
   * 错误日志 - 始终启用，用于生产环境错误追�?   */
  error: (...args: any[]) => {
    logger.error(...args)
  },

  /**
   * 性能日志 - 生产环境中被禁用
   */
  time: (label: string) => {
    if (!isProduction) {
      console.time(label)
    }
  },

  /**
   * 性能日志结束 - 生产环境中被禁用
   */
  timeEnd: (label: string) => {
    if (!isProduction) {
      console.timeEnd(label)
    }
  }
}

/**
 * 开发环境专用的调试工具
 */
export const devLogger = {
  /**
   * 详细调试信息 - 仅在开发环境显�?   */
  debug: (...args: any[]) => {
    if (!isProduction && import.meta.env.DEV) {
      logger.log('🐛 [DEBUG]', ...args)
    }
  },

  /**
   * API调用日志 - 仅在开发环境显�?   */
  api: (method: string, url: string, data?: any) => {
    if (!isProduction && import.meta.env.DEV) {
      logger.log(`🌐 [API] ${method} ${url}`, data ? data : '')
    }
  },

  /**
   * 性能监控 - 仅在开发环境显�?   */
  perf: (label: string, duration: number) => {
    if (!isProduction && import.meta.env.DEV) {
      logger.log(`�?[PERF] ${label}: ${duration}ms`)
    }
  }
}

export default logger
