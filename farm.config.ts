/*****************************************************************************
 * AlgoHub: Cross-platform online judge client based on Tauri
 * Copyright (C) 2024 Association of Computing Machinery affiliated SWPU
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *****************************************************************************/

import { defineConfig } from "@farmfe/core";
import vue from "@vitejs/plugin-vue";
import worker from "@farmfe/plugin-worker";
import postcss from "@farmfe/js-plugin-postcss";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [worker(), postcss()],
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
    treeShaking: false,
    define: {
      "process.env.LOCAL": process.env.LOCAL ? true : false,
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
          },
        }
      : undefined,
  },
});
