<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import {
  SelectIcon,
  SelectTrigger,
  type SelectTriggerProps,
  useForwardProps,
} from "radix-vue";
import { ChevronDown } from "lucide-vue-next";
import { cn } from "@/utils";

const props = defineProps<
  SelectTriggerProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'group flex h-10 w-full transition-colors items-center justify-between bg-background/20 rounded-md hover:text-foreground hover:bg-accent/10 duration-200 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        props.class
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <Icon
        class="ml-1 text-muted-foreground group-hover:text-foreground"
        size="20"
        name="lucide:chevrons-up-down"
      />
    </SelectIcon>
  </SelectTrigger>
</template>
