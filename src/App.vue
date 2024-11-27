<script setup lang="ts">
import { useThemeStore } from './scripts/store';

const themeStore = useThemeStore();

themeStore.init();
</script>

<template>
    <main class="h-full w-full bg-zinc-200 dark:bg-zinc-950">
        <Toast class="max-w-xs sm:max-w-full"/>
        <RouterView />
    </main>
</template>
