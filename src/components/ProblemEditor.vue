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
import { type FileUploadSelectEvent, usePrimeVue, useToast } from 'primevue';
import { computed, onMounted, reactive, ref } from 'vue';
import * as api from "@/scripts/api";
import { useRouter } from 'vue-router';
import { useAccountStore } from '@/scripts/store';
import { ProblemVisibility, type RecordId, type Sample, type TestCase } from '@/scripts/types';

const router = useRouter();
const toast = useToast();
const $primevue = usePrimeVue();

const accountStore = useAccountStore();

const props = defineProps<{ id?: string }>();
const loading = ref(props.id ? true : false);
const path = ref<{ label?: string, link?: string }[]>(props.id ? [] : [{ label: 'New Problem' }])
onMounted(async () => {
    if (props.id) {
        const res = await api.fetchProblem(props.id, accountStore.auth);
        if (!res.success) {
            return toast.add({ severity: 'error', summary: 'Error', detail: res.message });
        }
        const data = res.data!;
        title.value = data.title;
        description.value = data.description;
        input.value = data.input || '';
        output.value = data.output || '';
        samples.splice(0, samples.length);
        data.samples.forEach(sample => samples.push({ input: sample.input, output: sample.output }));
        hint.value = data.hint || '';
        testCases.splice(0, testCases.length);
        data.test_cases?.forEach(tc => testCases.push({ input: tc.input, output: tc.output }));

        path.value = [{ label: res.data?.owner.id, link: `/account/${res.data?.owner.id}` }, { label: title.value, link: `/problem/${props.id}` }, { label: 'Edit' }]

        loading.value = false;
    }
})

const title = ref('');
const description = ref('');
const input = ref<string>('');
const output = ref<string>('');
const samples = reactive<Sample[]>([{ input: '', output: '' }]);
const hint = ref<string>('');
const owner = ref<string>(accountStore.account.id!);
const visibility = ref<ProblemVisibility>(ProblemVisibility.Public);
const testCases = reactive<TestCase[]>([]);

const timeLimit = ref<number>(1000);
const memoryLimit = ref<number>(128);

interface ProblemForm<T, N> {
    title: T;
    description: T;
    input?: T;
    output?: T;
    samples: { input: T, output: T }[];
    hint?: T;
    time_limit: N;
    memory_limit: N;
    test_cases: { input: T, output: T }[];
    owner: RecordId,
    categories: string[];
    tags: string[];
    visibility: ProblemVisibility;
}

const validate = (form: ProblemForm<string, number>): boolean => {
    if (!form.title || form.title.trim() === '') {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Title should not be a blank', life: 3000 });
        return false;
    } else if (form.title.length > 32) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Title is too long (max 32 characters)', life: 3000 });
        return false;
    }
    if (!form.description || form.description.trim() === '') {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Description should not be a blank', life: 3000 });
        return false;
    } else if (form.description.length > 2000) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Description is too long (max 2000 characters)', life: 3000 });
        return false;
    }
    return true;
}

const inProgress = ref(false);
const onCreateProblem = async () => {
    if (totalSizePercent.value !== 100) {
        uploadingTestCases.value = true;
        await uploadTestCases(() => {
            uploadingTestCases.value = false;
        })
    }
    const problem: ProblemForm<string, number> = {
        title: title.value,
        description: description.value,
        input: input.value || undefined,
        output: output.value || undefined,
        samples: samples.map(sample => ({ input: sample.input, output: sample.output })),
        hint: hint.value || undefined,
        time_limit: timeLimit.value,
        memory_limit: memoryLimit.value * 1024 * 1024,
        test_cases: testCases.map(tc => ({ input: tc.input, output: tc.output })),
        owner: {
            tb: "account",
            id: owner.value
        },
        categories: [],
        tags: [],
        visibility: visibility.value,
    }
    const valid = validate(problem);
    if (!valid) return;

    if (inProgress.value) return;
    inProgress.value = true;
    let res;
    if (props.id) {
        res = await api.updateProblem(props.id, {
            id: accountStore.account.id!,
            token: accountStore.account.token!,
            ...problem,
        });
    } else {
        res = await api.createProblem({
            id: accountStore.account.id!,
            token: accountStore.account.token!,
            ...problem,
        });
    }
    if (!res.success) {
        inProgress.value = false;
        return toast.add({ severity: 'error', summary: 'Error', detail: res.message, life: 3000 });
    }
    inProgress.value = false;
    const id = res.data?.id ?? props.id;
    router.push(`/problem/${id}`);
}

