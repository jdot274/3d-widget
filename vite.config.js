import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Prevent external dependencies resolution issues
  optimizeDeps: {
    force: true,
    include: [
      'three', 
      '@react-three/fiber', 
      '@react-three/drei',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      '@monaco-editor/react',
      'zustand',
      'immer'
    ],
    exclude: []
  },
  // Fix module resolution for packages that import Three.js incorrectly
  resolve: {
    dedupe: [
      'three',
      'react',
      'react-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion'
    ]
  },
  // Ensure builds can find required modules
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'chakra': ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion']
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
    },
    // Add a plugin to inject the reportError._sys_config
    {
      name: 'inject-report-error',
      transformIndexHtml() {
        return [
          {
            tag: 'script',
            attrs: { type: 'text/javascript' },
            children: `
              window.reportError = window.reportError || {};
              window.reportError._sys_config = window.reportError._sys_config || { enabled: false };
            `,
            injectTo: 'head-prepend'
          }
        ];
      }
    }
  ],
  // Add a server configuration to handle potential CORS issues
  server: {
    hmr: {
      overlay: false // Disable the HMR overlay to prevent it from triggering provider.js errors
    }
  }
}); 