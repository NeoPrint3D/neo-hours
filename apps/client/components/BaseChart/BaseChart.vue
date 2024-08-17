<template>
  <ClientOnly>
    <VueApexCharts :options="options" :series="series" />
  </ClientOnly>
</template>

<script setup lang="ts">
import VueApexCharts from "vue3-apexcharts";

defineProps<{
  options: Record<string, unknown>;
  series: number[];
}>();
</script>
