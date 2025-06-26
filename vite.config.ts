import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
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
      '@services': resolve(__dirname, 'src/services'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // 允许外部访问
    open: true,
    // Vite 5的正确语法 - 使用true允许所有主机
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext', // 支持最新的ES特性，包括top-level await
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
    target: 'esnext', // 确保esbuild也使用最新目标
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
    esbuildOptions: {
      target: 'esnext', // 确保依赖优化也使用最新目标
    },
  },
})
