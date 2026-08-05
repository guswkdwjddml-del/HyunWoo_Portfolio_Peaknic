import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host:true, //외부 IP에서도 접속 가능
    port: 3000, //개발 서버 포트
    strictPort:true //포트가 이미 사용중이면 실패
  },
})
