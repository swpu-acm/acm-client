import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";

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

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...routes],
});
