const path = require('path');
const glob = require('glob');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const parts = require('./webpack.parts');

const PATHS = {
    app : path.join(__dirname, 'src'),
    build : path.join(__dirname, 'dist')
};

const commonConfig = merge([
    {
        plugins: [
            new HtmlWebpackPlugin({ title: 'Webpack demo' })
        ]
    },
    parts.loadJavascript({ include: PATHS.app }),
    parts.setFreeVariable('HELLO', 'hello from config')
]);

const productionConfig = merge([
    {
        output: {
            chunkFilename: '[name].[chunkhash:4].js',
            filename: '[name].[chunkhash:4].js'
        }
    },
    parts.clean(PATHS.build),
    parts.minifyJavascript(),
    parts.minifyCSS({ 
        discardComments: {
            removeAll: true
        },
        safe: true
     }),
    parts.extractCSS({ 
        use: ['css-loader', parts.autoprefix()]
    }),
    parts.purifyCSS({
        paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true })
    }),
    parts.loadImages({
        options: {
            limit: 15000,
            name: '[name].[hash:4].[ext]'
        }
    }),
    parts.generateSourceMaps({ type: 'source-map' }),
    {
        optimization: {
            splitChunks: {
                chunks: 'initial'
            }
        }
    },
    parts.attachRevision()
]);

const developmentConfig = merge([
    parts.devServer({
        host: process.env.HOST,
        port: process.env.PORT
    }),
    parts.loadCSS(),
    parts.loadImages()
]);

module.exports = mode => {
    if (mode === 'production') {
        return merge(commonConfig, productionConfig, { mode });
    }

    return merge(commonConfig, developmentConfig, { mode });
};