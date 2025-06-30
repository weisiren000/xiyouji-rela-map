import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // 强制使用IPv4
    port: 5555,
    strictPort: true, // 如果端口被占用，自动尝试下一个端口
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