const totalSize = ref(0);
const totalUploadedSize = ref(0);
const totalSizePercent = computed(() => (totalUploadedSize.value / totalSize.value) * 100);
const normalizedFiles = ref<{ input?: File, output?: File }[]>([]);

const onRemoveTemplatingFile = (
    type: 'input' | 'output',
    context: {
        removeFileCallback: (index: number) => void,
        plainFiles: File[],
        normalizedIndex: number,
    }
) => {
    const testCase = normalizedFiles.value[context.normalizedIndex];
    const fileRemoved = type === 'input' ? testCase.input! : testCase.output!;
    testCase[type] = undefined;
    if (!testCase.input && !testCase.output) {
        normalizedFiles.value.splice(context.normalizedIndex, 1);
    }
    context.removeFileCallback(context.plainFiles.indexOf(fileRemoved));
    totalSize.value -= parseInt(formatSize(fileRemoved.size));
    return true;
};

const onClearTemplatingUpload = (clear: () => void) => {
    clear();
    totalSize.value = 0;
    totalUploadedSize.value = 0;
};

const onSelectedFiles = (event: FileUploadSelectEvent) => {
    normalizedFiles.value = normalizeFiles(event.files);

    event.files.forEach((file: File) => {
        totalSize.value += parseInt(formatSize(file.size));
    });

    totalUploadedSize.value = 0;
};

const uploadingTestCases = ref(false);
const uploadTestCases = async (callback: () => void) => {
    uploadingTestCases.value = true;
    normalizedFiles.value.forEach(async (fileTuple) => {
        if (!fileTuple.input) {
            return toast.add({ severity: 'error', summary: 'Error', detail: 'Input file not found for ' + fileTuple.output?.name, life: 3000 });
        } else if (!fileTuple.output) {
            return toast.add({ severity: 'error', summary: 'Error', detail: 'Output file not found for ' + fileTuple.input?.name, life: 3000 });
        }

        const res = await api.uploadContent({
            auth: accountStore.auth!,
            owner: `account:${accountStore.account.id}`,
            file: fileTuple.input,
        })
        if (!res.success) {
            return toast.add({ severity: 'error', summary: 'Error', detail: res.message, life: 3000 });
        } else {
            totalUploadedSize.value += parseInt(formatSize(fileTuple.input.size));
        }

        const outputRes = await api.uploadContent({
            auth: accountStore.auth!,
            owner: `account:${accountStore.account.id}`,
            file: fileTuple.output,
        })
        if (!outputRes.success) {
            return toast.add({ severity: 'error', summary: 'Error', detail: outputRes.message, life: 3000 });
        } else {
            totalUploadedSize.value += parseInt(formatSize(fileTuple.output.size));
        }

        testCases.push({
            input: res.data!.id,
            output: outputRes.data!.id,
        })
        normalizedFiles.value.splice(normalizedFiles.value.indexOf(fileTuple), 1);
        uploadingTestCases.value = false;
    });
    callback();
}

const normalizeFiles = (files: File[]) => {
    const normalizedFiles: { input?: File, output?: File }[] = [];

    files.forEach((file) => {
        const dotIndex = file.name.lastIndexOf('.');
        const fileName = file.name.substring(0, dotIndex);
        const extension = file.name.substring(dotIndex + 1);

        if (extension === 'in') {
            const index = normalizedFiles.findIndex(f => f.output?.name === fileName + '.out');
            if (index !== -1) {
                normalizedFiles[index].input = file;
            } else {
                normalizedFiles.push({ input: file });
            }
        } else if (extension === 'out') {
            const index = normalizedFiles.findIndex(f => f.input?.name === fileName + '.in');
            if (index !== -1) {
                normalizedFiles[index].output = file;
            } else {
                normalizedFiles.push({ output: file });
            }
        }
    });

    return normalizedFiles;
}

