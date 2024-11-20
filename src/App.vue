<script setup lang="ts">
import { useThemeStore } from './scripts/store';

const themeStore = useThemeStore();

themeStore.init();
</script>

<template>
    <main class="w-full h-screen bg-zinc-200 dark:bg-zinc-950">
        <Toast />
        <RouterView />
    </main>
</template>
