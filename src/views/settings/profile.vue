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
import type { Profile } from '@/scripts/types';
import { reactive, ref, shallowReactive } from 'vue';
import { useRouter } from 'vue-router';
import * as api from '@/scripts/api';
import { useConfirm, useToast, type FileUploadSelectEvent } from 'primevue';
import VuePictureCropper, { cropper } from 'vue-picture-cropper'

const router = useRouter();
const accountStore = useAccountStore();

if (accountStore.isLoggedIn === false) {
    router.push('/login');
}

const path = [{ label: 'Settings' }]

const sideBar = [{
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => router.push('/settings/profile')
}]

const initialProfileValues = reactive(accountStore.account);
const sexOptions = [
    { label: 'He/Him', value: true },
    { label: 'She/Her', value: false }
]

const updatingProfile = ref(false);
const updateProfileStatus = shallowReactive({
    message: '',
    severity: 'info',
});
const onUpdatingProfile = async ({ states }: { states: any }) => {
    if (updatingProfile.value) return;
    updatingProfile.value = true;
    const data: Partial<Profile> = {
        nickname: states.nickname?.value?.trim() || '',
        signature: states.signature?.value?.trim() || '',
        sex: states.sex?.value || false,
        school: states.school?.value?.trim() || '',
        college: states.college?.value?.trim() || '',
        major: states.major?.value?.trim() || '',
        name: states.name?.value?.trim() || '',
        student_id: states.student_id?.value?.trim() || '',
    };
    const res = await api.updateProfile({
        id: accountStore.account.id!,
        token: accountStore.account.token!,
        profile: data,
    });
    if (!res.success) {
        updatingProfile.value = false;
        updateProfileStatus.message = res.message;
        updateProfileStatus.severity = 'error';
        return;
    }
    Object.assign(accountStore.account, data);
    updatingProfile.value = false;
    updateProfileStatus.message = 'Your profile has been updated.';
    updateProfileStatus.severity = 'success';
}

