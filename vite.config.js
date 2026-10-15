import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'
import moment from "moment/moment";
// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  // const time = new Date().toLocaleString('zh', { hour12: false })
  const time = moment().utcOffset(8).format('YYYY.MM.DD HH:mm:ss')
  env.VITE_APP_TIME = time
  return {
    base: mode === 'development' ? '' : '/funds/',
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    // vite 相关配置
    server: {
      port: 8085,
      open: false,
      host: true,
      proxy: {
        '/api/contract': {
          // 开发
          // target: 'http://10.60.20.88:8083',
          // target: 'https://hrp.syyyst.cn/api/contract',
          target: 'http://10.60.20.145:7210',
          // target: 'http://10.60.20.161:7210',
          // target: 'http://10.60.20.161:9005/api/contract',
          // target: 'http://10.60.10.58:8083',
          // target: 'http://10.60.10.15:8083',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/contract/, ''),
        },
        '/api/basic': {
          // 开发
          // target: 'http://172.16.11.145:8881',
          target: 'http://10.60.20.145:8881',
          // target: 'http://10.60.20.161:8881',
          // target: 'http://10.60.20.145:8881',
          // target: 'http://10.60.20.120:8889',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/api': {
          // 开发
          // target: 'http://10.60.20.161:9005/api/funds',
          target: 'http://10.60.20.145:9005/api/funds',
          // target: 'http://10.60.20.120:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ureport': {
          target: 'http://localhost:8080',
          // 测试环境地址
          // target: 'http://116.63.62.154:9101',
          // target: 'http://116.63.62.154:9014',
          changeOrigin: true,
        },
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    build: {
      // minify: false,
      terserOptions: {
        compress: {
          // 生产环境时移除console.log()
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
        },
        css: {
          charset: false,
        },
      },
    },
  }
})
