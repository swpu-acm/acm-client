<script setup lang="ts">
import loader from '@monaco-editor/loader'
import type { editor as Editor } from 'monaco-editor';
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useThemeStore } from '@/scripts/store';
import type { SelectChangeEvent } from 'primevue';

const code = defineModel<string>('code', { required: true });
const language = defineModel<string>('language', { default: 'rust' });

const themeStore = useThemeStore();

const editor = ref<Editor.IStandaloneCodeEditor>();
const rawEditor = computed(() => toRaw(editor.value));
const editorContainer = ref();

self.MonacoEnvironment = {
    getWorker: function (_, label) {
        switch (label) {
            case 'json':
                return new jsonWorker();
            case 'css':
            case 'scss':
            case 'less':
                return new cssWorker();
            case 'html':
            case 'handlebars':
            case 'razor':
                return new htmlWorker();
            case 'typescript':
            case 'javascript':
                return new tsWorker();
            default:
                return new editorWorker();
        }
    }
};

watch(() => themeStore.dark, () => {
    editor.value?.updateOptions({
        theme: themeStore.dark ? 'vs-dark' : 'vs',
    })
})

onMounted(async () => {
    if (!editorContainer.value) {
        throw new Error('Editor container not found');
    }
    loader.config({ monaco })
    editor.value = await loader.init().then((monaco) => monaco.editor.create(editorContainer.value, {
        value: code.value,
        language: 'rust',
        theme: themeStore.dark ? 'vs-dark' : 'vs',
        fontFamily: 'Cascadia Code, Consolas, Menlo, Monaco, "Courier New", monospace',
        inlineSuggest: {
            enabled: true,
        },
        automaticLayout: true,
    }));
})

const disposeEditor = () => {
    if (editor.value) {
        toRaw(editor.value).dispose();
    }
}

onUnmounted(disposeEditor)
onBeforeUnmount(disposeEditor)
onBeforeRouteLeave(disposeEditor)

const languageOptions = [
    { name: 'Rust', value: 'rust' },
    { name: 'Python', value: 'python' },
    { name: 'C', value: 'c' },
    { name: 'C++', value: 'cpp' },
]

const onChangeLanguage = (value: SelectChangeEvent) => {
    const editor = rawEditor.value;
    if (editor) {
        const model = editor.getModel();
        model && monaco.editor.setModelLanguage(model, value.value);
    }
}
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row w-full m-[6px]">
            <Select v-model="language" @change="onChangeLanguage" :options="languageOptions" optionLabel="name"
                optionValue="value" placeholder="Select a Language" />
        </div>
        <div class="flex-1" ref="editorContainer"></div>
    </div>
</template>
