import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Los navegadores bloquean los scripts de tipo "module" cuando la página se abre con doble clic (file://).
// Este plugin deja el resultado del build como script clásico para que dist/index.html abra directo.
function abrirConDobleClic() {
  return {
    name: 'abrir-con-doble-clic',
    enforce: 'post',
    transformIndexHtml(html) {
      const scripts = [];
      let salida = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>\s*/g, (_, src) => {
        scripts.push(src);
        return '';
      });
      salida = salida.replace(/ crossorigin(="[^"]*")?/g, '');
      const etiquetas = scripts.map((s) => `<script defer src="${s}"></script>`).join('\n    ');
      return salida.replace('</body>', `  ${etiquetas}\n  </body>`);
    },
  };
}

// base './' permite publicar el sitio compilado en GitHub Pages o abrirlo desde cualquier carpeta.
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [react(), ...(command === 'build' ? [abrirConDobleClic()] : [])],
  build: {
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
  },
}));
