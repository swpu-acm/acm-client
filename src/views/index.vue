<script setup lang="ts">
import { useAccountStore } from "@/scripts/store";
import { onMounted } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const accountStore = useAccountStore();

onMounted(() => {
  if (!accountStore.isLoggedIn) {
    router.push("/login");
  }
})
</script>

<template>
  <main class="w-full h-screen">

  </main>
</template>
