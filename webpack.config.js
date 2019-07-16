module.exports = [
  // exampleのビルド
  {
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
  },
  // editorのサーバ側のビルド
  {
    mode: 'development',
    entry: {
      'cli': './src/editor/server/Neneditor.ts',
    },
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
  },
  // editorのクライアント側のビルド
  {
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
    resolve: {
      extensions: ['.ts', '.js'],
    }
  }
];
