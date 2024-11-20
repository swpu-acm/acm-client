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
    <div class="h-full flex flex-col">
        <div class="bg-gray-100 dark:bg-zinc-900 flex flex-row items-center justify-between w-full p-3">
            <div class="inline-flex justify-center items-center">
                <img :src="themeStore.dark ? '/acm-light.png' : '/acm.png'" width="40"></img>
                <h1 class="text-lg font-bold">Dashboard</h1>
            </div>
            <div class="inline-flex justify-center items-center">
                <Button @click="themeStore.toggle" :icon="`pi pi-${themeStore.dark ? 'moon' : 'sun'}`" plain
                    outlined></Button>
                <Divider layout="vertical" class="mx-2"></Divider>
                <Avatar :image="avatarUrl" shape="circle"></Avatar>
            </div>
        </div>
        <div class="dark:bg-zinc-800 position-relative sticky top-0 w-20em h-full overflow-y-auto">
            <div class="flex flex-col items-center justify-center h-full">
                <div class="inline-flex m-8 gap-8 items-center">
                    <Avatar :image="avatarUrl" shape="circle"></Avatar>
                    <span>{{ accountStore.account?.username }}</span>
                </div>
                <div class="inline-flex m-8 gap-8 items-center">
                    <Skeleton></Skeleton>
                    <Skeleton></Skeleton>
                </div>
                <div class="flex flex-col flex-1">
                    <div v-for="i in 's'.repeat(10)">
                        <h1>{{ i }}</h1>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
