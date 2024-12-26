<!--
AlgoHub: Cross-platform online judge cilent based on Tauri
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
