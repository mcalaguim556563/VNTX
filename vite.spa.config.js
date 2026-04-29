import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Standalone SPA config — no Laravel plugin, serves index.html directly from root
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    root: '.',
    publicDir: 'public',
    server: {
        port: 5173,
        // Serve index.html for all routes (SPA fallback)
        historyApiFallback: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        rollupOptions: {
            input: {
                app: path.resolve(__dirname, 'index.html'),
            },
        },
        outDir: 'public/build',
    },
});
