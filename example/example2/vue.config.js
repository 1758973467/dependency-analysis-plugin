const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MyAwesomeWebpackPlugin = require('./MyAwesomeWebpackPlugin.js')
module.exports = {
  lintOnSave: false,
  configureWebpack: {
    plugins: [
      new MyAwesomeWebpackPlugin(),
      // new BundleAnalyzerPlugin()
    ]
  },
  chainWebpack: config => {
    config.plugins.delete('html')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  }
}