const uploadingAvatar = ref(false);
const avatarString = ref('');
const isShowAvatarCutter = ref(false);
const confirm = useConfirm();
const toast = useToast();
const selectAvatar = async (event: FileUploadSelectEvent) => {
    uploadingAvatar.value = true
    avatarString.value = ''

    const file = event.files[0];
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
        // Update the picture source of the `img` prop
        avatarString.value = String(reader.result)

        // Show the cutter
        isShowAvatarCutter.value = true
        confirm.require({
            group: 'templating',
            header: 'Crop your avatar',
            rejectProps: {
                label: 'Cancel',
                icon: 'pi pi-times',
                outlined: true,
                size: 'small'
            },
            acceptProps: {
                label: 'Save',
                icon: 'pi pi-check',
                size: 'small'
            },
            accept: async () => {
                if (!cropper) return;
                const cropped = await cropper.getFile({
                    fileName: file.name,
                })
                if (cropped) {
                    const res = await api.uploadContent({
                        auth: accountStore.auth!,
                        owner: `account:${accountStore.account!.id}`,
                        file: cropped,
                    })
                    if (!res.success) {
                        uploadingAvatar.value = false
                        return toast.add({ severity: "error", summary: "Upload failed", detail: res.message });
                    }
                    const profileRes = await api.updateProfile({
                        id: accountStore.account!.id!,
                        token: accountStore.account!.token!,
                        profile: {
                            avatar: res.data!.id,
                        },
                    })
                    if (!profileRes.success) {
                        uploadingAvatar.value = false
                        return toast.add({ severity: "error", summary: "Update failed", detail: profileRes.message });
                    }
                    accountStore.account!.avatar = res.data!.id;
                    toast.add({ severity: "success", summary: "Avatar uploaded", detail: "Your new avatar has been saved.", life: 3000 });
                } else {
                    toast.add({ severity: "error", summary: "Crop failed", detail: "Failed to initialize cropper." });
                }
                uploadingAvatar.value = false
            },
            reject: () => {
                avatarString.value = ''
                uploadingAvatar.value = false
            }
        })
    }
}
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <UniversalToolBar :path></UniversalToolBar>
        <div class="w-full flex-1">
            <div class="w-full h-full flex flex-col max-w-[1280px] mx-auto">
                <div class="m-4 flex flex-row items-center justify-between flex-wrap">
                    <div class="flex flex-row items-center">
                        <Avatar size="large" shape="circle" v-if="accountStore.account?.avatar"
                            :image="accountStore.avatarUrl"></Avatar>
                        <Avatar size="large" shape="circle" v-else :label="(accountStore.account.nickname || '?')[0]">
                        </Avatar>
                        <div class="ml-4">
                            <a @click="router.push(`/account/${accountStore.account.username}`)"
                                class="text-xl font-bold hover:underline underline-offset-2 decoration-2 cursor-pointer">
                                {{ accountStore.account.nickname ? accountStore.account.nickname + ' ' : '' }}
                                <span class="text-gray-500">({{ accountStore.account.username }})</span>
                            </a>
                        </div>
                    </div>
                    <Button size="small" label="Go to your personal profile" severity="secondary"
                        @click="router.push(`/account/${accountStore.account.username}`)"></Button>
                </div>
                <div class="m-2 flex flex-col md:flex-row gap-4">
                    <div class="w-full md:w-[16em] lg:w-[18em]">
                        <Menu :model="sideBar"></Menu>
                    </div>
                    <div class="mx-4 flex flex-col flex-1">
                        <h2 class="text-2xl font-bold">Public Profile</h2>
                        <Divider></Divider>
                        <div class="flex flex-col-reverse md:flex-row gap-6">
                            <Form @submit="onUpdatingProfile" :initialValues="initialProfileValues"
                                class="flex flex-col gap-6">
                                <div class="flex flex-col gap-1">
                                    <label class="font-bold">Nickname</label>
                                    <InputText name="nickname" size="small" fluid></InputText>
                                    <span class="text-gray-400 text-xs md:text-sm">
                                        Your name may appear around AlgoHub where you participate.
                                        Never mind, you can remove it at any time.
                                    </span>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="font-bold">Bio</label>
                                    <Textarea size="small" placeholder="Tell us a little bit about yourself"
                                        name="signature" rows="3"></Textarea>
                                    <span class="text-gray-400 text-xs md:text-sm">
                                        You can <span class="font-bold">@mention</span> other users and organizations to
                                        link to them.
                                    </span>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="font-bold">Pronouns</label>
                                    <Select size="small" :options="sexOptions" name="sex" optionLabel="label"
                                        optionValue="value"></Select>
                                    <span class="text-gray-400 text-xs md:text-sm">
                                        You can only select male or female pronouns, other options are not welcomed.
                                    </span>
                                </div>
                                <!-- <div class="flex flex-col gap-1">
                                    <label class="font-bold">Birthday</label>
                                    {{ $form.birthday }}
                                    <DatePicker v-model:modelValue="" size="small" name="birthday" placeholder="Select your birthday">
                                    </DatePicker>
                                </div> -->
                                <div class="flex flex-col gap-2">
                                    <label class="font-bold">Education</label>
                                    <div class="flex flex-col gap-2">
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
                                        <div class="inline-flex items-center gap-2">
                                            <i class="pi pi-user text-gray-500"></i>
                                            <InputText size="small" placeholder="Name" name="name" fluid></InputText>
                                        </div>
                                        <div class="inline-flex items-center gap-2">
                                            <i class="pi pi-id-card text-gray-500"></i>
                                            <InputText size="small" placeholder="Student ID" name="student_id" fluid>
                                            </InputText>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="font-bold">Social Links</label>
                                    <div class="flex flex-col gap-2">
                                        <div class="inline-flex items-center gap-2">
                                            <i class="pi pi-link text-gray-500"></i>
                                            <InputText size="small" placeholder="Link" fluid disabled></InputText>
                                        </div>
                                        <div class="inline-flex items-center gap-2">
                                            <i class="pi pi-link text-gray-500"></i>
                                            <InputText size="small" placeholder="Link" fluid disabled>
                                            </InputText>
                                        </div>
                                    </div>
                                    <span class="text-gray-400 text-xs md:text-sm">
                                        Unsupported yet for now, this feature is under alpha development, and will
                                        come soon.
                                    </span>
                                </div>
                                <div class="mr-auto inline-flex gap-2 flex-wrap">
                                    <Button label="Update profile" type="submit" :loading="updatingProfile"
                                        size="small"></Button>
                                    <Message v-if="updateProfileStatus.message" size="small" variant="simple"
                                        :severity="updateProfileStatus.severity">{{
                                            updateProfileStatus.message }}
                                        <i class="pi" style="font-size: 1em;"
                                            :class="updateProfileStatus.severity === 'success' ? 'pi-check' : 'pi-times'"></i>
                                    </Message>
                                </div>
                            </Form>
                            <div class="flex flex-col w-[8em] md:w-[18em] gap-2">
                                <label class="text-gray-500">Avatar</label>
                                <img v-if="accountStore.account?.avatar"
                                    class="rounded-full border-[2px] border-zinc-300 dark:border-zinc-700"
                                    :src="accountStore.avatarUrl"></img>
                                <Avatar v-else pt:root:class="!w-[8em] md:!w-[18em] !h-[8em] md:!h-[18em]"
                                    pt:label:class="text-4xl md:text-9xl"
                                    :label="(accountStore.account?.nickname ?? '?')[0]" shape="circle"
                                    class="border-[2px] border-zinc-300 dark:border-zinc-700">
                                </Avatar>
                                <FileUpload mode="basic" @select="selectAvatar" :chooseButtonProps="{
                                    severity: 'secondary',
                                    size: 'small',
                                    loading: uploadingAvatar
                                }" accept="image/jpg, image/jpeg, image/png, image/gif" customUpload auto
                                    :chooseLabel="uploadingAvatar ? 'Uploading' : 'Edit'" chooseIcon="pi pi-pencil"
                                    class="transform translate-y-[-2rem] md:translate-x-1 md:translate-y-[-3rem] mr-auto"
                                    :maxFileSize="1024 * 1024 * 2" :multiple="false">
                                </FileUpload>
                                <ConfirmDialog group="templating">
                                    <template #message>
                                        <VuePictureCropper :boxStyle="{
                                            width: '100%',
                                            height: '100%',
                                            margin: 'auto',
                                        }" :img="avatarString" :options="{
                                            viewMode: 1,
                                            dragMode: 'crop',
                                            aspectRatio: 1,
                                        }" :presetMode="{
                                            width: 500,
                                            height: 500,
                                        }" />
                                    </template>
                                </ConfirmDialog>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <UniversalFooter></UniversalFooter>
    </div>
</template>
