<template>
  <NuxtLayout name="default">
    <main class="flex min-h-page items-center justify-center">
      <UICard class="w-full max-w-sm p-5">
        <UICardHeader>
          <UICardTitle class="capitalize">
            {{ errorData.message }}
          </UICardTitle>
          <UICardDescription>
            {{ errorData.statusMessage }} ({{ errorData.statusCode }})
          </UICardDescription>
        </UICardHeader>
        <UICardContent v-if="errorData.data" class="flex flex-col gap-4">
          <p v-if="errorData.data.details">
            {{ errorData.data.details }}
          </p>
          <div class="flex gap-3">
            <UIButton class="w-full" variant="outline" @click="router.back()">
              Go back
            </UIButton>
            <UIButton
              v-if="errorData.data.redirectTo"
              class="w-full shadow-xl shadow-primary/40"
              as-child
            >
              <NuxtLink :to="errorData.data.redirectTo">
                {{ errorData.data.redirectText }}
              </NuxtLink>
            </UIButton>
          </div>
        </UICardContent>
      </UICard>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";
import type { CustomError } from "./lib/shared/createCustomError";
const router = useRouter();
const props = defineProps<{
  error: NuxtError;
}>();

const errorData = computed(() => props.error as CustomError);
/// see if the data is a json string if so parse it

if (typeof errorData.value.data === "string") {
  try {
    errorData.value.data = JSON.parse(errorData.value.data);
  } catch (e) {
    console.error(e);
  }
}
</script>
