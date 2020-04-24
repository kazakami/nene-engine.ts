
/** @type import('webpack').Configuration */
module.exports = [
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
        resolve: {// aliasを追加
            alias: {
                'vue$': 'vue/dist/vue.esm.js'
            },

            extensions: ['.ts', '.js'],
        },
        node: {
            fs: 'empty'
        },
        watchOptions: {
            poll: 1000
        }
    },
    {
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
        },
        watchOptions: {
            poll: 1000
        }
    }
];
