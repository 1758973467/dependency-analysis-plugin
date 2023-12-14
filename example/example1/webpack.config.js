const DependenciesAnalyzerPlugin = require("../src");
const path = require('node:path')
module.exports = {
    entry: "./src/main.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].js"
    },
    plugins: [
        new DependenciesAnalyzerPlugin()
    ],
    devtool: 'source-map',
    mode: "production"
}