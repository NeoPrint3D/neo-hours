<template>
  <main class="flex min-h-page items-center justify-center">
    <UICard
      class="mx-auto max-h-[100%] w-full max-w-xl p-3 transition-all duration-300"
    >
      <UICardHeader>
        <UICardTitle class="text-xl"> Login </UICardTitle>
        <UICardDescription
          >Enter your email and password to log in.</UICardDescription
        >
      </UICardHeader>

      <UICardContent>
        <form class="grid gap-4" @submit.prevent="login">
          <div class="grid gap-2">
            <UILabel for="email"> Email </UILabel>
            <UIInput
              id="email"
              v-model="formState.email"
              name="email"
              type="email"
              placeholder="someone@example.com"
            />
          </div>

          <div
            v-if="formStatus.message"
            :key="formStatus.message"
            v-auto-animate
            class="w-full rounded-lg p-2 text-sm"
            :class="{
              'bg-success/30 text-success-foreground':
                formStatus.statusType === 'success',
              'bg-warning/30 text-warning-foreground':
                formStatus.statusType === 'warning',
              'bg-error/30 text-error-foreground':
                formStatus.statusType === 'error',
            }"
          >
            <Icon
              class="inline-block"
              size="16"
              :name="
                formStatus.statusType === 'success'
                  ? 'lucide:badge-check'
                  : formStatus.statusType === 'warning'
                    ? 'lucide:badge-alert'
                    : 'lucide:badge-x'
              "
            />

            {{ formStatus.message }}
          </div>

          <div
            v-if="
              formStatus.fetchedOnce &&
              formStatus.message !== 'User not found please signup'
            "
            class="flex items-center gap-1 text-sm text-muted-foreground"
          >
            Didn't receive the email?
            <UIButton
              class="text-muted-foreground"
              size="xs"
              variant="link"
              type="button"
              :disabled="formStatus.loading"
              @click="resendVerificationEmail"
            >
              Send Verification Email
            </UIButton>
          </div>

          <UIButton
            class="group w-full shadow-xl shadow-primary/20"
            type="submit"
            :disabled="
              formStatus.loading ||
              !z.string().email().safeParse(formState.email).success
            "
          >
            <span class="flex items-center justify-center gap-1">
              Login
              <Icon
                class="transition-transform group-hover:scale-110"
                :class="{
                  'animate-spin': formStatus.loading,
                }"
                size="16"
                :name="
                  formStatus.loading ? 'lucide:loader' : 'lucide:user-round'
                "
              />
            </span>
          </UIButton>
        </form>
        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <NuxtLink class="underline" to="/signup"> Sign Up </NuxtLink>
        </div>
      </UICardContent>
    </UICard>
  </main>
</template>

<script setup lang="ts">
import { z } from "#imports";
definePageMeta({
  middleware: ["not-verified"],
});
onMounted(async () => {
  if (import.meta.env) {
    await $fetch("/api/setup", {
      method: "POST",
    });
  }
});

const lastEmail = useLocalStorage("lastEmail", "");
const formState = ref({
  email: "",
});

const formStatus = ref({
  message: "",
  statusType: "success",
  loading: false,
  fetchedOnce: false,
});

async function login() {
  formStatus.value.loading = true;

  const payload = {
    email: formState.value.email,
  };
  await $fetch("/api/auth/login", {
    method: "POST",
    body: payload,
    async onResponse({ response }) {
      const statusType = getMessageStatusType(response.status);
      formStatus.value = {
        message: response._data.message,
        statusType,
        loading: false,
        fetchedOnce: true,
      };
    },
  }).catch((err) => err.data);
}

async function resendVerificationEmail() {
  await $fetch("/api/auth/resend-verification", {
    method: "POST",
    query: { email: formState.value.email || lastEmail.value },
    async onResponse({ response }) {
      formStatus.value.statusType = getMessageStatusType(response.status);
      formStatus.value.message = response._data.message;
    },
  }).catch((err) => err.data as { message: string });
}
</script>
