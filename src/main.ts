import "@/assets/base.css";
import "@/assets/tailwind.css";

import { createApp } from "vue";
import App from "@/App.vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import ToastService from "primevue/toastservice";

import router from "./router";

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
  options: {
    prefix: "p",
    darkModeSelector: ".dark",
    cssLayer: false,
  },
});
app.use(ToastService);

app.mount("#app");
