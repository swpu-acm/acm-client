<script setup lang="ts">
import * as api from "@/scripts/api";
import { useRouter } from 'vue-router';
import { useAccountStore } from '@/scripts/store';
import { ref } from 'vue';
import { Mode, Visibility } from '@/scripts/types';
import { reactive } from 'vue';
import { useToast } from 'primevue/usetoast';


const path = [{ label: 'New problem' }];

const router = useRouter();
const toast = useToast();

const accountStore = useAccountStore();
if (!accountStore.isLoggedIn) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please login first', life: 3000 });
    router.push('/login');
}


const initialValues = reactive({
    Ogr_name: "",
    contact_email: "",
    terms: false,
});

interface OrgCreateForm<T> {
    Org_name?: T;
    contact_email?: T;
    terms?: T;
}

const resolver = ({ values }: { values: OrgCreateForm<string> }) => {
    const errors: OrgCreateForm<{ message: string }[]> = {};

    if (!values.Org_name) {
        errors.Org_name = [{ message: 'Organization Name is required.' }];
    }

    if (!values.contact_email) {
        errors.contact_email = [{ message: 'Your Contact Email is required.' }];
    }

    if (!values.terms) {
        errors.terms = [{ message: "You must agree to the terms and conditions." }]
    }

    return {
        errors
    };
};

// const onFormSubmit = ({ valid }) => {
//     if (valid) {
//         toast.add({
//             severity: 'success',
//             summary: 'Form is submitted.',
//             life: 3000
//         });
//     }
// };

const name = ref('');
const email = ref('');
const description = ref('');
const start_time = ref<Date>();
const end_time = ref<Date>();

const inProgress = ref(false);
const onCreateOrg = async () => {
    inProgress.value = true;
    const res = await api.createContest({
        auth: accountStore.auth!,
        data: {
            name: name.value,
            description: description.value,
            start_time: start_time.value!.toISOString().replace('Z', ''),
            end_time: end_time.value!.toISOString().replace('Z', ''),
            mode: Mode.ICPC,
            visibility: Visibility.Public,
            owner: accountStore.recordId
        }
    })
    if (!res.success) {
        toast.add({ severity: 'error', summary: 'Error', detail: res.message, life: 3000 });
    };
    inProgress.value = false;
    router.push('/contest/' + res.data!.id);
}
</script>



<template>
    <div class="flex-1 flex flex-col">
        <UniversalToolBar :path></UniversalToolBar>
        <div class="max-w-full w-[768px] md:max-w-[768px] mx-auto">
            <Panel class="mt-10 w-full h-full">
                <div class="flex flex-col gap-8 w-full">
                    <div class="mt-10 text-center">
                        <span class="text-gray-500 mb-4">Tell us about your organization</span>
                        <h1 class="text-3xl font-bold">Set up your organization</h1>
                    </div>
                    <div class="flex flex-col">
                        <Form v-slot="$form" :initialValues :resolver class="flex flex-col gap-4 w-full ">
                        <div class="card flex flex-col justify-center">
                            <div class="flex flex-col">
                                <label for="name" style="font-size: 20px;">Organization Name *</label>
                                <InputText v-model="name" name="name"></InputText>
                            </div>
                            <Message v-if="$form.Ogr_name?.invalid" severity="error" size="small" variant="simple">{{
                                $form.Ogr_name.error.message }}</Message>
                            <div>
                                <span class="text-gray-500 mb-4" style="font-size:13px">This will be the name of your
                                    organization on AlgoHub.</span>
                            </div>
                            <div class="mt-6 flex flex-col">
                                <label for="email" style="font-size: 20px;">Contact Email *</label>
                                <InputText v-model="email" email="email"></InputText>
                            </div>
                            <Message v-if="$form.contact_email?.invalid" severity="error" size="small" variant="simple">
                                {{
                                    $form.contact_email.error.message }}</Message>
                        </div>
                        <div class="flex flex-col gap-1 w-full">
                            <div class="flex items-center gap-2">
                                <Checkbox inputId="terms" name="terms" binary />
                                <label for="terms" class="text-sm">I have read and agree to the <a href="#"
                                        class="underline">Affero
                                        General Public License v3</a>.</label>
                            </div>
                            <Message v-if="$form.terms?.invalid" severity="error" size="small" variant="simple">{{
                                $form.terms.error.message }}</Message>
                        </div>
                        <Button @click="onCreateOrg" :loading="inProgress" label="Next"></Button>
                        </Form>
                    </div>
                </div>
            </Panel>
        </div>
        <UniversalFooter></UniversalFooter>
    </div>
</template>
