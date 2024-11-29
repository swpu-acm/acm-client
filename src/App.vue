<script setup lang="ts">
import { useThemeStore } from './scripts/store';

const themeStore = useThemeStore();

themeStore.init();
</script>

<template>
    <main class="h-screen w-full">
        <Toast class="max-w-xs sm:max-w-full" />
        <RouterView />
    </main>
</template>
