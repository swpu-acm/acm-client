<script setup lang="ts">
import { useAccountStore, useThemeStore } from '@/scripts/store';
import { expandUrl } from '@/scripts/utils';
import { computed, onMounted, ref } from 'vue';
import * as api from '@/scripts/api';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue';

const router = useRouter();
const toast = useToast();

const accountStore = useAccountStore();
if (!accountStore.isLoggedIn) {
    toast.add({ severity: 'info', summary: 'Login Required', detail: 'Please login first', life: 3000 });
    router.push("/login");
}

const themeStore = useThemeStore();

const avatarUrl = computed(() => expandUrl(accountStore.account?.avatar));

const loadingProfile = ref(true);
onMounted(async () => {
    if (!accountStore.isLoggedIn) return;
    const response = await api.fetchProfile({
        id: accountStore.account?.id!,
        token: accountStore.account?.token!,
    });
    if (!response.success) {
        return toast.add({ severity: 'error', summary: 'Error', detail: response.message });
    }
    accountStore.mergeProfile(response.data!);
    loadingProfile.value = false;
})
</script>

<template>
    <div class="min-h-screen h-screen flex flex-col">
        <div class="bg-gray-100 dark:bg-zinc-900 flex flex-row items-center justify-between w-full p-3 flex-wrap">
            <div class="inline-flex justify-center items-center">
                <img :src="themeStore.dark ? '/acm-light.png' : '/acm.png'" width="40"></img>
                <h1 class="text-lg font-bold">Dashboard</h1>
            </div>
            <div class="inline-flex justify-center items-center">
                <Button @click="themeStore.toggle" :icon="`pi pi-${themeStore.dark ? 'moon' : 'sun'}`" plain
                    outlined></Button>
                <Divider layout="vertical" class="mx-2"></Divider>
                <Avatar :image="avatarUrl" class="!cursor-pointer" shape="circle"></Avatar>
            </div>
        </div>
        <div class="flex flex-col md:flex-row h-full w-full">
            <aside class="w-full md:w-1/3 lg:w-1/4 flex">
                <div
                    class="w-full bg-zinc-50 dark:bg-zinc-800 md:sticky md:top-0 md:bottom-0 z-30 flex flex-col min-h-50vh max-h-screen">
                    <div class="flex flex-col top-0 px-4 overflow-auto">
                        <div v-if="!loadingProfile" class="inline-flex m-8 mb-3 gap-8 items-center">
                            <Avatar :image="avatarUrl" shape="circle"></Avatar>
                            <span>{{ accountStore.account?.username }}</span>
                        </div>
                        <div v-if="loadingProfile" class="inline-flex m-8 mb-3 gap-8 items-center">
                            <Skeleton shape="circle" size="2rem"></Skeleton>
                            <Skeleton width="6rem" borderRadius="16px"></Skeleton>
                        </div>
                        <Divider></Divider>
                        <div class="flex flex-col flex-1">
                            <div class="flex flex-col items-center mb-4">
                                <Image :src="themeStore.logo"></Image>
                                <span>Coming soon...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <div class="w-full h-full flex-1">
                <div class="flex flex-col items-center mb-4">
                    <Image :src="themeStore.logo"></Image>
                    <span>Coming soon...</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
