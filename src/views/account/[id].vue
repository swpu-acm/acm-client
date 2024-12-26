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
import * as api from "@/scripts/api";
import { useAccountStore, useThemeStore } from "@/scripts/store";
import { timeAgo } from "@/scripts/time";
import { UserProblem, type Profile } from "@/scripts/types";
import { expandAssetUrl } from "@/scripts/utils";
import { useToast } from "primevue";
import { onMounted, reactive, Ref, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const accountStore = useAccountStore();
const themeStore = useThemeStore();

const id = route.params.id as string;
const tab = ref<string>('overview');
const path = ref<{ label: string; link: string; }[]>([]);

const profile = ref<Profile>();

const items = ref([
    { tab: 'overview', label: 'Overview', icon: 'pi pi-desktop' },
    { tab: 'problems', label: 'Problems', icon: 'pi pi-book' },
]);

const toggleTab = async (to: string) => {
    router.push(`/account/${id}?tab=${to}`);
    tab.value = to;
    switch (to) {
        case 'overview':
            break;
        case 'problems':
            await onProblemTab();
            break;
    }
}

const problemList = ref<UserProblem[]>([]);
problemList.value.length = 1;

const loadingProblems = ref(true);
const onProblemTab = async () => {
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
}

watch(() => route.query.tab, async (newTab) => {
    if (newTab !== undefined) {
        await toggleTab(newTab as string);
    } else {
        await toggleTab('overview');
    }
})

const loading = ref(true);
onMounted(async () => {
    const res = await api.fetchProfile(id);
    if (!res.success) {
        return toast.add({ severity: "error", summary: "Error", detail: res.message });
    }
    profile.value = res.data;
    path.value = [
        { label: profile.value!.username, link: `/account/${id}` }
    ]
    loading.value = false;
    await toggleTab(route.query.tab as string || 'overview');
})

const editingProfile = ref(false);
const sexOptions = [
    { label: 'He/Him', value: true },
    { label: 'She/Her', value: false }
]
const initialValues = reactive<Profile | {}>({
    sex: profile.value?.sex || false,
});
const onEditProfile = () => {
    editingProfile.value = true;
    Object.assign(initialValues, profile.value);
}

type Form<T> = {
    [P in keyof T]: Ref<T[P]>;
};

const inProgress = ref(false);
const onSaveProfile = async ({ states }: { states: Form<Profile> }) => {
    if (inProgress.value) return;
    inProgress.value = true;
    const data: Partial<Profile> = {
        nickname: states.nickname?.value?.trim() || '',
        signature: states.signature?.value?.trim() || '',
        sex: states.sex?.value || false,
        school: states.school?.value?.trim() || '',
        college: states.college?.value?.trim() || '',
        major: states.major?.value?.trim() || '',
    };
    const res = await api.updateProfile({
        id: accountStore.account.id!,
        token: accountStore.account.token!,
        profile: data,
    });
    if (!res.success) {
        inProgress.value = false;
        return toast.add({ severity: "error", summary: "Error", detail: res.message });
    }
    Object.assign(profile.value!, data);
    Object.assign(accountStore.account, profile.value);
    editingProfile.value = false;
    inProgress.value = false;
    toast.add({ severity: "success", summary: "Profile updated", detail: "Your profile has been updated." });
}
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <UniversalToolBar :path :separateBottom="false"></UniversalToolBar>
        <div class="w-full flex-1">
            <Tabs :value="tab || 'overview'">
                <TabList pt:tabList:class="!bg-gray-100 dark:!bg-zinc-900 px-5">
                    <Tab class="!py-2" v-for="tab in items" :key="tab.label" :value="tab.tab"
                        @click="toggleTab(tab.tab)">
                        <a v-ripple class="flex items-center gap-2 text-inherit">
                            <i :class="tab.icon"></i>
                            <span>{{ tab.label }}</span>
                        </a>
                    </Tab>
                </TabList>
                <TabPanel :value="tab" as="div" class="h-full w-full flex justify-center mx-auto">
                    <div class="w-full max-w-[1200px] flex flex-col md:flex-row my-[2em] gap-6 mx-8">
                        <div v-if="!loading && profile" class="flex flex-col h-full md:w-[18em]">
                            <div class="flex w-full flex-row md:flex-col gap-4">
                                <div class="flex-shrink-0 w-[8em] md:w-[18em]"
                                    @click="accountStore.account?.username === profile.username && router.push('/settings/profile')">
                                    <img v-if="profile?.avatar"
                                        class="rounded-full border-[2px] border-zinc-300 dark:border-zinc-700"
                                        :class="{ 'cursor-pointer': accountStore.account?.username === profile.username }"
                                        :src="expandAssetUrl(profile.avatar!)"></img>
                                    <Avatar v-else pt:root:class="!w-[8em] md:!w-[18em] !h-[8em] md:!h-[18em]"
                                        pt:label:class="text-4xl md:text-9xl" :label="(profile?.nickname ?? '?')[0]"
                                        :class="{ 'cursor-pointer': accountStore.account?.username === profile.username }"
                                        shape="circle" class="border-[2px] border-zinc-300 dark:border-zinc-700">
                                    </Avatar>
                                </div>
                                <div v-if="!editingProfile" class="flex items-start justify-center gap-1 flex-col">
                                    <h3 class="text-2xl font-bold">{{ profile.nickname }}</h3>
                                    <span class="text-lg text-gray-500">{{ profile.username }} · {{ profile.sex ?
                                        'he/him' : 'she/her' }}</span>
                                </div>
                            </div>

                            <div v-if="!editingProfile" class="mt-4 flex flex-col">
                                <span v-if="profile.signature" class="my-1">{{ profile.signature }}</span>
                                <Button @click="onEditProfile" class="my-4" size="small"
                                    v-if="accountStore.account?.username === profile.username" label="Edit Profile"
                                    severity="secondary" fluid></Button>
                                <div class="flex flex-col gap-2 my-2">
                                    <div v-if="profile.school" class="inline-flex items-center gap-2">
                                        <i class="pi pi-building text-gray-500"></i>
                                        <span>{{ profile.school }}</span>
                                    </div>
                                    <div v-if="profile.college" class="inline-flex items-center gap-2">
                                        <i class="pi pi-building-columns text-gray-500"></i>
                                        <span>{{ profile.college }}</span>
                                    </div>
                                    <div v-if="profile.major" class="inline-flex items-center gap-2">
                                        <i class="pi pi-graduation-cap text-gray-500"></i>
                                        <span>{{ profile.major }}</span>
                                    </div>
                                </div>
                            </div>
                            <Form v-else :initialValues @submit="onSaveProfile" class="mt-4 flex flex-col gap-4">
                                <div class="flex flex-col gap-1">
                                    <label for="nickname" class="text-sm">Nickname</label>
                                    <InputText size="small" placeholder="Nickname" name="nickname" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-sm">Bio</label>
                                    <!-- Should be `bio` instead of `signature` later -->
                                    <Textarea size="small" placeholder="Add a bio" name="signature"></Textarea>
                                    <span class="text-xs">You can <span class="font-bold">@mention</span> other users
                                        and organizations to link to them.</span>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm">Pronouns</label>
                                    <Select size="small" :options="sexOptions" optionLabel="label" optionValue="value"
                                        name="sex"></Select>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <div class="inline-flex items-center gap-2">
                                        <i class="pi pi-building text-gray-500"></i>
                                        <InputText size="small" placeholder="School" name="school" fluid>
                                        </InputText>
                                    </div>
                                    <div class="inline-flex items-center gap-2">
                                        <i class="pi pi-building-columns text-gray-500"></i>
                                        <InputText size="small" placeholder="College" name="college" fluid>
                                        </InputText>
                                    </div>
                                    <div class="inline-flex items-center gap-2">
                                        <i class="pi pi-graduation-cap text-gray-500"></i>
                                        <InputText size="small" placeholder="Major" name="major" fluid></InputText>
                                    </div>
                                </div>
                                <div class="flex flex-row flex-wrap gap-2">
                                    <Button size="small" label="Save" type="submit" :loading="inProgress"></Button>
                                    <Button size="small" label="Cancel" @click="editingProfile = false"
                                        severity="secondary"></Button>
                                </div>
                            </Form>
                        </div>
                        <div class="flex-1 h-full w-full">
                            <Panel v-if="tab === 'overview' && !loading" header="Profile"
                                class="border dark:border-zinc-600">
                                <div class="py-8 flex flex-col gap-4 justify-center items-center">
                                    <Knob :size="300" v-model="profile!.rating" readonly />
                                    <span class="text-3xl text-gray-500">Rating</span>
                                </div>
                            </Panel>

                            <Panel v-if="tab === 'problems'" pt:header:class="!hidden" pt:content:class="!p-[1.125rem]">
                                <DataView :value="problemList" dataKey="id">
                                    <template #header>
                                        <div class="inline-flex flex-wrap justify-between items-center gap-4 w-full">
                                            <InputText placeholder="Find a problem..." size="small" disabled>
                                            </InputText>
                                            <Button @click="router.push('/problem/create')" label="New" size="small"
                                                icon="pi pi-book"></Button>
                                        </div>
                                    </template>
                                    <template #empty>
                                        <div
                                            class="w-full h-full py-10 gap-4 flex flex-col items-center justify-center">
                                            <img class="w-[16em] h-[16em]" :src="themeStore.logo"></img>
                                            <span class="text-sm md:text-lg text-gray-500">No problems yet, <a
                                                    class="underline cursor-pointer"
                                                    @click="router.push('/problem/create')">Create one?</a></span>
                                        </div>
                                    </template>
                                    <template v-if="loadingProblems" #list>
                                        <div v-for="i in 3" :key="i">
                                            <div class="flex flex-col items-start p-6 gap-3"
                                                :class="{ 'border-t border-zinc-200 dark:border-zinc-700': i !== 0 }">
                                                <Skeleton height="2em" width="10em"></Skeleton>
                                                <Skeleton></Skeleton>
                                                <Skeleton width="3em"></Skeleton>
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else #list="slotProps">
                                        <div v-for="(problem, index) in slotProps.items">
                                            <div class="flex flex-col items-start p-6 gap-3"
                                                :class="{ 'border-t border-zinc-200 dark:border-zinc-700': index !== 0 }">
                                                <!-- Should add problem sequence later -->
                                                <div class="flex items-center gap-4">
                                                    <h2 @click="router.push('/problem/' + problem.id)"
                                                        class="font-bold text-blue-500 dark:text-blue-400 hover:underline cursor-pointer">
                                                        {{ problem.title }}</h2>
                                                    <Badge severity="secondary">{{ problem.private ? 'Private' :
                                                        'Public' }}
                                                    </Badge>
                                                </div>
                                                <span class="text-sm">Updated {{ timeAgo(problem.updated_at) }}</span>
                                            </div>
                                        </div>
                                    </template>
                                </DataView>
                            </Panel>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    </div>
</template>

<style scoped></style>
