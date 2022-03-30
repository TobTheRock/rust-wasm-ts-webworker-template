const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const runFolder = "./run";
module.exports = {
    mode: "development",
    entry: './index.js',
    context: path.resolve(__dirname, './testpage'),
    output: {
        path: path.resolve(__dirname, runFolder),
        filename: 'index_bundle.js',
    },
    plugins: [new HtmlWebpackPlugin({template: "index.html"})],
    devServer: {
        https: true,
        compress: true,
        host: "0.0.0.0",
        port: 8443,
        static: [
            {
                directory: runFolder,
            },
        ],
    },
};