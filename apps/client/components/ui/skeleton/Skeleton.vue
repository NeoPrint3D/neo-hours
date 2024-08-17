<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/utils";

interface SkeletonProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<SkeletonProps>();
</script>

<template>
  <div :class="cn('animate-pulse rounded-xl bg-slate-600', props.class)" />
</template>
