import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Vite配置 - 专门用于ngrok外部访问
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@shaders': resolve(__dirname, 'src/shaders'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // 监听所有网络接口
    open: false, // 不自动打开浏览器
    cors: true, // 启用CORS
    // 完全禁用主机检查
    allowedHosts: 'all',
    // 或者使用以下方式（Vite 5的新语法）
    hmr: {
      port: 3001,
    },
  },
  // 添加这个配置来完全禁用主机检查
  define: {
    __VITE_IS_MODERN__: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          postprocessing: ['@react-three/postprocessing', 'postprocessing'],
        },
      },
    },
  },
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
})
