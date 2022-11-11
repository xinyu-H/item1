const { defineConfig } = require('@vue/cli-service')
const devConfigInfo = require('./development.config')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '././' : '',
  transpileDependencies: true,
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "@/assets/style/custom_theme.scss"; ' +
          '@import "@nutui/nutui/dist/styles/variables.scss";'
      }
    }
  },
  devServer: {
    proxy: {
      '/app': {
        target: devConfigInfo.baseApi,
        changeOrigin: true,
        pathRewrite: { '^/dev-api': '' }
      },
      '/web': {
        target: devConfigInfo.baseApi,
        changeOrigin: true,
        pathRewrite: { '^/dev-api': '' }
      }
    }
  }
})
