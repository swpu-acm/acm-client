<script setup lang="ts">
import { reactive, type Ref, ref } from "vue";
import { useToast } from 'primevue/usetoast';
import { useRouter } from "vue-router";
import { useThemeStore } from "../scripts/store";
import * as api from "@/scripts/api";

const toast = useToast();
const router = useRouter();
const themeStore = useThemeStore();

const activeStep = ref("1");

interface RegisterForm<T> {
  username?: T;
  email?: T;
  password?: T;
  retyped_password?: T;
  terms?: T;
}

const resolver = ({ values }: { values: RegisterForm<string> }) => {
  const errors: RegisterForm<{ message: string }[]> = {};

  if (!values.username) {
    errors.username = [{ message: "Username is required." }]
  }
  if (!values.email) {
    errors.email = [{ message: "Email is required." }]
  }
  if (!values.password) {
    errors.password = [{ message: "Password is required." }]
  }
  if (!values.retyped_password || values.password !== values.retyped_password) {
    errors.retyped_password = [{ message: "Passwords do not match." }]
  }
  if (!values.terms) {
    errors.terms = [{ message: "You must agree to the terms and conditions." }]
  }

  return { errors };
}

const registerInitialValues = reactive({
  username: "",
  email: "",
  password: "",
  terms: false,
})

const inProgress = ref(false);
const onRegister = async ({ valid, states }: { valid: boolean, states: RegisterForm<Ref<string>> }) => {
  if (!valid) return;

  if (inProgress.value) return;
  inProgress.value = true;
  const res = await api.register({
    username: states.username!.value,
    email: states.email!.value,
    password: states.password!.value,
  })
  inProgress.value = false;

  if (res.success)
    toast.add({ severity: "success", summary: "Registered successfully", detail: "You are now logged in, perhaps filled with your profile." });
  else
    toast.add({ severity: "error", summary: "Registration failed", detail: res.message });
}
</script>

<template>
  <div class="flex flex-col justify-center items-center h-screen">
    <div class="flex flex-col container h-full m-10">
      <div class="flex flex-row justify-between mb-4 w-full">
        <Button @click="router.go(-1)" icon="pi pi-arrow-left" label="Back" plain outlined></Button>
        <Button @click="themeStore.toggle" :icon="`pi pi-${themeStore.dark ? 'moon' : 'sun'}`" plain text></Button>
      </div>
      <Stepper v-model:value="activeStep" linear class="h-full basis-[40rem]">
        <StepList>
          <Step value="1">Signup</Step>
          <Step value="2"></Step>
          <Step value="3"></Step>
        </StepList>
        <StepPanels class="h-80%">
          <StepPanel value="1" class="h-full">
            <Card class="m-auto flex basis-[40rem] w-full h-full items-center justify-center flex-col">
              <template #title>Sign Up</template>
              <template #subtitle>Create a new account with AlgoHub</template>
              <template #content>
                <Form v-slot="$form" :initialValues=registerInitialValues :resolver @submit="onRegister"
                  class="flex flex-col gap-4 justify-center items-center">
                  <div class="flex flex-col gap-1 w-full">
                    <InputText name="username" type="text" placeholder="Username" fluid />
                    <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple">{{
                      $form.username.error.message }}</Message>
                  </div>
                  <div class="flex flex-col gap-1 w-full">
                    <InputText name="email" type="text" placeholder="Email" fluid />
                    <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
                      $form.email.error.message }}</Message>
                  </div>
                  <div class="flex flex-col gap-1 w-full">
                    <Password name="password" type="text" placeholder="Password" :feedback="false" toggleMask fluid />
                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{
                      $form.password.error.message }}</Message>
                  </div>
                  <div class="flex flex-col gap-1 w-full">
                    <Password name="retyped_password" type="text" placeholder="Retype Password" :feedback="false"
                      toggleMask fluid />
                    <Message v-if="$form.retyped_password?.invalid" severity="error" size="small" variant="simple">{{
                      $form.retyped_password.error.message }}</Message>
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
                  <p>Already have an account? <a @click="router.push('/login')" class="underline">Login</a></p>
                  <Button type="submit" label="Register" class="w-full" :disabled="inProgress" secondary></Button>
                </Form>
              </template>
            </Card>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </div>
  </div>
</template>
