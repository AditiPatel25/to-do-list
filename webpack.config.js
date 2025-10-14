const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development', 
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: '/AditiPatel25/',
    },
    devtool: "eval-source-map",
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        watchFiles: ['./src/**/*'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename:'index.html',
            inject: 'head',
            scriptLoading: 'defer',
            title:'To-Do App',
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            }
        ],
    },
};