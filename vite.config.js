import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Prevent external dependencies resolution issues
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
    exclude: []
  },
  // Fix module resolution for packages that import Three.js incorrectly
  resolve: {
    dedupe: ['three'],
  },
  // Ensure builds can find required modules
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['three'],
      output: {
        manualChunks: {
          three: ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
        }
      }
    }
  },
  // Allow importing of glsl files for custom shaders
  plugins: [
    {
      name: 'glsl',
      transform(code, id) {
        if (id.endsWith('.glsl') || id.endsWith('.vs') || id.endsWith('.fs') || id.endsWith('.vert') || id.endsWith('.frag')) {
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null
          };
        }
      }
    }
  ]
}); 