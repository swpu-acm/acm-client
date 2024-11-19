import { defineStore } from "pinia";
import { ref } from "vue";

const prefersDarkMode = () => {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};

export const useThemeStore = defineStore(
  "theme",
  () => {
    const dark = ref<boolean | null>(null);
    const init = () => {
      if (dark.value === null) {
        dark.value = prefersDarkMode();
      }
      if (dark.value) {
        document.documentElement.classList.add("dark");
      }
    };
    const toggle = () => {
      dark.value = !dark.value;
      if (dark.value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    return { dark, toggle, init };
  },
  {
    persist: true,
  }
);
