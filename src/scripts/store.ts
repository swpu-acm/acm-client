import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { expandAssetUrl } from "./utils";
import { Credentials, RecordId } from "./types";

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
    const icon = computed(() => (dark.value ? "pi pi-moon" : "pi pi-sun"));
    const logo = computed(() => (dark.value ? "/acm-light.png" : "/acm.png"));
    return { dark, toggle, init, icon, logo };
  },
  {
    persist: true,
  }
);

enum Role {
  SuperAdmin = "super_admin",
  Admin = "admin",
  User = "user",
  Inactive = "inactive",
}

interface Account {
  id?: string;
  token?: string;

  username?: string;
  email?: string;
  avatar?: string;
  signature?: string;
  links?: string[];

  nickname?: string;
  sex?: boolean;
  birthday?: string;

  name?: string;
  student_id?: string;
  school?: string;
  college?: string;
  major?: string;

  rating?: number;
  role?: Role;
  active?: boolean;
}

export const useAccountStore = defineStore(
  "account",
  () => {
    const account = ref<Account>({});

    const isLoggedIn = computed(() =>
      Boolean(account.value !== null && (account.value.token?.length ?? 0) > 0)
    );

    const auth = computed<Credentials | undefined>(() => {
      return isLoggedIn
        ? {
            id: account.value.id!,
            token: account.value.token!,
          }
        : undefined;
    });
    const avatarUrl = computed<string | undefined>(
      () => account.value?.avatar && expandAssetUrl(account.value?.avatar)
    );
    const recordId = computed<RecordId>(() => {
      return { tb: "account", id: account.value?.id! };
    });

    const mergeProfile = (profile: Partial<Account>) => {
      if (account.value) {
        Object.assign(account.value, profile);
      }
    };

    const logout = () => {
      account.value = {};
    };

    return {
      account,
      auth,
      avatarUrl,
      recordId,
      isLoggedIn,
      mergeProfile,
      logout,
    };
  },
  {
    persist: true,
  }
);
