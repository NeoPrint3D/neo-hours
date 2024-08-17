<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import type { LabelProps } from "radix-vue";
import { useFormField } from "./useFormField";
import { cn } from "@/utils";
import { Label } from "@/components/ui/label";

const props = defineProps<LabelProps & { class?: HTMLAttributes["class"] }>();

const { error, formItemId } = useFormField();
</script>

<template>
  <Label
    class="mt-2 text-base text-white/60"
    :class="cn(error && 'text-error', props.class)"
    :for="formItemId"
  >
    <slot />
  </Label>
</template>
