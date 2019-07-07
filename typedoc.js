module.exports = {
    out: './docs/',

    readme: 'none',
    exclude: [
        '**/test/*',
        '**/examples/*',
        '**/node_modules/**'
    ],
    mode: 'file',
    excludeExternals: true,
    excludeNotExported: true,
    excludePrivate: true
};
