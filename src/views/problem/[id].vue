<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as api from '@/scripts/api';
import { useAccountStore, useThemeStore } from '@/scripts/store';
import { useToast } from 'primevue';
import { Language, UserProblem } from '@/scripts/types';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const toast = useToast();
const accountStore = useAccountStore();
const themeStore = useThemeStore();

const problem = ref<UserProblem>();
const formatProblem = (problem: UserProblem) => {
    let formattedText = '';
    const { description, input, output, samples, hint } = problem;

    description && (formattedText += `## Problem Description\n\n${description}\n\n`);
    input && (formattedText += `## Input\n\n${input}\n\n`);
    output && (formattedText += `## Output\n\n${output}\n\n`);
    if (samples) {
        formattedText += `## Samples\n\n`
        samples.forEach((sample, index) => {
            formattedText += `### Sample ${index + 1}\n\n`
            sample.input && (formattedText += "**Input:**\n\n```input\n" + sample.input + "\n```\n\n")
            sample.output && (formattedText += "**Output:**\n\n```output\n" + sample.output + "\n```\n\n")
        })
    }
    hint && (formattedText += `## Hint\n\n${hint}\n\n`);

    return formattedText;
}

const code = ref('');
const language = ref(Language.Rust);
const onSubmit = async (code: string, lang: Language, finish: (text: string, severity: string) => void) => {
    if (!code) {
        return finish('Code submission should not be a blank.', 'error')
    }
    if (!problem.value) {
        return finish('Failed to access problem data.', 'error')
    }
    const res = await api.submitCode(id, {
        auth: accountStore.auth!,
        lang,
        code,
    });
    if (!res.success) {
        return finish(res.message, 'error');
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    const submission = await api.fetchSubmission(res.data!.id, accountStore.auth!);
    if (!submission.success) {
        return finish(submission.message, 'error');
    }
    finish(submission.data!.judge_result.status, 'success');
}

const path = ref<{ label?: string, link?: string }[]>([]);

const loading = ref(true);
onMounted(async () => {
    const res = await api.fetchProblem(id, {
        id: accountStore.account.id!,
        token: accountStore.account.token!
    });
    if (!res.success) {
        return toast.add({ severity: 'error', summary: 'Error', detail: res.message });
    }
    problem.value = res.data;
    path.value = [
        { label: problem.value?.owner.id, link: `/account/${problem.value?.owner.id}` },
        { label: problem.value?.title }
    ]
    loading.value = false;
})

const windowWidth = ref(window.innerWidth);
window.onresize = () => {
    windowWidth.value = window.innerWidth;
}

onUnmounted(() => {
    window.onresize = null;
})
</script>

<template>
    <div class="flex flex-col h-full">
        <UniversalToolBar :path></UniversalToolBar>
        <Splitter :gutterSize="2" class="flex-1 overflow-hidden"
            :layout="windowWidth > 768 ? 'horizontal' : 'vertical'">
            <SplitterPanel>
                <div class="flex flex-col gap-2 w-full h-full">
                    <div class="p-3 flex flex-wrap flex-row items-center justify-between w-full">
                        <Button size="small" icon="pi pi-arrow-left" plain outlined></Button>
                        <div class="inline-flex items-center gap-1">
                            <Button @click="router.push(`/problem/edit/${id}`)" icon="pi pi-pencil" size="small" plain
                                outlined></Button>
                            <Button size="small" severity="danger" icon="pi pi-trash" outlined></Button>
                        </div>
                    </div>
                    <div class="flex flex-row w-full h-full">
                        <div class="flex flex-col w-20 gap-4">
                            <Button pt:label:class="text-xs" label="Problem" icon="pi pi-code" size="small"
                                iconPos="top" plain text disabled></Button>
                            <Button pt:label:class="text-xs" label="Records" icon="pi pi-file" size="small"
                                iconPos="top" plain text disabled></Button>
                        </div>
                        <MdPreview v-if="!loading" class="!bg-transparent" :modelValue="formatProblem(problem!)"
                            :theme="themeStore.dark ? 'dark' : 'light'" codeTheme="github" previewTheme="github">
                        </MdPreview>
                        <div v-else class="flex flex-col gap-4 m-3">
                            <Skeleton height="2em" width="15vw"></Skeleton>
                            <Skeleton height="5em" width="40vw"></Skeleton>
                            <Skeleton height="2em" width="30vw"></Skeleton>
                            <Skeleton height="10em" width="40vw"></Skeleton>
                        </div>
                    </div>
                </div>
            </SplitterPanel>
            <SplitterPanel>
                <MonacoEditor :code="code" :language="language" :onSubmit>
                </MonacoEditor>
            </SplitterPanel>
        </Splitter>
    </div>
</template>

<style scoped>
:deep(.md-editor-preview-wrapper) {
    padding: 0 1em 0 1em;
}
</style>