const formatSize = (bytes: number) => {
    const k = 1024;
    const dm = 3;
    const sizes = $primevue.config.locale?.fileSizeTypes || [0];

    if (bytes === 0) {
        return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
};

const onRemoveTestCases = async (testCase: TestCase) => {
    const removeInput = await api.removeAsset(testCase.input, accountStore.auth!);
    const removeOutput = await api.removeAsset(testCase.output, accountStore.auth!);
    if (!removeInput.success || !removeOutput.success) {
        return toast.add({ severity: 'error', summary: 'Error', detail: removeInput.message || removeOutput.message, life: 3000 });
    }
    const index = testCases.indexOf(testCase);
    if (index !== -1) {
        testCases.splice(index, 1);
    }
}
</script>

<template>
    <UniversalToolBar :path></UniversalToolBar>
    <div class="flex flex-col w-full h-full max-w-full md:max-w-[768px] mx-auto">
        <div v-if="loading" class="w-full h-full flex items-center justify-center">
            <ProgressSpinner></ProgressSpinner>
        </div>
        <Panel v-else class="mt-10">
            <div class="flex flex-col gap-8">
                <div v-if="!props.id" class="mt-10 text-center">
                    <span class="text-gray-500 mb-4">Share your algorithm problem with the community</span>
                    <h1 class="text-3xl font-bold mb-4">Create a new algorithm problem</h1>
                </div>
                <div v-else class="mt-10 text-center">
                    <span class="text-gray-500 mb-4">Edit your algorithm problem</span>
                    <h1 class="text-3xl font-bold mb-4">Edit Problem</h1>
                </div>
                <div class="flex flex-col gap-8">
                    <div class="flex flex-col gap-1">
                        <InputText v-model="title" type="text" name="title" placeholder="Problem Title" fluid>
                        </InputText>
                    </div>
                    <MarkdownEditor v-model="description" placeholder="Problem Description" id="description" />
                    <MarkdownEditor v-model="input" placeholder="Input Format" id="input" />
                    <MarkdownEditor v-model="output" placeholder="Output Format" id="output" />
                    <Divider class="!mb-0"></Divider>
                    <div class="flex flex-row justify-end items-center">
                        <Button type="button" class="mr-2" outlined @click="samples.push({ input: '', output: '' })">Add
                            Sample</Button>
                    </div>
                    <div v-for="(sample, index) in samples" :key="index" class="flex flex-col gap-2">
                        <div class="flex flex-row justify-between items-center">
                            <label class="text-gray-500">Sample #{{ index + 1 }}</label>
                            <Button @click="samples.splice(index, 1)" icon="pi pi-times" plain text></Button>
                        </div>
                        <div class="flex flex-row gap-2 min-h-40">
                            <Textarea v-model:modelValue="sample.input" placeholder="Example Input"
                                class="w-full"></Textarea>
                            <Textarea v-model:modelValue="sample.output" placeholder="Example Output"
                                class="w-full"></Textarea>
                        </div>
                    </div>
                    <Divider class="!m-0"></Divider>
                    <MarkdownEditor v-model="hint" placeholder="Hint" id="hint" />
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup>
                            <InputGroupAddon>
                                <i class="pi pi-clock"></i>
                            </InputGroupAddon>
                            <InputNumber v-model="timeLimit" placeholder="Time Limit" />
                            <InputGroupAddon>ms</InputGroupAddon>
                        </InputGroup>
                        <InputGroup>
                            <InputGroupAddon>
                                <i class="pi pi-box"></i>
                            </InputGroupAddon>
                            <InputNumber v-model="memoryLimit" placeholder="Time Limit" />
                            <InputGroupAddon>MB</InputGroupAddon>
                        </InputGroup>
                        <InputGroup>
                            <InputGroupAddon>
                                <i class="pi pi-building"></i>
                            </InputGroupAddon>
                            <Select
                                :options="[{ label: accountStore.account.username, value: accountStore.account.id }]"
                                optionLabel="label" optionValue="value" placeholder="Owner" v-model="owner"></Select>
                        </InputGroup>
                        <InputGroup>
                            <InputGroupAddon>
                                <i class="pi pi-eye"></i>
                            </InputGroupAddon>
                            <Select :options="Object.values(ProblemVisibility)" placeholder="Visibility"
                                v-model="visibility"></Select>
                        </InputGroup>
                    </div>
                    <FileUpload customUpload :multiple="true" accept=".in,.out" :maxFileSize="64 * 1024 * 1024"
                        @select="onSelectedFiles">
                        <template #header="{ chooseCallback, clearCallback, files }">
                            <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
                                <div class="flex gap-2">
                                    <Button @click="chooseCallback" icon="pi pi-file-arrow-up" rounded outlined
                                        severity="secondary"></Button>
                                    <Button icon="pi pi-clipboard" rounded outlined severity="info" disabled></Button>
                                    <Button @click="uploadTestCases(clearCallback)" icon="pi pi-cloud-upload" rounded
                                        outlined severity="success" :disabled="!files || files.length === 0"></Button>
                                    <Button @click="onClearTemplatingUpload(clearCallback)" icon="pi pi-times" rounded
                                        outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                                </div>
                                <ProgressBar :value="totalSizePercent" :showValue="false"
                                    class="md:w-20rem h-1 w-full md:ml-auto">
                                </ProgressBar>
                            </div>
                        </template>
                        <template #content="{ files, removeFileCallback, messages }">
                            <div class="flex flex-col gap-8 pt-4">
                                <Message v-for="message of messages" :key="message" severity="error">
                                    {{ message }}
                                </Message>

                                <div v-if="normalizedFiles.length > 0">
                                    <h5>Pending</h5>
                                    <div class="flex flex-wrap gap-4">
                                        <div v-for="(testCase, normalizedIndex) of normalizedFiles"
                                            :key="normalizedIndex"
                                            class="p-8 rounded border border-zinc-200 dark:border-zinc-700">
                                            <div class="flex flex-row justify-between items-center">
                                                <div v-if="testCase.input" class="flex flex-col gap-4 items-center">
                                                    <span
                                                        class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{
                                                            testCase.input?.name }}</span>
                                                    <div>{{ formatSize(testCase.input?.size || 0) }}</div>
                                                    <Badge value="Pending" severity="warn" />
                                                    <Button icon="pi pi-times"
                                                        @click="onRemoveTemplatingFile('input', { removeFileCallback, plainFiles: files, normalizedIndex })"
                                                        outlined rounded severity="danger"></Button>
                                                </div>
                                                <Divider v-if="testCase.input && testCase.output" layout="vertical">
                                                </Divider>
                                                <div v-if="testCase.output" class="flex flex-col gap-4 items-center">
                                                    <span
                                                        class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{
                                                            testCase.output?.name }}</span>
                                                    <div>{{ formatSize(testCase.output?.size || 0) }}</div>
                                                    <Badge value="Pending" severity="warn" />
                                                    <Button icon="pi pi-times"
                                                        @click="onRemoveTemplatingFile('output', { removeFileCallback, plainFiles: files, normalizedIndex })"
                                                        outlined rounded severity="danger"></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template #empty>
                            <div class="flex items-center justify-center flex-col">
                                <i
                                    class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color" />
                                <p class="mt-6 mb-0">Drag and drop test cases to here to upload.</p>
                            </div>
                        </template>
                    </FileUpload>
                    <DataTable v-if="testCases.length > 0" :value="testCases" tableStyle="w-full" showGridlines>
                        <Column field="input" header="Input"></Column>
                        <Column field="output" header="Output"></Column>
                        <Column :exportable="false" style="min-width: 12rem">
                            <template #body="slotProps">
                                <Button icon="pi pi-trash" outlined rounded severity="danger"
                                    @click="onRemoveTestCases(slotProps.data)"></Button>
                            </template>
                        </Column>
                    </DataTable>
                    <Button @click="onCreateProblem" type="submit" label="Save Changes" :loading="inProgress"
                        :disabled="uploadingTestCases"></Button>
                </div>
            </div>
        </Panel>
    </div>
</template>
