import { defineStore } from "pinia";
import { computed, ref } from "vue";

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

interface Account {
  id?: string;
  token?: string;

  username: string;
  email: string;
  avatar?: string;
  signature?: string;
  links?: string[];

  nickname?: string;
  sex?: boolean;
  birthday?: Date;

  name?: string;
  student_id?: string;
  school?: string;
  college?: string;
  major?: string;

  rating?: number;
  role?: number;
  active?: boolean;
}

export const useAccountStore = defineStore(
  "account",
  () => {
    const account = ref<Account | null>(null);

    const isLoggedIn = computed(
      () => account.value !== null && account.value.token
    );

    const mergeProfile = (profile: Partial<Account>) => {
      if (account.value) {
        Object.assign(account.value, profile);
      }
    };

    const logout = () => {
      account.value = null;
    };

    return { account, isLoggedIn, mergeProfile, logout };
  },
  {
    persist: true,
  }
);
