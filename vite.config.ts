import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['3000-ijluvri84uxgfj6mh7wqf-66b39723.us1.manus.computer', '4173-ijluvri84uxgfj6mh7wqf-66b39723.us1.manus.computer']
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['4173-ijluvri84uxgfj6mh7wqf-66b39723.us1.manus.computer', '4174-ijluvri84uxgfj6mh7wqf-66b39723.us1.manus.computer']
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
