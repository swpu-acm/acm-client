<!--
AlgoHub: Cross-platform online judge client based on Tauri
Copyright (C) 2024 Association of Computing Machinery affiliated SWPU

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script setup lang="ts">
import { useThemeStore } from '@/scripts/store';
import { useRouter } from 'vue-router';

const themeStore = useThemeStore();
const router = useRouter();
</script>

<template>
    <footer class="w-full bg-gray-3 dark:bg-gray-9 text-center my-6">
        <div class="flex flex-col mx-auto">
            <div class="inline-flex gap-2 justify-center items-center">
                <Avatar @click="router.push('/')" class="cursor-pointer hover:grayscale-[50%] hover:shadow-md"
                    :image="themeStore.logo"></Avatar>
                <span class="text-sm">© 2024 SWPU-ACM, org. All rights reserved.</span>
            </div>
            <div class="my-2 inline-flex flex-wrap gap-2 justify-center items-center">
                <Button link as="a" href="https://github.com/swpu-acm/algohub" target="_blank" icon="pi pi-github" text
                    plain></Button>
                <Button link as="a" href="https://qm.qq.com/q/NRSl1be2se" target="_blank" class="text-white" text plain>
                    <template #icon>
                        <svg t="1734574470382" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="1451" width="20">
                            <path
                                d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m210.5 612.4c-11.5 1.4-44.9-52.7-44.9-52.7 0 31.3-16.2 72.2-51.1 101.8 16.9 5.2 54.9 19.2 45.9 34.4-7.3 12.3-125.6 7.9-159.8 4-34.2 3.8-152.5 8.3-159.8-4-9.1-15.2 28.9-29.2 45.8-34.4-35-29.5-51.1-70.4-51.1-101.8 0 0-33.4 54.1-44.9 52.7-5.4-0.7-12.4-29.6 9.4-99.7 10.3-33 22-60.5 40.2-105.8-3.1-116.9 45.3-215 160.4-215 113.9 0 163.3 96.1 160.4 215 18.1 45.2 29.9 72.8 40.2 105.8 21.7 70.1 14.6 99.1 9.3 99.7z"
                                p-id="1452" :fill="themeStore.dark ? '#fff' : '#000'"></path>
                        </svg>
                    </template>
                </Button>
            </div>
        </div>
    </footer>
</template>
