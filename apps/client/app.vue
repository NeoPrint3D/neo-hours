<template>
  <ConfigProvider :use-id="useIdFunction">
    <UITooltipProvider>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UITooltipProvider>
    <UIToaster />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ConfigProvider } from "radix-vue";
const { data } = await useFetch("/api/auth");

const useIdFunction = () => useId();

useSeoMeta({
  title: "Leo Club Hours",
  description: "The hour tracking soloution for organizations",
});

const auth = useAuth();
// @ts-expect-error - this is a hack to get around the fact that the auth plugin is not typed
if (data.value) auth.value = data.value;
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.2s,
    transform 0.4s,
    filter 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
  filter: blur(1rem);
}
</style>
