// exampleのビルド
/** @type import('webpack').Configuration */
module.exports = {
  mode: 'development',
  entry: {
    'balls': './examples/balls.ts',
    '2D': './examples/2D.ts',
    'flight': './examples/flight.ts',
    'flightWorker': './examples/flightWorker.ts',
    'terrain': './examples/terrain.ts',
    'scenes': './examples/scenes.ts',
  },
  output: {
    path: `${__dirname}/examples/dist`,
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
    fs: 'empty'
  }
};
