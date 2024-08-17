<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from "vue-sonner";
// const isMobile= useDevice
const device = useDevice();
const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    v-bind="props"
    class="toaster group"
    position="top-center"
    :visible-toasts="3"
    :toast-options="{
      classes: {
        toast:
          'toast-container !text-white !shadow-xl !shadow-primary/20 !backdrop-blur-md !text-sm',
        actionButton:
          '!rounded-xs !px-5 !py-4 !border-gradient !bg-primary !text-primary-foreground ![--current-color:var(--primary)]',
      },
    }"
  />
</template>
