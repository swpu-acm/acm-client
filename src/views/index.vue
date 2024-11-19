<script setup lang="ts">
import { onMounted } from "vue";
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();

onMounted(() => {
  router.push("/login");
})
</script>

<template>
  <main class="w-full h-screen">

  </main>
</template>
