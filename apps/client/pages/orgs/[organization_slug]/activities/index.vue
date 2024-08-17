<template>
  <main ref="outsidePaginationRef" class="min-h-page space-y-3">
    <div id="top" class="flex justify-between">
      <h1 class="text-4xl font-semibold">Activities</h1>
      <AppPermission role="admin">
        <UIDialog v-model:open="modalOpen">
          <UIDialogTrigger as-child>
            <UIButton class="shadow-lg shadow-primary/40">
              <Icon name="lucide:ticket-plus" size="18" />
              Create Activity
            </UIButton>
          </UIDialogTrigger>
          <UIDialogScrollContent class="max-w-sm rounded-xl sm:max-w-xl">
            <UIDialogHeader>
              <UIDialogTitle>Create Activity</UIDialogTitle>
              <UIDialogDescription>
                <p>
                  Create a new activity for your organization. This will be
                  visible to all members immediately or you can save it as a
                  draft for later.
                </p>
              </UIDialogDescription>
            </UIDialogHeader>
            <OrganizationActivityForm
              @finished-action="
                async () => {
                  await refreshActivities();
                  modalOpen = false;
                }
              "
            />
          </UIDialogScrollContent>
        </UIDialog>
      </AppPermission>
    </div>

    <div class="flex items-center">
      <AppPermission role="admin">
        <UITabs v-model="activitiesTabStatus">
          <UITabsList>
            <UITabsTrigger value="published">
              <Icon class="mr-1" name="lucide:arrow-big-up-dash" />
              Published</UITabsTrigger
            >
            <UITabsTrigger value="drafts">
              <Icon class="mr-1" name="lucide:drafting-compass" />
              Drafts</UITabsTrigger
            >
          </UITabsList>
        </UITabs>
      </AppPermission>
      <!-- <UISelect>
        <UISelectTrigger
          class="ml-auto w-fit border text-muted-foreground hover:bg-background/20"
        >
          <Icon class="mr-1" name="lucide:filter" />
          <UISelectValue placeholder="Filter By" />
        </UISelectTrigger>
        <UISelectContent>
          <UISelectGroup>
            <UISelectLabel>Sort By</UISelectLabel>
            <UISelectItem value="none">None</UISelectItem>
            <UISelectItem value="createdAt">Created Date</UISelectItem>
            <UISelectItem value="scheduledStartDatetime">
              Scheduled Start Date
            </UISelectItem>
          </UISelectGroup>
        </UISelectContent>
      </UISelect> -->
    </div>
    <BaseSearchBar v-model="activitiesSearch" for-label="actvities" />
    <div :key="activitiesTabStatus" v-motion-fade-visible>
      <div
        v-if="!activityData || activityStatus === 'pending'"
        class="mt-5 flex flex-col gap-5"
      >
        <UISkeleton v-for="i in 5" :key="i" class="h-52 w-full p-5" />
      </div>
      <div
        v-else-if="activityData.activities.length"
        class="mt-5 flex flex-col items-start gap-5"
      >
        <UICard
          v-for="(activity, index) in activitiesSearch
            ? searchedActivities
            : activityData.activities"
          :key="activity.id"
          v-motion
          class="md:h-42 w-full rounded-xl text-left text-sm transition-all last:mb-20 hover:bg-white/60"
          :class="{ target: viewTransition === activity.id }"
          :initial="
            lastRoute.includes('act_')
              ? { y: 0, opacity: 1 }
              : { y: 30, opacity: 0 }
          "
          :enter="{
            y: 0,
            opacity: 1,
            transition: {
              type: 'keyframes',
              ease: 'easeIn',
              duration: 200,
              delay: index * 150,
            },
          }"
        >
          <UICardHeader class="pb-3">
            <UICardTitle class="flex justify-between">
              <NuxtLink
                :to="`/orgs/${route.params.organization_slug}/activities/${activity.id}`"
                class="hover:underline"
                @click="viewTransition = activity.id"
              >
                <Icon
                  class="mr-1"
                  name="lucide:square-arrow-out-up-right"
                  size="18"
                />
                <span
                  v-html="highlightSearch(activity.name, activitiesSearch)"
                />
              </NuxtLink>
              <AppPermission
                role="admin"
                class="flex flex-col items-center gap-1"
              >
                <UIButton
                  variant="outline"
                  size="xs"
                  class="hover:scale-105"
                  @click="
                    toast(
                      'Are you sure you want to send a reminder to all members?',
                      {
                        action: {
                          label: 'Send Reminder',
                          onClick: () => sendReminder(activity.id),
                        },
                      }
                    )
                  "
                >
                  <Icon name="lucide:send" />
                  {{
                    activity.lastReminderSentAt
                      ? "Resend Reminder"
                      : "Send Reminder"
                  }}
                </UIButton>
                <p
                  v-if="activity.lastReminderSentAt"
                  class="text-muted-foreground text-[0.6rem]"
                >
                  Last Sent
                  {{
                    $dayjs(new Date(activity.lastReminderSentAt), {
                      utc: true,
                    }).format("M/DD/YYYY")
                  }}
                </p>
              </AppPermission>
            </UICardTitle>
            <div
              class="flex w-fit flex-wrap items-center gap-1 rounded-xl bg-background/80 p-2 sm:p-3"
            >
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full bg-accent/5 p-1"
              >
                <UITooltip>
                  <UITooltipTrigger>
                    <Icon size="16" name="lucide:clipboard-copy" />
                  </UITooltipTrigger>
                  <UITooltipContent> Copy all activity info </UITooltipContent>
                </UITooltip>
              </div>
              <button
                class="chip bg-pink-500/30"
                @click="
                  copyToClipboard(
                    dayjs(activity.scheduledStartDatetime).format('MM/DD/YYYY')
                  )
                "
              >
                <Icon size="14" name="lucide:calendar" />

                {{
                  activity.scheduledStartDatetime === "TBD"
                    ? "TBD"
                    : new Date(activity.scheduledStartDatetime).toDateString()
                }}
              </button>
              <button
                class="chip bg-blue-500/30"
                :disabled="!activity.location"
                @click="copyToClipboard(activity.location!)"
              >
                <Icon size="14" name="lucide:map" />
                <span class="line-clamp-1 max-w-[20ch] sm:max-w-[32ch]">
                  {{ activity.location || "TBD" }}
                </span>
              </button>
              <button
                class="chip bg-orange-500/30"
                @click="copyToClipboard(String(activity.hours!))"
              >
                <Icon size="14" name="lucide:clock" />
                {{ activity.hours }}
                {{ activity.hours === 1 ? "hr" : "hrs" }}
              </button>
              <UIDropdownMenu v-if="activity.contactVerificationInfo?.name">
                <UIDropdownMenuTrigger as-child>
                  <button class="chip bg-green-500/30">
                    <Icon size="14" name="lucide:circle-user-round" />
                    {{ activity.contactVerificationInfo.name }}
                  </button>
                </UIDropdownMenuTrigger>
                <UIDropdownMenuContent class="flex flex-col gap-1 p-2">
                  <UIButton
                    v-for="item in [
                      {
                        content: activity.contactVerificationInfo.name,
                        icon: 'lucide:user-round',
                      },
                      {
                        content: activity.contactVerificationInfo.email,
                        icon: 'lucide:mail',
                      },
                      {
                        content: activity.contactVerificationInfo.phone,
                        icon: 'lucide:phone',
                      },
                    ]"
                    :key="item.content"
                    class="justify-start p-1 text-xs"
                    size="xs"
                    variant="outline"
                    :disabled="!item.content"
                    @click="copyToClipboard(item.content!)"
                  >
                    <Icon class="mr-1" :name="item.icon" size="16" />
                    {{ item.content || "Not Specified" }}
                  </UIButton>
                </UIDropdownMenuContent>
              </UIDropdownMenu>
            </div>
            <UICardDescription
              v-if="activity.description"
              class="line-clamp-2 max-w-[64ch] text-wrap"
            >
              <span
                v-html="highlightSearch(activity.description, activitiesSearch)"
              />
            </UICardDescription>
          </UICardHeader>
          <UICardContent>
            <div class="flex">
              <AppPermission allow-change only hide role="owner">
                <UIDialog
                  v-if="activitiesTabStatus === 'published'"
                  v-model:open="attendanceDialogOpen"
                >
                  <UIDialogTrigger as-child>
                    <UIButton
                      :disabled="
                        new Date(activity.scheduledStartDatetime).getTime() >
                        new Date().getTime()
                      "
                      variant="outline"
                      size="sm"
                    >
                      <Icon name="lucide:hand" />
                      Here for this activity
                    </UIButton>
                  </UIDialogTrigger>
                  <UIDialogContent
                    class="max-w-sm rounded-xl text-left text-sm"
                  >
                    <UIDialogHeader>
                      <UIDialogTitle>
                        <Icon name="lucide:hand" />
                        Here for {{ activity.name }} activity
                      </UIDialogTitle>
                      <UIDialogDescription>
                        <p>
                          Tell us how many hours you spent on this activity.
                        </p>
                      </UIDialogDescription>
                    </UIDialogHeader>
                    <OrganizationActivtyAttendanceForm
                      :activity="activity"
                      @close-modal="attendanceDialogOpen = false"
                    />
                  </UIDialogContent>
                </UIDialog>
              </AppPermission>

              <AppPermission class="flex items-center" role="admin">
                <UIButton
                  v-if="activitiesTabStatus === 'drafts'"
                  size="sm"
                  @click="publishAction(activity.id)"
                >
                  <Icon name="lucide:arrow-big-up-dash" />
                  Publish</UIButton
                >

                <UISeparator
                  v-if="
                    !(
                      selectedRole === 'owner' &&
                      activitiesTabStatus === 'published'
                    )
                  "
                  class="h-6 m-1"
                  orientation="vertical"
                />

                <UIButton
                  class="w-full underline"
                  variant="ghost"
                  size="sm"
                  as-child
                >
                  <NuxtLink
                    :to="`/orgs/${route.params.organization_slug}/activities/${activity.id}/edit`"
                  >
                    <Icon class="mr-1" name="lucide:edit" />
                    Edit
                  </NuxtLink>
                </UIButton>
              </AppPermission>
            </div>
          </UICardContent>
        </UICard>
      </div>
      <div v-else v-motion-fade-visible class="mt-5 flex flex-col gap-3">
        <p class="text-muted-foreground">
          No activities
          {{ activitiesTabStatus === "published" ? "published" : "drafted" }}
          activities yet
        </p>
      </div>
    </div>
    <BasePagination
      v-if="
        activityStatus === 'success' &&
        activityData &&
        activityData.activities.length
      "
      :key="`${route.path}`"
      :total="activityData.total"
      :container-ref="outsidePaginationRef"
    />
  </main>
