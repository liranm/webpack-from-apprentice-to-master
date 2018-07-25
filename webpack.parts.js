const PurifyCSSPlugin = require('purifycss-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
const HtmlWebpackPlugin = require('html-webpack-plugin');

exports.page = ({
  path = '',
  template = require.resolve('html-webpack-plugin/default_index.ejs'),
  title,
  entry,
  chunks
} = {}) => ({
  entry,
  plugins: [
    new HtmlWebpackPlugin({
      chunks,
      filename: `${path && path + '/'}index.html`,
      template,
      title
    })
  ]
});

exports.setFreeVariable = (key, value) => {
  const env = {};

  env[key] = JSON.stringify(value);

  return {
    plugins: [ new webpack.DefinePlugin(env) ]
  };
};

exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false
    })
  ]
});

exports.minifyJavascript = () => ({
  optimization: {
    minimizer: [ new UglifyWebpackPlugin({ sourceMap: true }) ]
  }
});

exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version()
    })
  ]
});

exports.clean = path => ({
  plugins: [ new CleanWebpackPlugin([ path ]) ]
});

exports.generateSourceMaps = ({ type }) => ({
  devtool: type
});

exports.loadJavascript = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        use: 'babel-loader'
      }
    ]
  }
});

exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        include,
        exclude,
        use: {
          loader: 'url-loader',
          options
        }
      }
    ]
  }
});

exports.autoprefix = () => ({
    loader: 'postcss-loader',
    options: {
        plugins: () => [ require('autoprefixer')() ]
    }
});

exports.purifyCSS = ({ paths }) => ({
    plugins: [
        new PurifyCSSPlugin({ paths })
    ]
});

exports.extractCSS = ({ include, exclude, use = [] }) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
    filename: '[name].[contenthash:4].css',
  });

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,

          use: [
            MiniCssExtractPlugin.loader,
          ].concat(use),
        },
      ],
    },
    plugins: [plugin],
  };
};

exports.devServer = ({ host, port } = {}) => ({
    devServer: {
        stats: 'errors-only',
        host,
        port,
        open: true,
        overlay: true
    }
});

exports.loadCSS = ({ include, exclude } = {}) => ({
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,
  
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  });