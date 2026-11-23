import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Capacitor loads the app from file:// on Android; relative paths are required.
  base: './'
});
