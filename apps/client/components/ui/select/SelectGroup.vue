<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { SelectGroup, type SelectGroupProps } from "radix-vue";
import { cn } from "@/utils";

const props = defineProps<
  SelectGroupProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <SelectGroup v-bind="delegatedProps" :class="cn('w-full p-1', props.class)">
    <slot />
  </SelectGroup>
</template>
