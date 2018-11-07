module.exports = {
    mode: 'development',

    entry: './example/balls.ts',

    output: {
      path: `${__dirname}/dist`,
      filename: 'balls.js'
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