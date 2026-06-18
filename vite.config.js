import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: [
      'ckeditor5',
      '@ckeditor/ckeditor5-react',
      '@ckeditor/ckeditor5-core',
      '@ckeditor/ckeditor5-engine',
      '@ckeditor/ckeditor5-ui',
      '@ckeditor/ckeditor5-utils',
      '@ckeditor/ckeditor5-watchdog',
      '@ckeditor/ckeditor5-widget'
    ]
  },
})
