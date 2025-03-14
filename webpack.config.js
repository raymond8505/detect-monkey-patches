const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {

  entry: {
    'detect-monkey-patches': './src/index.ts',
    'bookmarklet': './src/bookmarklet.ts',
  },

  mode: 'development',

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
            ecma: 2015,
            source_map: false,
            indent_level: 0
          },
          compress: {
            ecma: 2015,

          }
        },
        extractComments: false,
      }),
    ],
  },

  output: {

    filename: '[name].js',

    path: path.resolve(__dirname, 'dist'),

  },

  module: {

    rules: [

      {

        test: /\.tsx?$/,

        use: 'ts-loader',

        exclude: /node_modules/,

      },

    ],

  },

  resolve: {

    extensions: ['.tsx', '.ts', '.js'],

  },

  devServer: {

    static: {
      directory: path.join(__dirname, 'dist')
    },

    compress: true,

    port: 9000,

  },


};