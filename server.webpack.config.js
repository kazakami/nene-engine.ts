// editorのサーバ側のビルド
/** @type import('webpack').Configuration */
module.exports = {
  mode: 'development',
  entry: {
    'cli': './src/editor/server/Neneditor.ts',
  },
  externals: require("webpack-node-externals")(),
  target: 'node',
  output: {
    path: `${__dirname}/lib/dist/server`,
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  node: {
    __dirname: false,
    __filename: false,
  }
};
