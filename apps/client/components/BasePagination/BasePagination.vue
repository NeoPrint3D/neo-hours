<template>
  <UIPagination
    v-slot="{ page }"
    ref="innerPaginationRef"
    :key="route.path"
    v-motion-fade
    class="fixed bottom-3 z-50 mx-auto w-fit rounded-xl border bg-background/80 p-3 backdrop-blur-2xl"
    :total="total"
    :sibling-count="device.isMobile ? 0 : 1"
    :default-page="pageNumber"
    :style="{
      left: `calc(${left}px + (0.5 * ${outsideWidth}px - 0.5 * ${insideWidth}px))`,
    }"
    show-edges
  >
    <UIPaginationList v-slot="{ items }" class="flex items-center gap-1">
      <UIPaginationPrev @click="router.push({ query: { page: page - 1 } })" />

      <template v-for="(item, index) in items">
        <UIPaginationListItem
          v-if="item.type === 'page'"
          :key="index"
          :value="item.value"
          as-child
        >
          <UIButton
            class="h-10 w-10 p-0"
            :variant="item.value === page ? 'default' : 'outline'"
            @click="pageNumber = item.value"
          >
            {{ item.value }}
          </UIButton>
        </UIPaginationListItem>
        <UIPaginationEllipsis v-else :key="item.type" :index="index" />
      </template>

      <UIPaginationNext @click="pageNumber = page + 1" />
    </UIPaginationList>
  </UIPagination>
</template>
<script setup lang="ts">
const props = defineProps<{
  total: number;
  containerRef: HTMLDivElement | undefined;
}>();
const route = useRoute("orgs-organization_slug");

const router = useRouter();

const pageNumber = ref(route.query.page ? Number(route.query.page) : 1);
const innerPaginationRef = ref<HTMLDivElement>();

const { left, width: outsideWidth } = useElementBounding(props.containerRef);
const { width: insideWidth } = useElementSize(innerPaginationRef);
const device = useDevice();

watch(pageNumber, async () => {
  await router.push({ query: { ...route.query, page: pageNumber.value } });
});
</script>
