<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { Search } from "lucide-vue-next";
import {
  ComboboxInput,
  type ComboboxInputProps,
  useForwardProps,
} from "radix-vue";
import { cn } from "@/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  ComboboxInputProps & {
    class?: HTMLAttributes["class"];
  }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <div class="flex items-center border-b px-3" cmdk-input-wrapper>
    <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <ComboboxInput
      v-bind="{ ...forwardedProps, ...$attrs }"
      :class="
        cn(
          'placeholder:text-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
          props.class
        )
      "
      auto-focus
    />
  </div>
</template>
