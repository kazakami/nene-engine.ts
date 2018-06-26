module.exports = {
    mode: 'development',

    entry: './hello.ts',

    output: {
      path: `${__dirname}/dist`,
      filename: 'main.js'
    },
    module: {
      rules: [
        {test: /\.ts$/,use: 'ts-loader'}
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
    }
  };