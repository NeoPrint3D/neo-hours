<template>
  <div class="relative">
    <UIInput
      :id="`${forLabel}-q`"
      v-model="debouncedValue"
      class="pl-8 pr-12"
      type="text"
      :placeholder="`Search for ${forLabel}`"
    />
    <span
      class="absolute inset-y-0 start-0 flex items-center justify-center px-2"
    >
      <Icon size="16" name="lucide:search" />
    </span>
    <span
      v-if="modelValue"
      v-motion-fade-visible
      class="absolute inset-y-0 end-0 flex items-center justify-center px-2"
    >
      <UIButton class="h-8 w-8" size="icon" variant="ghost" @click="clearInput">
        <Icon size="16" name="lucide:x" />
      </UIButton>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const searchParams = useUrlSearchParams();

const props = defineProps<{
  modelValue?: string;
  forLabel: string;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
  defaultValue: undefined,
});

const debouncedValue = ref(modelValue.value);

const debounce = (fn: () => void, delay: number) => {
  let timeoutId: string | number | NodeJS.Timeout | undefined;
  return (...args: unknown) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...(args as unknown));
    }, delay);
  };
};

const debouncedUpdate = debounce((value: string) => {
  emits("update:modelValue", value);
  searchParams.q = value;
}, 100); // Adjust the debounce delay as needed

watch(debouncedValue, (newValue) => {
  debouncedUpdate(newValue);
});

const clearInput = () => {
  debouncedValue.value = "";
};
</script>
