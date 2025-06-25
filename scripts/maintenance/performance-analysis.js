/**
 * 性能分析脚本
 * 检测项目的性能瓶颈和优化机会
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class PerformanceAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      compilation: {},
      database: {},
      files: {},
      dependencies: {},
      recommendations: []
    }
  }

  /**
   * 分析TypeScript编译错误
   */
  analyzeCompilation() {
    console.log('🔍 分析TypeScript编译状态...')
    
    try {
      execSync('pnpm run type-check', { stdio: 'pipe' })
      this.results.compilation = {
        status: 'success',
        errors: 0,
        message: '编译成功，无错误'
      }
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || ''
      const errorLines = output.split('\n').filter(line => line.includes('error TS'))
      
      // 分析错误类型
      const errorTypes = {
        'renderOptimization': 0,
        'typeDefinition': 0,
        'importPath': 0,
        'unusedVariable': 0,
        'other': 0
      }
      
      errorLines.forEach(line => {
        if (line.includes('renderOptimization')) errorTypes.renderOptimization++
        else if (line.includes('TS2307') || line.includes('TS2503')) errorTypes.typeDefinition++
        else if (line.includes('TS2304')) errorTypes.importPath++
        else if (line.includes('TS6133')) errorTypes.unusedVariable++
        else errorTypes.other++
      })
      
      this.results.compilation = {
        status: 'error',
        errors: errorLines.length,
        errorTypes,
        criticalErrors: errorTypes.renderOptimization + errorTypes.typeDefinition,
        message: `发现 ${errorLines.length} 个编译错误`
      }
      
      // 添加建议
      if (errorTypes.renderOptimization > 0) {
        this.results.recommendations.push({
          priority: 'high',
          category: 'compilation',
          issue: 'renderOptimization模块错误',
          impact: '性能监控系统无法工作',
          solution: '修复模块导入和类型定义问题'
        })
      }
    }
  }

  /**
   * 分析数据库性能
   */
  analyzeDatabase() {
    console.log('🔍 分析数据库性能...')
    
    const dbPath = path.join(__dirname, '../data/characters.db')
    
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath)
      
      this.results.database = {
        exists: true,
        size: stats.size,
        sizeFormatted: this.formatBytes(stats.size),
        lastModified: stats.mtime.toISOString()
      }
      
      // 检查是否有索引优化机会
      this.results.recommendations.push({
        priority: 'medium',
        category: 'database',
        issue: 'SQLite查询性能',
        impact: '数据加载速度可能较慢',
        solution: '添加索引，优化JOIN查询'
      })
    } else {
      this.results.database = {
        exists: false,
        message: '数据库文件不存在'
      }
    }
  }

  /**
   * 分析文件结构和大小
   */
  analyzeFiles() {
    console.log('🔍 分析文件结构...')
    
    const projectRoot = path.join(__dirname, '..')
    
    // 分析关键目录
    const directories = [
      'src',
      'public/models',
      'node_modules',
      '_experiments',
      'docs'
    ]
    
    const fileAnalysis = {}
    
    directories.forEach(dir => {
      const dirPath = path.join(projectRoot, dir)
      if (fs.existsSync(dirPath)) {
        const size = this.getDirectorySize(dirPath)
        fileAnalysis[dir] = {
          size,
          sizeFormatted: this.formatBytes(size)
        }
      }
    })
    
    // 分析GLB模型文件
    const modelsPath = path.join(projectRoot, 'public/models')
    if (fs.existsSync(modelsPath)) {
      const modelFiles = fs.readdirSync(modelsPath)
        .filter(file => file.endsWith('.glb'))
        .map(file => {
          const filePath = path.join(modelsPath, file)
          const stats = fs.statSync(filePath)
          return {
            name: file,
            size: stats.size,
            sizeFormatted: this.formatBytes(stats.size)
          }
        })
      
      fileAnalysis.models = {
        count: modelFiles.length,
        files: modelFiles,
        totalSize: modelFiles.reduce((sum, file) => sum + file.size, 0)
      }
      
      // 检查模型文件大小
      const largeModels = modelFiles.filter(file => file.size > 1024 * 1024) // >1MB
      if (largeModels.length > 0) {
        this.results.recommendations.push({
          priority: 'medium',
          category: 'models',
          issue: '大型模型文件',
          impact: '模型加载时间较长',
          solution: '考虑模型压缩或LOD优化',
          details: largeModels.map(m => `${m.name}: ${m.sizeFormatted}`)
        })
      }
    }
    
    this.results.files = fileAnalysis
  }

  /**
   * 分析依赖项性能
   */
  analyzeDependencies() {
    console.log('🔍 分析依赖项...')
    
    const packageJsonPath = path.join(__dirname, '../package.json')
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // 分析关键依赖
      const keyDependencies = {
        'three': packageJson.dependencies?.three,
        '@react-three/fiber': packageJson.dependencies?.['@react-three/fiber'],
        '@react-three/drei': packageJson.dependencies?.['@react-three/drei'],
        'better-sqlite3': packageJson.dependencies?.['better-sqlite3'],
        'react': packageJson.dependencies?.react
      }
      
      this.results.dependencies = {
        key: keyDependencies,
        total: Object.keys(packageJson.dependencies || {}).length,
        devTotal: Object.keys(packageJson.devDependencies || {}).length
      }
    }
  }

  /**
   * 生成性能建议
   */
  generateRecommendations() {
    console.log('🔍 生成性能建议...')
    
    // 基于分析结果生成建议
    if (this.results.compilation.errors > 0) {
      this.results.recommendations.unshift({
        priority: 'critical',
        category: 'compilation',
        issue: '编译错误阻塞',
        impact: '项目功能受限，性能监控失效',
        solution: '立即修复编译错误，特别是renderOptimization模块'
      })
    }
    
    // 缓存优化建议
    this.results.recommendations.push({
      priority: 'medium',
      category: 'caching',
      issue: '缓存策略简单',
      impact: '数据加载效率不高',
      solution: '实现分层缓存和智能失效机制'
    })
    
    // 监控建议
    this.results.recommendations.push({
      priority: 'high',
      category: 'monitoring',
      issue: '缺乏实时性能监控',
      impact: '无法及时发现性能问题',
      solution: '启用PerformanceProfiler实时监控'
    })
  }

  /**
   * 工具方法：获取目录大小
   */
  getDirectorySize(dirPath) {
    let totalSize = 0
    
    try {
      const files = fs.readdirSync(dirPath)
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file)
        const stats = fs.statSync(filePath)
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath)
        } else {
          totalSize += stats.size
        }
      })
    } catch (error) {
      // 忽略权限错误等
    }
    
    return totalSize
  }

  /**
   * 工具方法：格式化字节大小
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 运行完整分析
   */
  async runAnalysis() {
    console.log('🚀 开始性能分析...\n')
    
    this.analyzeCompilation()
    this.analyzeDatabase()
    this.analyzeFiles()
    this.analyzeDependencies()
    this.generateRecommendations()
    
    return this.results
  }

  /**
   * 生成报告
   */
  generateReport() {
    const report = `
# 性能分析报告
生成时间: ${this.results.timestamp}

## 编译状态
- 状态: ${this.results.compilation.status}
- 错误数量: ${this.results.compilation.errors || 0}
- 关键错误: ${this.results.compilation.criticalErrors || 0}

## 数据库状态
- 存在: ${this.results.database.exists ? '是' : '否'}
- 大小: ${this.results.database.sizeFormatted || 'N/A'}

## 文件分析
${Object.entries(this.results.files).map(([key, value]) => 
  `- ${key}: ${value.sizeFormatted || JSON.stringify(value)}`
).join('\n')}

## 优化建议
${this.results.recommendations.map((rec, index) => 
  `${index + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}
   影响: ${rec.impact}
   解决方案: ${rec.solution}
`).join('\n')}
`
    
    return report
  }
}

// 运行分析
if (import.meta.url.endsWith(process.argv[1]) || import.meta.url.includes('performance-analysis.js')) {
  const analyzer = new PerformanceAnalyzer()

  analyzer.runAnalysis().then(results => {
    console.log('\n📊 分析完成！\n')
    console.log(analyzer.generateReport())

    // 保存结果到文件
    const outputPath = path.join(__dirname, '../_experiments/performance-analysis.json')
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`\n💾 详细结果已保存到: ${outputPath}`)
  }).catch(error => {
    console.error('❌ 分析失败:', error)
  })
}

export default PerformanceAnalyzer
