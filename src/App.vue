<script setup lang="ts">
import { useThemeStore } from './scripts/store';

const themeStore = useThemeStore();

themeStore.init();
</script>

<template>
    <main class="w-full h-screen">
        <Toast />
        <RouterView />
    </main>
</template>
