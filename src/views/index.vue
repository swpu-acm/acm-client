<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  router.push("/login");
})
</script>

<template>
  <main class="w-full h-screen">

  </main>
</template>
