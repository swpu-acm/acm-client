<script setup lang="ts">
import * as api from "@/scripts/api";
import { useAccountStore, useThemeStore } from "@/scripts/store";
import { timeAgo } from "@/scripts/time";
import { ProblemDetail, type Profile } from "@/scripts/types";
import { expandUrl } from "@/scripts/utils";
import { useToast } from "primevue";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const accountStore = useAccountStore();
const themeStore = useThemeStore();

const id = route.params.id as string;
const tab = ref<string>('overview');
const path = ref<{ label: string; to: string; }[]>([]);

const profile = ref<Profile>();

const items = ref([
    { tab: 'overview', label: 'Overview', icon: 'pi pi-desktop' },
    { tab: 'problems', label: 'Problems', icon: 'pi pi-book' },
]);

const toggleTab = (to: string) => {
    router.push(`/account/${id}?tab=${to}`);
    tab.value = to;
    switch (to) {
        case 'overview':
            break;
        case 'problems':
            onProblemTab();
            break;
    }
}

const problemList = ref<ProblemDetail[]>([]);
const loadingProblems = ref(true);
const onProblemTab = async () => {
    console.log("loading problems")
    loadingProblems.value = true;
    const res = await api.listProblems({
        identity: profile.value!.username,
        auth: accountStore.auth
    });
    if (!res.success) {
        return toast.add({ severity: "error", summary: "Error", detail: res.message });
    }
    problemList.value = res.data!;
    loadingProblems.value = false;
    console.log("loaded problems")
    console.log(problemList.value)
    console.log(loadingProblems.value)
}

watch(() => route.query.tab, (newTab) => {
    if (newTab !== undefined) {
        toggleTab(newTab as string);
    } else {
        toggleTab('overview');
    }
})

const loading = ref(true);
onMounted(async () => {
    const res = await api.fetchProfile(id);
    if (!res.success) {
        return toast.add({ severity: "error", summary: "Error", detail: res.message });
    }
    console.log(res.data)
    profile.value = res.data;
    path.value = [
        { label: profile.value!.username, to: "/" }
    ]
    loading.value = false;
})
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <UniversalToolBar :path></UniversalToolBar>
        <div class="w-full flex-1">
            <Tabs :value="tab || 'overview'">
                <TabList pt:tabList:class="!bg-gray-100 dark:!bg-zinc-900">
                    <Tab v-for="tab in items" :key="tab.label" :value="tab.tab" @click="toggleTab(tab.tab)">
                        <a v-ripple class="flex items-center gap-2 text-inherit">
                            <i :class="tab.icon"></i>
                            <span>{{ tab.label }}</span>
                        </a>
                    </Tab>
                </TabList>
                <TabPanel :value="tab" as="div" class="h-full w-full flex justify-center mx-auto">
                    <div class="w-full max-w-[1200px] flex flex-col md:flex-row my-[2em] gap-6 mx-8">
                        <div v-if="!loading && profile" class="flex flex-col h-full">
                            <div class="flex gap-4 sm:flex-col sm:gap-1">
                                <img class="w-[8em] h-[8em] sm:w-[18em] sm:h-[18em] rounded-full"
                                    :src="expandUrl(profile!.avatar)"></img>
                                <div class="flex flex-col items-start justify-center">
                                    <h3 class="text-2xl font-bold">{{ profile.nickname }}</h3>
                                    <span class="text-lg text-gray-500">{{ profile.username }} · {{ profile.sex ?
                                        'he/him' : 'she/her' }}</span>
                                </div>
                            </div>
                            <span class="my-1">{{ profile.signature }}</span>
                            <Button class="my-4" size="small" v-if="accountStore.account.username === profile.username"
                                label="Edit Profile" severity="secondary" disabled fluid></Button>
                            <div class="flex flex-col gap-2 my-2">
                                <div class="inline-flex items-center gap-2">
                                    <i class="pi pi-envelope text-gray-500"></i>
                                    <span>{{ profile.email }}</span>
                                </div>
                                <div class="inline-flex items-center gap-2">
                                    <i class="pi pi-building text-gray-500"></i>
                                    <span>{{ profile.school }}</span>
                                </div>
                                <div class="inline-flex items-center gap-2">
                                    <i class="pi pi-building-columns text-gray-500"></i>
                                    <span>{{ profile.college }}</span>
                                </div>
                                <div class="inline-flex items-center gap-2">
                                    <i class="pi pi-graduation-cap text-gray-500"></i>
                                    <span>{{ profile.major }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex-1 h-full w-full">
                            <div v-if="tab === 'overview' && !loading"
                                class="flex flex-col gap-4 justify-center items-center py-8 border dark:border-zinc-600 rounded-md">
                                <Knob :size="300" v-model="profile!.rating" readonly />
                                <span class="text-3xl text-gray-500">Rating</span>
                            </div>
                            <DataView v-if="tab === 'problems'" :value="problemList" dataKey="id" class="rounded">
                                <template #header>
                                    <div class="inline-flex flex-wrap justify-between items-center gap-4 w-full">
                                        <InputText placeholder="Find a problem..." size="small" disabled></InputText>
                                        <Button @click="router.push('/problem/create')" label="New" size="small" icon="pi pi-book"></Button>
                                    </div>
                                </template>
                                <template #empty>
                                    <div class="w-full h-full py-10 gap-4 flex flex-col items-center justify-center">
                                        <img class="w-[16em] h-[16em]" :src="themeStore.logo"></img>
                                        <span class="text-xl text-gray-500">No Problems yet, <a
                                                class="underline cursor-pointer"
                                                @click="router.push('/problem/create')">Create one?</a></span>
                                    </div>
                                </template>
                                <template v-if="loadingProblems" #list>
                                    <div v-for="i in 3" :key="i">
                                        <div class="flex flex-col xl:flex-row xl:items-start p-6 gap-6"
                                            :class="{ 'border-t border-zinc-200 dark:border-zinc-700': i !== 0 }">
                                            <Skeleton class="!w-9/12 sm:!w-64 xl:!w-40 !h-24 mx-auto" />
                                        </div>
                                    </div>
                                </template>
                                <template v-else #list="slotProps">
                                    <div v-for="problem in slotProps.items">
                                        <div
                                            class="flex flex-col items-start p-6 gap-3 border-t border-zinc-200 dark:border-zinc-700">
                                            <!-- Should add problem sequence later -->
                                            <div class="flex items-center gap-4">
                                                <h2 @click="router.push('/problem/' + problem.id)"
                                                    class="font-bold text-blue-500 dark:text-blue-400 hover:underline cursor-pointer">
                                                    {{ problem.title }}</h2>
                                                <Badge severity="secondary">{{ problem.private ? 'Private' : 'Public' }}</Badge>
                                            </div>
                                            <span class="text-sm">{{ timeAgo(problem.updated_at) }}</span>
                                        </div>
                                    </div>
                                </template>
                            </DataView>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    </div>
</template>

<style scoped></style>