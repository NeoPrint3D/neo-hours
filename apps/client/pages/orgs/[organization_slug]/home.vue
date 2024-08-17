<template>
  <main>
    <h1 class="text-4xl font-semibold">Home</h1>
    <div class="mt-5 flex flex-col gap-5 xl:grid xl:grid-cols-3 xl:gap-10">
      <UICard class="h-fit">
        <UICardHeader>
          <div class="flex w-full items-center justify-between">
            <UICardTitle>Upcoming Activities</UICardTitle>
            <UIButton variant="ghost" size="icon" @click="refreshActivities">
              <Icon
                name="lucide:refresh-cw"
                size="24"
                :class="{ 'animate-spin': activityStatus === 'pending' }"
              />
            </UIButton>
          </div>
        </UICardHeader>
        <UICardContent>
          <div
            v-if="
              activityStatus === 'success' && activityData?.activities.length
            "
            class="flex flex-col gap-1"
          >
            <div
              v-for="activity in activityData?.activities"
              :key="activity.id"
              class="rounded-lg border bg-background/40 p-4 capitalize shadow-xl shadow-primary/[.025]"
              :class="{ target: viewTransition === activity.id }"
              @click="viewTransition = activity.id"
            >
              <NuxtLink
                :to="`/orgs/${route.params.organization_slug}/activities/${activity.id}`"
                class="line-clamp-1 text-sm underline"
              >
                {{ activity.name }}
              </NuxtLink>
              <div
                class="flex flex-col flex-wrap text-xs sm:flex-row sm:items-center sm:gap-1.5"
              >
                <p class="chip mt-2 bg-red-500/30">
                  <Icon name="lucide:calendar" />
                  {{
                    dayjs(activity.scheduledStartDatetime).format(
                      "MMM DD, YYYY"
                    )
                  }}
                </p>
                <button
                  class="chip mt-1 bg-blue-500/30"
                  @click="openMapsWithDirections(activity.location!)"
                >
                  <Icon name="lucide:map" />
                  <span class="line-clamp-1 max-w-[32ch]">
                    {{ activity.location || "TBD" }}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div
            v-else-if="activityStatus === 'pending'"
            class="flex flex-col gap-1"
          >
            <UISkeleton v-for="i in 3" :key="i" class="h-24" />
          </div>
          <div v-else>No Activities schdeule</div>

          <UISeparator class="my-3" />
          <UIButton variant="ghost" class="w-full" as-child>
            <NuxtLink
              :to="`/orgs/${route.params.organization_slug}/activities`"
              class="w-full"
            >
              View All
            </NuxtLink>
          </UIButton>
        </UICardContent>
      </UICard>

      <div class="space-y-5">
        <AppPermission hide role="owner">
          <UICard class="">
            <UICardHeader>
              <UICardTitle>Hour Progress</UICardTitle>
            </UICardHeader>
            <UICardContent :key="String(isHydrated)" v-auto-animate>
              <BaseChart
                v-if="
                  attendances?.attendances?.length &&
                  periods?.length &&
                  isHydrated
                "
                type="donut"
                :options="hourProgressChartOptions"
                :series="[
                  attendances.totalApprovedHours,
                  attendances.totalRejectedHours,
                  attendances.totalUnapprovedHours,
                  periods[0].hourRequirement -
                    (attendances?.totalApprovedHours +
                      attendances?.totalUnapprovedHours),
                ]"
              />
              <div v-else-if="isHydrated">
                <p>No attendance data available</p>
              </div>
              <UISkeleton v-else class="h-96" />
            </UICardContent>
          </UICard>
        </AppPermission>

        <UICard v-if="periods?.length" class="h-fit">
          <UICardHeader>
            <UICardTitle>Organization Period Progress</UICardTitle>
          </UICardHeader>
          <UICardContent>
            <div class="flex w-full flex-col items-center gap-3">
              <UIProgress
                v-if="periods"
                :model-value="
                  orgainzationPeriodProgress < 0
                    ? 0
                    : orgainzationPeriodProgress > 100
                      ? 100
                      : orgainzationPeriodProgress
                "
                class="mt-5"
              />

              <h4>
                You are {{ orgainzationPeriodProgress.toFixed(0) }}% through the
                current period
              </h4>

              <h4>
                {{
                  `From ${$dayjs(periods[0].startDate, {
                    utc: true,
                  }).format("MMM DD, YYYY")} to ${$dayjs(periods[0].endDate, {
                    utc: true,
                  }).format("MMM DD, YYYY")}`
                }}
              </h4>
            </div>
          </UICardContent>
        </UICard>
      </div>

      <AppPermission class="h-fit" role="admin">
        <UICard class="h-full">
          <UICardHeader>
            <UICardTitle>Org. Stats</UICardTitle>
          </UICardHeader>
          <UICardContent>
            <p>Coming soon...</p>
          </UICardContent>
        </UICard>
      </AppPermission>
    </div>
  </main>
