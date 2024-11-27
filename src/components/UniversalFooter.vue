<script setup lang="ts">
import { useThemeStore } from '@/scripts/store';

const themeStore = useThemeStore();
</script>

<template>
    <footer class="w-full bg-gray-3 dark:bg-gray-9 text-center my-6">
        <div class="container mx-auto">
            <div class="inline-flex gap-4 justify-center items-center">
                <Avatar :image="themeStore.logo"></Avatar>
                <span class="text-sm">© 2024 SWPU-ACM, org. All rights reserved.</span>
            </div>
        </div>
    </footer>
</template>