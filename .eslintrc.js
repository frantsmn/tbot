module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
        'airbnb-typescript/base',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: [
        '@typescript-eslint',
    ],
    rules: {
        'no-console': ['error', {
            allow: ['warn', 'error'],
        }],
        '@typescript-eslint/indent': ['error', 4],
        '@typescript-eslint/object-curly-spacing': 0,
        '@typescript-eslint/lines-between-class-members': 0,
        '@typescript-eslint/no-shadow': 0,
        'linebreak-style': ['error', 'windows'],
    },
};
