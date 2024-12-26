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
import { useThemeStore } from '@/scripts/store';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const value = defineModel<string>({ required: true })
const props = defineProps(['id', 'placeholder'])

const themeStore = useThemeStore();
</script>

<template>
    <MdEditor v-model="value" :editorId="props.id" :placeholder="props.placeholder" :language="'en-US'"
        :theme="themeStore.dark ? 'dark' : 'light'" codeTheme="github" previewTheme="github" :tabWidth="4" :toolbars="[
            'bold',
            'underline',
            'italic',
            '-',
            'title',
            'strikeThrough',
            'sub',
            'sup',
            'quote',
            'unorderedList',
            'orderedList',
            '-',
            'codeRow',
            'code',
            'link',
            'image',
            'table',
            'katex',
            '=',
            'pageFullscreen',
            'preview',
            'previewOnly',
        ]"></MdEditor>
</template>

<style scoped>
:deep(svg.md-editor-icon) {
    width: revert-layer;
    height: revert-layer;
}
</style>
