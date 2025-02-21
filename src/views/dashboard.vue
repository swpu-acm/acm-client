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
import { useAccountStore } from '@/scripts/store';
import { onMounted, ref } from 'vue';
import * as api from '@/scripts/api';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue';
import type { Contest, UserProblem } from '@/scripts/types';

const path = [{ label: 'Dashboard' }];

const router = useRouter();
const toast = useToast();

const accountStore = useAccountStore();
if (!accountStore.isLoggedIn) {
    toast.add({ severity: 'info', summary: 'Login Required', detail: 'Please login first', life: 3000 });
    router.push("/login");
}

const problemList = ref<UserProblem[]>([]);
const contests = ref<Contest[]>([]);

const loadingProfile = ref(true);
const loadingProblems = ref(true);
const loadingContests = ref(true);
onMounted(async () => {
    if (!accountStore.isLoggedIn) return;
    const profile = await api.fetchProfile(accountStore.account.id!);
    if (!profile.success) {
        accountStore.logout();
        return toast.add({ severity: 'error', summary: 'Error', detail: profile.message, life: 3000 });
    }
    accountStore.mergeProfile(profile.data!);
    loadingProfile.value = false;
    const problems = await api.listProblems({
        identity: accountStore.account.id!,
        auth: {
            id: accountStore.account.id!,
            token: accountStore.account.token!
        },
        limit: 5,
    });
    if (!problems.success) {
        return toast.add({ severity: 'error', summary: 'Error', detail: problems.message, life: 3000 });
    }
    problemList.value = problems.data!;
    loadingProblems.value = false;
    const contestsRes = await api.listAllContests(accountStore.auth!);
    if (!contestsRes.success) {
        return toast.add({ severity: 'error', summary: 'Error', detail: contestsRes.message, life: 3000 });
    }
    contests.value = contestsRes.data!;
    loadingContests.value = false;
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <UniversalToolBar :path></UniversalToolBar>
        <div class="flex flex-col md:flex-row h-full w-full">
            <aside class="w-full md:w-1/3 lg:w-1/4 flex">
                <div
                    class="w-full bg-zinc-100 dark:bg-zinc-800 md:sticky md:top-0 md:bottom-0 z-30 flex flex-col md:border-r-[1.5px] dark:border-zinc-700">
                    <div class="flex flex-col top-0 px-4 overflow-auto">
                        <div v-if="!loadingProfile" class="inline-flex m-8 mb-3 gap-8 items-center">
                            <Avatar :image="accountStore.avatarUrl" shape="circle"></Avatar>
                            <span>{{ accountStore.account?.username }}</span>
                        </div>
                        <div v-else class="inline-flex m-8 mb-3 gap-8 items-center">
                            <Skeleton shape="circle" size="2rem"></Skeleton>
                            <Skeleton width="6rem" borderRadius="16px"></Skeleton>
                        </div>
                        <Divider></Divider>
                        <div class="flex flex-col flex-1 items-center">
                            <div class="flex flex-col gap-2 justify-between items-center w-full px-6">
                                <div class="flex flex-row items-center justify-between w-full">
                                    <h3 class="text-sm font-bold">Your Problems</h3>
                                    <Button @click="router.push('/problem/create')" icon="pi pi-book" label="New"
                                        size="small"></Button>
                                </div>
                                <div class="flex flex-col items-center mb-4 w-full">
                                    <div class="flex flex-col gap-3 w-full justify-start">
                                        <div v-if="loadingProblems" class="my-5 flex flex-col gap-2">
                                            <Skeleton class="w-full" height="20px"></Skeleton>
                                            <Skeleton class="w-full" height="20px"></Skeleton>
                                            <Skeleton class="w-full" height="20px"></Skeleton>
                                        </div>
                                        <div v-else-if="problemList.length === 0"
                                            class="w-full my-5 flex flex-col items-center text-gray-500 text-sm text-center">
                                            <span>No problems found,</span>
                                            <span>
                                                consider <a class="underline cursor-pointer"
                                                    @click="router.push('/problem/create')">create a
                                                    new one</a>?
                                            </span>
                                        </div>
                                        <div v-else class="flex flex-col gap-2 my-3">
                                            <div v-for="problem in problemList" class="inline-flex gap-3 items-center">
                                                <img :src="accountStore.avatarUrl" class="w-5 h-5 rounded"></img>
                                                <a @click="router.push('/problem/' + problem.id)"
                                                    class="cursor-pointer text-xs font-bold hover:underline">{{
                                                        problem.id }}</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <div class="w-full h-full flex-1">
                <div class="w-full h-full overflow-auto">
                    <div v-if="!loadingContests" class="flex flex-col items-center m-8 gap-8">
                        <Card @click="router.push('/contest/' + contest.id)" v-if="contests.length > 0"
                            v-for="contest in contests" class="w-full cursor-pointer shadow transition hover:shadow-lg">
                            <template #title>
                                <div class="flex flex-row items-center justify-between">
                                    <span class="text-lg font-bold text-blue-500">
                                        {{ contest.name }}
                                    </span>
                                    <Badge size="small" severity="success">{{ contest.mode }}</Badge>
                                </div>
                            </template>
                            <template #subtitle>
                                <span class="text-xs lg:text-sm">西南石油大学 ACM 学会</span>
                            </template>
                            <template #content>
                                <p class="m-0 text-sm text-gray-500"> {{ contest.description }}</p>
                            </template>
                            <template #footer>
                                <div class="flex flex-row items-center justify-between">
                                    <span class="text-xs">From {{ contest.start_time }} to {{ contest.end_time }}</span>
                                </div>
                            </template>
                        </Card>
                        <div v-else class="w-full my-5 flex flex-col items-center text-gray-500 text-sm text-center">
                            <span>No contests found.</span>
                        </div>
                    </div>
                    <div v-else class="w-full h-full flex items-center justify-center">
                        <ProgressSpinner></ProgressSpinner>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
