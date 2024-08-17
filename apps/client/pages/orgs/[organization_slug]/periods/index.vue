<template>
  <main class="space-y-3">
    <div class="flex justify-between">
      <h1 class="text-4xl font-semibold">Periods</h1>

      <UIDialog v-model:open="modalOpen">
        <UIDialogTrigger as-child>
          <UIButton class="shadow-xl shadow-primary/20">
            <Icon name="lucide:calendar-plus" />
            Create New Org. Period</UIButton
          >
        </UIDialogTrigger>
        <UIDialogContent>
          <UIDialogHeader>
            <UIDialogTitle>Create Org. Period</UIDialogTitle>
            <UIDialogDescription>
              <p>
                Create a new organization period to define the start and end
                date of the period.
              </p>
            </UIDialogDescription>
          </UIDialogHeader>
          <OrganizationPeriodsForm @finished-action="modalOpen = false" />
        </UIDialogContent>
      </UIDialog>
    </div>
    <div class="flex gap-3 flex-col pt-7">
      <UICard
        v-for="period in periods"
        :key="period.id"
        class="md:h-42 w-full rounded-xl text-left text-sm transition-all last:mb-20 hover:bg-white/60"
      >
        <UICardHeader>
          <UICardTitle>
            {{ period.name }}
          </UICardTitle>

          <UICardDescription class="space-y-2">
            <span class="chip bg-red-500/20">
              <Icon name="lucide:clock" class="h-4 w-4" />
              Hour Requirement:

              <span class="font-bold">
                {{ period.hourRequirement }}
                {{ period.hourRequirement > 1 ? "hours" : "hour" }}
              </span>
            </span>
            <div class="flex items-center flex-wrap gap-2">
              <span class="chip bg-yellow-500/20">
                <Icon name="lucide:calendar" class="h-4 w-4" />
                Start:
                {{
                  $dayjs(new Date(period.startDate), { utc: true }).format(
                    "M/DD/YYYY"
                  )
                }}
              </span>

              <span class="chip bg-green-500/20">
                <Icon name="lucide:calendar" class="h-4 w-4" />
                End:
                {{
                  $dayjs(new Date(period.endDate), { utc: true }).format(
                    "M/DD/YYYY"
                  )
                }}
              </span>
            </div>
          </UICardDescription>
        </UICardHeader>
        <UICardContent>
          <div class="flex gap-3">
            <UIButton variant="outline" class="w-full" as-child>
              <NuxtLink
                :to="`/orgs/${route.params.organization_slug}/periods/${period.id}/edit`"
              >
                <Icon name="lucide:edit" class="mr-1" />
                Edit Period
              </NuxtLink>
            </UIButton>
          </div>
        </UICardContent>
      </UICard>
    </div>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Organization Periods",
  description: "View and manage organization periods.",
});
const route = useRoute("orgs-organization_slug-periods");
const modalOpen = ref(false);

const organizationPeriod = useSelectedPeriod();

const periods = usePeriods();

organizationPeriod.value = periods.value ? periods.value[0] : null;

onMounted(async () => {
  if (route.query.createPeriod === "true") {
    await nextTick();
    modalOpen.value = true;
  }
});
</script>