</template>

<script setup lang="ts">
import { highlightSearch, toast } from "#imports";
import dayjs from "dayjs";
useSeoMeta({
  title: "Activities",
  description: "A list of activities in your organization.",
});

const clipboard = useClipboard();

const copyToClipboard = (text: string) => {
  clipboard.copy(text);
  toast(`📋 Copied '${text}' to clipboard`);
};

const modalOpen = ref(false);

const route = useRoute("orgs-organization_slug-activities");

const lastRoute = useLastRoute();
const router = useRouter();

const activitiesSearch = ref("");

const searchedActivities = ref<(typeof activitiesTable.$inferSelect)[]>([]);

const selectedRole = useSelectedRole();

const activitiesTabStatus = ref<"published" | "drafts">(
  route.query.published === "false" ? "drafts" : "published"
);

const selectedOrganizationPeriod = useSelectedPeriod();
const {
  data: activityData,
  status: activityStatus,
  refresh: refreshActivities,
} = await useLazyFetch(
  `/api/organizations/${route.params.organization_slug}/activities`,
  {
    server: false,
    query: {
      page: computed(() => route.query.page || 1),
      includeTotal: true,
      organizationPeriodId: computed(
        () => selectedOrganizationPeriod.value?.id
      ),
      isPublished: computed(() => activitiesTabStatus.value === "published"),
    },
    onResponseError: (res) => {
      toast.error(res.response._data.data.details);
    },
  }
);

