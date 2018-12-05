module.exports = {
    out: './docs/',

    readme: 'none',
    exclude: [
        '**/test/*',
        '**/examples/*'
    ],
    mode: 'file',
    excludeExternals: true,
    excludeNotExported: true,
    excludePrivate: true
};