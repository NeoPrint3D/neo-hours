<template>
  <main class="flex min-h-page items-center justify-center">
    <UICard
      :key="stepper.index.value"
      class="border-gradient-content mx-auto max-h-[100%] w-full max-w-xl p-3 transition-all duration-300"
    >
      <UICardHeader>
        <UICardTitle class="text-xl"> Sign Up </UICardTitle>
        <UICardDescription>{{
          stepper.current.value.description
        }}</UICardDescription>
      </UICardHeader>

      <UICardContent>
        <form class="grid gap-4" @submit.prevent="submit">
          <div v-if="stepper.index.value === 0" class="grid gap-2">
            <UILabel for="email"> Email </UILabel>
            <UIInput
              id="email"
              v-model="formState.email"
              name="email"
              type="email"
              placeholder="someone@example.com"
            >
              <template #startAdornment>
                <Icon size="16" name="lucide:mail" />
              </template>
            </UIInput>
          </div>

          <div v-if="stepper.index.value === 1" class="grid gap-2">
            <UILabel for="name"> Full Name </UILabel>
            <UIInput
              id="name"
              v-model="titleCasedName"
              name="name"
              type="text"
              placeholder="John Doe"
            >
              <template #startAdornment>
                <Icon size="16" name="lucide:user" />
              </template>
            </UIInput>
          </div>

          <div
            v-if="formStatus.message"
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

          <UIButton
            class="group w-full shadow-xl shadow-primary/20"
            type="submit"
            :disabled="formStatus.loading || !stepper.current.value.isValid()"
          >
            <span class="flex items-center justify-center gap-1">
              {{ stepper.isLast.value ? "Sign Up" : "Next" }}
              <Icon
                class="transition-transform"
                :class="{
                  'group-hover:translate-x-0.5':
                    !formStatus.loading && !stepper.isLast.value,
                  'group-hover:scale-110':
                    !formStatus.loading && stepper.isLast.value,
                  'animate-spin': formStatus.loading,
                }"
                size="16"
                :name="
                  formStatus.loading
                    ? 'lucide:loader'
                    : !stepper.isLast.value
                      ? 'lucide:arrow-right'
                      : 'lucide:user-round'
                "
              />
            </span>
          </UIButton>
        </form>
        <div class="mt-4 text-center text-sm">
          Already have an account?
          <NuxtLink class="underline" to="/login"> Login </NuxtLink>
        </div>
      </UICardContent>
    </UICard>
  </main>
</template>

<script setup lang="ts">
const authLastEmail = useLocalStorage("auth-last-email", "");

const signupFormSchema = z.object({
  name: z.string().min(3, "Name is too short").max(255, "Name is too long"),
  email: z.string().email("Invalid email address"),
});

definePageMeta({
  middleware: ["not-verified"],
});

const { email: emailSchema, name: nameSchema } = signupFormSchema.shape;
const formState = reactive({
  name: "",
  email: "",
  isEmailValid: false,
});
const titleCasedName = computed({
  get: () => formState.name,
  set: (value) => {
    formState.name = value.replace(/\b\w/g, (match) => match.toUpperCase());
  },
});

const formStatus = reactive({
  message: "",
  statusType: "success",
  loading: false,
});

async function createUser() {
  formStatus.loading = true;

  const payload = {
    email: formState.email,
    name: titleCasedName.value,
  };
  authLastEmail.value = formState.email;
  await $fetch("/api/auth/signup", {
    method: "POST",
    body: payload,
    async onResponse({ response }) {
      const statusType = getMessageStatusType(response.status);
      formStatus.statusType = statusType;
      formStatus.message = response._data.message;
      formStatus.loading = false;

      if (statusType === "success") navigateTo("/verify-email");
    },
  }).catch((err) => err.data as { message: string });
}

async function checkEmail() {
  if (formState.email.length === 0) {
    formStatus.message = "";
    formStatus.statusType = "success";
    return;
  }
  if (!emailSchema.safeParse(formState.email).success) {
    formStatus.message = "Invalid email address.";
    formStatus.statusType = "error";
    return;
  }
  formStatus.loading = true;

  await $fetch("/api/auth/check-email", {
    query: { email: formState.email },
    async onResponse({ response }) {
      const statusType = getMessageStatusType(response.status);
      formStatus.statusType = statusType;
      formStatus.message = response._data.message;
      formStatus.loading = false;
      formState.isEmailValid = statusType === "success";
    },
  }).catch((err) => err.data as { message: string });
}

watchDebounced(formState, checkEmail, {
  debounce: 500,
});
const stepper = useStepper({
  email: {
    description: "Please enter your personal email address to get started.",
    isValid: () =>
      emailSchema.safeParse(formState.email).success && formState.isEmailValid,
  },
  name: {
    description: "Please enter your real full name.",
    isValid: () => {
      const { success, error } = nameSchema.safeParse(formState.name);
      if (!success && formState.name.length > 0) {
        formStatus.statusType = "error";
        formStatus.message = error.errors[0].message;
      } else {
        formStatus.statusType = "success";
        formStatus.message = "";
      }
      return success;
    },
  },
});

async function submit() {
  formStatus.message = "";
  if (stepper.isLast.value && allStepsBeforeAreValid(stepper.index.value)) {
    await createUser();
    return;
  } else if (stepper.current.value.isValid()) {
    stepper.goToNext();
  }
}

function allStepsBeforeAreValid(index: number): boolean {
  return !Array(index)
    .fill(null)
    .some((_, i) => !stepper.at(i)?.isValid());
}
</script>
