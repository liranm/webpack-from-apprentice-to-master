const path = require('path');
const glob = require('glob');
const merge = require('webpack-merge');

const parts = require('./webpack.parts');

const PATHS = {
    app : path.join(__dirname, 'src'),
    build : path.join(__dirname, 'dist')
};

const commonConfig = merge([
    {
        output: {
            publicPath : '/'
        }
    },
    parts.loadJavascript({ include: PATHS.app }),
    parts.setFreeVariable('HELLO', 'hello from config')
]);

const productionConfig = merge([
    {
        performance: {
            hints: 'warning',
            maxEntrypointSize: 50000,
            maxAssetSize: 450000
        }
    },
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
            },
            runtimeChunk: {
                name: 'manifest'
            }
        },
        recordsPath: path.join(__dirname, 'records.json') 
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
    const pages = [
        parts.page({
            title: 'Webpack demo',
            entry: {
                app: PATHS.app
            },
            chunks: [ 'app', 'manifest', 'vendor' ]
        }),
        parts.page({
            title: 'Another demo',
            path: 'another',
            entry: {
                another: path.join(PATHS.app, 'another.js')
            },
            chunks: [ 'another', 'manifest', 'vendor' ]
        })
    ];

    const config = mode === 'production' ? productionConfig : developmentConfig;

    return merge([ commonConfig, config, { mode } ].concat(pages));
};