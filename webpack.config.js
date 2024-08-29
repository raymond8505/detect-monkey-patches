const path = require('path');

module.exports = {

  entry: './src/index.ts',

  mode: 'development',

  output: {

    filename: 'detect-monkey-patches.js',

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

  devtool: 'source-map',

  devServer: {

    static : {
        directory: path.join(__dirname,'dist')
    },

    compress: true,

    port: 9000,

  },

};