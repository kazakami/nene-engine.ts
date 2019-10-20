// exampleのビルド
/** @type import('webpack').Configuration */
module.exports = {
  mode: 'development',
  entry: {
    'hoge': './src/editor/client/hoge.ts',
  },
  output: {
    path: `${__dirname}/lib/dist/client`,
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  },
  resolve: {// aliasを追加
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },

    extensions: ['.ts', '.js'],
  },
  node: {
    fs: 'empty'
  }
};
