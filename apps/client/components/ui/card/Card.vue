<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    :class="
      cn(
        'border-gradient-content rounded-lg text-card-foreground shadow-sm',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