</template>

<script setup lang="ts">
import { openMapsWithDirections } from "#imports";
import dayjs from "dayjs";
useSeoMeta({
  title: "Home",
  description: "Home page for your organization",
});
const organization = useOrganization();
const route = useRoute("orgs-organization_slug");

const selectedOrganizationPeriod = useSelectedPeriod();

const { data: attendances } = await useLazyFetch(
  `/api/organizations/${route.params.organization_slug}/activities/attendances`,
  {
    transform: (data) => ({
      ...data,
      totalApprovedHours: data
        ? data.attendances
            .filter((a) => a.status === "approved")
            .reduce((acc, a) => acc + a.requestedHours, 0)
        : 0,
      totalUnapprovedHours: data
        ? data.attendances
            .filter((a) => !a.status || a.status === "pending")
            .reduce((acc, a) => acc + a.requestedHours, 0)
        : 0,
      totalRejectedHours: data
        ? data.attendances
            .filter((a) => a.status === "rejected")
            .reduce((acc, a) => acc + a.requestedHours, 0)
        : 0,
    }),
    query: {
      organizationPeriodId: computed(
        () => selectedOrganizationPeriod.value?.id
      ),
      mine: true,
    },
  }
);

const {
  data: activityData,
  refresh: refreshActivities,
  status: activityStatus,
} = await useLazyFetch(
  `/api/organizations/${route.params.organization_slug}/activities`,
  {
    query: {
      limit: 3,
      finalized: true,
      organizationPeriodId: computed(
        () => selectedOrganizationPeriod.value?.id
      ),
    },
    onResponseError: (res) => {
      toast.error(res.response._data.data.details);
    },
  }
);

const periods = usePeriods();

const isHydrated = ref(false);

onMounted(() => {
  isHydrated.value = true;
});

const orgainzationPeriodProgress = computed(() => {
  if (
    !periods.value?.length ||
    !periods.value[0].startDate ||
    !periods.value[0].endDate
  )
    return 0;

  const startDate = new Date(periods.value[0].startDate).getTime();
  const endDate = new Date(periods.value[0].endDate).getTime();
  const now = new Date().getTime();

  const progress = ((now - startDate) / (endDate - startDate)) * 100;

  return progress > 100 ? 100 : progress < 0 ? 0 : progress;
});

const hourProgressChartOptions = {
  chart: {
    height: 350,
    type: "donut",
    toolbar: {
      show: false, // Hide the chart toolbar
    },
  },
  colors: ["#fbca51", "#f47b7b", "#1e293b", "#001424"],
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: "14px",
            fontFamily: "Raleway",
            fontWeight: 600,
            color: "#ffffff",
          },
          value: {
            show: true,
            fontSize: "14px",
            fontFamily: "Raleway",
            fontWeight: 400,
            color: "#ffffff",
          },
          total: {
            show: true,
            showAlways: true,
            label: "Hour Progress",
            fontSize: "15px",
            fontFamily: "Raleway",
            fontWeight: 700,
            color: "#ffffff",
            formatter: () => {
              return `${attendances.value?.totalApprovedHours}/${periods.value![0].hourRequirement} Hours`;
            },
          },
        },
      },
    },
  },
  labels: [
    "Hours Completed",
    "Hours Rejected",
    "Hours Pending",
    "Hours Remaining",
  ],
  legend: {
    show: true,
    position: "bottom",
    horizontalAlign: "center",
    fontSize: "14px",
    fontFamily: "Raleway",
    fontWeight: 400,
    labels: {
      colors: "#ffffff",
    },
    markers: {
      width: 12,
      height: 12,
      strokeWidth: 0,
      strokeColor: "#fff",
      fillColors: undefined,
      radius: 12,
      onClick: undefined,
      offsetX: 0,
      offsetY: 0,
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5,
    },
  },
  dataLabels: {
    enabled: false, // Hide the data labels inside the chart
  },
};

const viewTransition = useViewTransition();
</script>

<style scoped>
.target {
  view-transition-name: selected-activity;
  contain: layout;
}
</style>
