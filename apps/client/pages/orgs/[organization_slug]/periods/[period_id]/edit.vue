<template>
  <main v-if="period" class="space-y-3">
    <NuxtLink
      :to="`/orgs/${route.params.organization_slug}/periods`"
      class="text-primary group hover:underline transition-all"
    >
      <Icon
        name="lucide:arrow-left"
        class="transition-transform group-hover:-translate-x-1"
      />
      Back to periods
    </NuxtLink>

    <h1 class="text-4xl font-semibold">Edit {{ period.name }}</h1>
    <div class="py-3">
      <UICard class="pt-3">
        <UICardContent>
          <OrganizationPeriodsForm edit :default-value="period" />
        </UICardContent>
      </UICard>
    </div>
  </main>
  <main v-else>No period found</main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

useSeoMeta({
  title: "Edit Period",
  description: "Edit a period",
});

const route = useRoute("orgs-organization_slug-periods-period_id-edit");

const { data: period } = await useFetch<
  typeof organizationPeriodsTable.$inferSelect
>(
  `/api/organizations/${route.params.organization_slug}/periods/${route.params.period_id}`
);
</script>

<style scoped>
.target {
  view-transition-name: selected-activity;
}
</style>
