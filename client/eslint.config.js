import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

export default defineConfig([
    {
        ignores: ['dist/**', 'node_modules/**', 'work/**', '*.d.ts'],
    },
    {
        files: ['src/**/*.{js,vue}'],
        extends: [js.configs.recommended, vue.configs['flat/essential']],
        languageOptions: {
            globals: {
                ...globals.browser,
                zE: 'readonly',
                Smooch: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'vue/no-unused-vars': 'warn',
            'vue/multi-word-component-names': [
                'error',
                { ignores: ['Dashboard'] },
            ],
        },
    },
    {
        files: ['src/pages/**/*.vue', 'src/layouts/**/*.vue'],
        rules: {
            'vue/multi-word-component-names': 'off',
        },
    },
    prettier,
]);
