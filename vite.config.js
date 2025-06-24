import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    appType: 'spa',
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/general': {
          target: env.VITE_GENERAL_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/general/, ''),
        },
        '/api/secondary': {
          target: env.VITE_SYNCHRONIZE_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/secondary/, ''),
        },
      },
    },
  };
});
