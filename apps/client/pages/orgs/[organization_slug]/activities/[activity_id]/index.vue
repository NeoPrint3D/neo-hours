<template>
  <main v-if="activity">
    <NuxtLink
      :to="`/orgs/${route.params.organization_slug}/activities/`"
      class="text-primary hover:underline inline-flex items-center mb-6"
    >
      <Icon name="lucide:arrow-left" class="mr-2" />
      Back to activities
    </NuxtLink>

    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">
        {{ activity.name }}
      </h1>
      <AppPermission role="admin">
        <span class="chip text-base px-3 my-3">
          {{ activity.isPublished ? "Published" : "Draft" }}</span
        >
      </AppPermission>
      <p class="text-muted-foreground">{{ activity.description }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UICard>
        <UICardHeader>
          <UICardTitle>Activity Details</UICardTitle>
        </UICardHeader>
        <UICardContent>
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-sm text-muted-foreground mb-1">
                <Icon name="lucide:calendar" class="mr-0.5" />
                Date
              </h3>
              <p>
                {{
                  $dayjs(new Date(activity.scheduledStartDatetime)).format(
                    "MMMM DD, YYYY"
                  )
                }}
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-sm text-muted-foreground mb-1">
                <Icon name="lucide:clock" class="mr-0.5" />
                Time
              </h3>
              <p>
                {{
                  $dayjs(new Date(activity.scheduledStartDatetime), {}).format(
                    "h:mm A"
                  )
                }}
                -
                {{
                  activity.scheduledEndDatetime
                    ? $dayjs(new Date(activity.scheduledEndDatetime)).format(
                        "h:mm A"
                      )
                    : "TBD"
                }}
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-sm text-muted-foreground mb-1">
                <Icon name="lucide:hourglass" class="mr-0.5" />
                Duration
              </h3>
              <p>
                {{ activity.hours }}
                {{ activity.hours === 1 ? "hour" : "hours" }}
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-sm text-muted-foreground mb-1">
                <Icon name="lucide:map" class="mr-0.5" />
                Location
              </h3>
              <button
                class="underline text-start"
                @click="openMapsWithDirections(activity.location!)"
              >
                {{ activity.location || "Not specified" }}
              </button>
            </div>
          </div>
        </UICardContent>
      </UICard>

      <UICard>
        <UICardHeader>
          <UICardTitle>Contact Verification</UICardTitle>
        </UICardHeader>
        <UICardContent>
          <div v-if="activity.contactVerificationInfo" class="space-y-2">
            <div
              v-for="(value, key) in activity.contactVerificationInfo"
              :key="key"
            >
              <h3 class="font-semibold text-sm text-muted-foreground mb-1">
                {{ formatKey(key) }}
              </h3>
              <p>{{ value || "Not specified" }}</p>
            </div>
          </div>
          <p v-else class="text-muted-foreground">
            No contact verification info available
          </p>
        </UICardContent>
      </UICard>
    </div>

    <UICard class="mt-6 mb-10">
      <UICardHeader>
        <UICardTitle> Actions </UICardTitle>
      </UICardHeader>
      <UICardContent>
        <AppPermission allow-change only hide role="owner">
          <UIDialog v-model:open="attendanceDialogOpen">
            <UIDialogTrigger as-child>
              <UIButton
                :disabled="
                  new Date(activity.scheduledStartDatetime).getTime() >
                  new Date().getTime()
                "
                variant="outline"
                size="xs"
                class="w-full"
                @click.prevent
              >
                <Icon name="lucide:hand" />
                Here for this activity
              </UIButton>
            </UIDialogTrigger>
            <UIDialogContent class="max-w-lg rounded-xl text-left text-sm">
              <UIDialogHeader>
                <UIDialogTitle>
                  <Icon name="lucide:hand" />
                  Here for {{ activity.name }} activity
                </UIDialogTitle>
                <UIDialogDescription>
                  <p>Tell us how many hours you spent on this activity.</p>
                </UIDialogDescription>
              </UIDialogHeader>
              <OrganizationActivtyAttendanceForm
                :activity="activity"
                @finished-action="attendanceDialogOpen = false"
              />
            </UIDialogContent>
          </UIDialog>
          <UISeparator class="my-3 w-[95%] mx-auto" />
        </AppPermission>
        <AppPermission role="admin">
          <div class="flex flex-col sm:flex-row gap-x-1 gap-y-3 flex-wrap">
            <UIButton as-child size="xs">
              <NuxtLink
                :to="`/orgs/${route.params.organization_slug}/activities/${route.params.activity_id}/edit`"
              >
                <Icon name="lucide:edit" class="mr-2" />
                Edit Activity
              </NuxtLink>
            </UIButton>
            <UIButton variant="outline" size="xs" @click="sendReminder">
              <Icon name="lucide:send" class="mr-2" />
              {{
                activity.lastReminderSentAt
                  ? "Resend Reminder"
                  : "Send Reminder"
              }}
            </UIButton>
            <UIButton variant="outline" size="xs" @click="publishAction">
              <Icon
                :name="
                  activity.isPublished
                    ? 'lucide:arrow-big-down-dash'
                    : 'lucide:arrow-big-up-dash'
                "
                class="mr-2"
              />
              {{ activity.isPublished ? "Unpublish" : "Publish" }} Activity
            </UIButton>
          </div>
          <p
            v-if="activity.lastReminderSentAt"
            class="text-muted-foreground text-xs text-center mt-2"
          >
            Last reminder sent:
            {{
              $dayjs(new Date(activity.lastReminderSentAt), {}).format(
                "MMMM DD, YYYY"
              )
            }}
            at
            {{ $dayjs(new Date(activity.lastReminderSentAt)).format("h:mm A") }}
          </p>

          <UISeparator class="my-3 w-[95%] mx-auto" />
          <UIButton
            variant="destructive"
            size="xs"
            class="w-full"
            @click="deleteActivity"
          >
            <Icon name="lucide:trash" class="mr-2" />
            Delete Activity
          </UIButton>
        </AppPermission>
      </UICardContent>
    </UICard>
  </main>
</template>

<script setup lang="ts">
import { openMapsWithDirections } from "#imports";
const route = useRoute("orgs-organization_slug-activities-activity_id");
const attendanceDialogOpen = ref(false);
const { data: activity, refresh: refreshActivity } = await useFetch<
  typeof activitiesTable.$inferSelect
>(
  `/api/organizations/${route.params.organization_slug}/activities/${route.params.activity_id}`
);

useSeoMeta({
  title: activity.value?.name,
});
const formatKey = (key: string) => {
  return key
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

async function publishAction() {
  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}/activities/${route.params.activity_id}`,
    {
      // @ts-expect-error - Nuxt Typescript issue
      method: "PUT",
      body: {
        action: activity.value?.isPublished ? "unpublish" : "publish",
      },
    }
  );

  toast.promise(fetcher, {
    loading: "Updating activity...",
    success: () =>
      `Activity ${activity.value?.isPublished ? "unpublished" : "published"}`,
    error: () => "Failed to update activity",
  });

  await refreshActivity();
}
async function sendReminder() {
  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}/activities/${route.params.activity_id}/remind`,
    {
      method: "POST",
    }
  );
  toast.promise(fetcher, {
    loading: "Sending reminder...",
    success: () => "Reminder sent to all members",
    error: () => "Failed to send reminder",
  });
  await refreshActivity();
}

async function deleteActivity() {
  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}/activities/${route.params.activity_id}`,
    {
      // @ts-expect-error - Nuxt Typescript issue
      method: "DELETE",
    }
  );
  toast.promise(fetcher, {
    loading: "Deleting activity...",
    success: () => "Activity deleted",
    error: () => "Failed to delete activity",
  });
  await navigateTo(`/orgs/${route.params.organization_slug}/activities`);
}
</script>
