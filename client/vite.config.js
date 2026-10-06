import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import VueRouter from 'vue-router/vite';
import MotionResolver from 'motion-v/resolver';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        VueRouter({
            routesFolder: 'src/pages',
            extensions: ['.vue'],
            importMode: 'async',
            dts: './typed-router.d.ts',
        }),
        vue(),
        Components({
            dirs: ['src/components'],
            extensions: ['vue'],
            deep: true,
            directives: true,
            resolvers: [MotionResolver()],
        }),
    ],
    server: {
        fs: {
            cachedChecks: false,
        },
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api(?=\/|$)/, ''),
            },
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
