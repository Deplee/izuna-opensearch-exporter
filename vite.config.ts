import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { register, appRequestsTotal } from './src/server/metrics';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'metrics-middleware',
      configureServer(server) {
        server.middlewares.use('/metrics', async (req, res) => {
          appRequestsTotal.inc({ endpoint: '/metrics' });
          res.setHeader('Content-Type', register.contentType);
          res.end(await register.metrics());
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
