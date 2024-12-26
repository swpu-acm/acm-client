/*****************************************************************************
 * AlgoHub: Cross-platform online judge cilent based on Tauri
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

import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const views = import.meta.glob([
  "./views/**/*.vue",
  "./views/**/index.vue",
  "./views/**/\\[*\\].vue",
]);

const routes: RouteRecordRaw[] = Object.entries(views).map(
  ([filePath, component]) => {
    let path = filePath
      .replace(/^\.\/views\//, "")
      .replace(/\.vue$/, "")
      .replace(/^(.*)\/?index$/, "$1")
      .replace(/\[(\w+)\]$/, ":$1");
    path = "/" + path;

    return {
      path,
      name: filePath.replace(/^\.\/views\//, ""),
      component,
    } satisfies RouteRecordRaw;
  }
);

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...routes],
});

NProgress.configure({
  easing: "ease",
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
});

router.beforeEach((_to, _from, next) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
