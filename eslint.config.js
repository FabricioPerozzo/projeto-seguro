const prettier = require('eslint-plugin-prettier');
const globals = require('globals');

module.exports = [
    {
        ignores: ['node_modules/**', 'package.json', 'package-lock.json']
    },
    {
        files: ['public/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser
            }
        }
    },
    {
        files: ['**/*.js'],
        ignores: ['node_modules/**'],
        plugins: {
            prettier
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                process: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                fetch: 'readonly'
            }
        },
        rules: {
            'prettier/prettier': 'error',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'no-undef': 'error',
            eqeqeq: 'error',
            curly: 'error',
            'no-var': 'error',
            'prefer-const': 'error'
        }
    }
];
