module.exports = {
    mode: 'development',

    entry: {
      'balls': './examples/balls.ts',
      '2D': './examples/2D.ts',
      'flight': './examples/flight.ts'
    },

    output: {
      path: `${__dirname}/examples/dist`,
      filename: '[name].js'
    },
    module: {
      rules: [
        {test: /\.ts$/,use: 'ts-loader'}
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    node: {
      fs: 'empty'
    }
  };