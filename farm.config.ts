import { defineConfig } from "@farmfe/core";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [],
  vitePlugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],

  clearScreen: false,
  compilation: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
          watchOptions: {
            ignored: ["**/src-tauri/**"],
          }
        }
      : undefined,
  },
});