const outsidePaginationRef = ref<HTMLDivElement>();

const attendanceDialogOpen = ref(false);

watch(selectedOrganizationPeriod, async () => {
  console.log(selectedOrganizationPeriod.value);
  await refreshActivities();
});

watch(activitiesTabStatus, async () => {
  await router.push({
    query: {
      ...route.query,
      published: String(activitiesTabStatus.value === "published"),
    },
  });
});

debouncedWatch(
  activitiesSearch,
  async () => {
    if (!activitiesSearch.value || activitiesSearch.value.length < 3) {
      return;
    }
    const activities = await $fetch(
      `/api/organizations/${route.params.organization_slug}/activities/search`,
      {
        query: {
          q: `${activitiesSearch.value}*`,
        },
      }
    );

    searchedActivities.value =
      activities as unknown as (typeof activitiesTable.$inferSelect)[];
  },
  {
    debounce: 500,
  }
);

const viewTransition = useViewTransition();

async function publishAction(activityId: string) {
  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}/activities/${activityId}`,
    {
      // @ts-expect-error - Nuxt Typescript issue
      method: "PUT",
      body: {
        action: "publish",
      },
    }
  );

  toast.promise(fetcher, {
    loading: "Publishing activity...",
    success: () => `Activity published`,
    error: () => "Failed to publish activity",
  });
  await refreshActivities();
}

async function sendReminder(activityId: string) {
  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}/activities/${activityId}/remind`,
    {
      method: "POST",
    }
  );
  toast.promise(fetcher, {
    loading: "Sending reminder...",
    success: () => `Reminder sent`,
    error: () => "Failed to send reminder",
  });
  await refreshActivities();
}
</script>

<style scoped>
.target {
  view-transition-name: selected-activity;
  contain: layout;
}
</style>
