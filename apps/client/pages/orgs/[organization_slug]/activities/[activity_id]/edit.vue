<template>
  <main v-if="activity" class="space-y-3 pb-20">
    <NuxtLink
      :to="`/orgs/${route.params.organization_slug}/activities/${route.params.activity_id}`"
      class="text-primary group hover:underline transition-all"
    >
      <Icon
        name="lucide:arrow-left"
        class="transition-transform group-hover:-translate-x-1"
      />
      Back to activity
    </NuxtLink>

    <h1 class="text-4xl font-semibold">Edit {{ activity.name }}</h1>
    <div class="pt-2 pb-15">
      <UICard class="pt-3">
        <UICardContent>
          <OrganizationActivityForm edit :default-value="activity" />
        </UICardContent>
      </UICard>
    </div>
  </main>
  <main v-else>No activity found</main>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Edit Activity",
  description: "Edit an activity",
  layout: false,
});

const route = useRoute("orgs-organization_slug-activities-activity_id");

const { data: activity, refresh: refreshActivity } = await useFetch<
  typeof activitiesTable.$inferSelect
>(
  `/api/organizations/${route.params.organization_slug}/activities/${route.params.activity_id}`
);
</script>

<style scoped>
.target {
  view-transition-name: selected-activity;
}
</style>
