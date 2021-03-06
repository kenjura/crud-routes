module.exports = {
    env: {
        es6: true,
        node: true,
        mocha: true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaFeatures: {
            experimentalObjectRestSpread: true
        },
        ecmaVersion: 2017
    },
    rules: {
        indent: [
            'error',
            2
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        quotes: [
            'error',
            'single'
        ],
        semi: [
            'error',
            'always'
        ],
        'no-unused-vars': [
            'error',
            { argsIgnorePattern: '(next|info)' }
        ]
    }
};