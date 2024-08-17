<template>
  <main class="min-h-page flex items-center justify-center">
    <UICard class="border-gradient-content mx-auto w-full max-w-xl p-3">
      <UICardHeader>
        <UICardTitle class="text-xl"> Verify Email </UICardTitle>
        <UICardDescription>
          <span>Please wait while we verify your email address</span>
          <br />

          <span class="text-primary underline">
            {{ authLastEmail }}
          </span>
        </UICardDescription>
      </UICardHeader>
      <UICardContent>
        <div>
          <div
            v-if="formStatus.message"
            v-auto-animate
            class="w-full gap-2 rounded-lg p-3 text-sm"
            :class="{
              'bg-success/30 text-success-foreground':
                formStatus.statusType === 'success',
              'bg-warning/30 text-warning-foreground':
                formStatus.statusType === 'warning',
              'bg-error/30 text-error-foreground':
                formStatus.statusType === 'error',
              'bg-info/30 text-info-foreground':
                formStatus.statusType === 'info',
            }"
          >
            <Icon
              class="inline-block"
              size="18"
              :name="
                formStatus.statusType === 'success'
                  ? 'lucide:badge-check'
                  : formStatus.statusType === 'warning'
                    ? 'lucide:badge-alert'
                    : formStatus.statusType === 'error'
                      ? 'lucide:badge-x'
                      : 'lucide:badge-info'
              "
            />

            {{ formStatus.message }}
          </div>

          <UIButton
            class="mt-4"
            size="sm"
            variant="outline"
            :disabled="formStatus.loading"
            @click="resendVerificationEmail"
          >
            <Icon class="mr-2" name="lucide:mail" />
            Resend Verification Email
          </UIButton>

          <!-- <UISeparator class="my-4" />
          <UIButton
            class="text-muted-foreground"
            size="xs"
            variant="ghost"
            @click="async () => await $fetch('/api/auth/logout')"
          >
            Logout Instead?
          </UIButton> -->
        </div>
      </UICardContent>
    </UICard>
  </main>
</template>

<script setup lang="ts">
const route = useRoute();

const auth = useAuth();
const authLastEmail = useLocalStorage("auth-last-email", "");

const token = ref(route.query.token as string);
const formStatus = reactive({
  message:
    "Please check your email inbox (or spam folder) for the verification link to complete signup.",
  statusType: "info",
  loading: false,
});

if (route.query.error) {
  formStatus.statusType = "error";
  formStatus.message = route.query.error as string;
}

async function resendVerificationEmail() {
  await $fetch("/api/auth/resend-verification", {
    method: "POST",
    body: { email: authLastEmail.value },
    async onResponse({ response }) {
      formStatus.statusType = getMessageStatusType(response.status);
      formStatus.message = response._data.message;
    },
  }).catch((err) => err.data as { message: string });
}

onMounted(() => {
  if (auth.value.user?.verifiedAt) {
    navigateTo("/orgs");
  }
  if (token.value) {
    $fetch("/api/auth/verify-email", {
      method: "POST",
      async onResponse({ response }) {
        formStatus.statusType = getMessageStatusType(response.status);
        formStatus.message = response._data.message;
        if (response.status === 200) {
          authLastEmail.value = "";
          const refreshedUser = await $fetch("/api/auth");
          auth.value = refreshedUser as typeof auth.value;
          await navigateTo("/orgs");
        }
      },
      body: {
        token: token.value,
      },
    }).catch((err) => err.data as { message: string });
  }
});
</script>
