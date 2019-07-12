module.exports = {
  mode: 'development',

  entry: {
    'lib/dist/cli': './src/Neneditor.ts',
    'examples/dist/balls': './examples/balls.ts',
    'examples/dist/2D': './examples/2D.ts',
    'examples/dist/flight': './examples/flight.ts',
    'examples/dist/flightWorker': './examples/flightWorker.ts',
    'examples/dist/terrain': './examples/terrain.ts',
    'examples/dist/scenes': './examples/scenes.ts',
  },

  output: {
    path: `${__dirname}`,
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
