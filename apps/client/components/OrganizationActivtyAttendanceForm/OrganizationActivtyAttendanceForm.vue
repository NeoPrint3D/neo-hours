<template>
  <form
    @submit.prevent="
      edit ? updateActivityAttedance() : createActivityAttedance(activity.id)
    "
  >
    <div class="flex flex-col gap-5">
      <UILabel for="hours"> Hours Spent </UILabel>
      <div class="flex items-center justify-center gap-2">
        <UIButton
          :disabled="createActivityAttendanceForm.hours === 0.5"
          type="button"
          variant="outline"
          size="icon"
          @click="
            createActivityAttendanceForm.hours = Math.max(
              0.5,
              createActivityAttendanceForm.hours - 0.5
            )
          "
        >
          <Icon name="lucide:minus" />
        </UIButton>
        <p
          :key="createActivityAttendanceForm.hours"
          v-motion-fade-visible
          class="border-gradient-content w-28 rounded-xl p-2 text-center text-lg font-semibold"
        >
          {{ createActivityAttendanceForm.hours }} hours
        </p>
        <UIButton
          :disabled="createActivityAttendanceForm.hours === activity.hours"
          type="button"
          size="icon"
          @click="
            createActivityAttendanceForm.hours = Math.min(
              createActivityAttendanceForm.hours + 0.5,
              activity.hours
            )
          "
        >
          <Icon name="lucide:plus" />
        </UIButton>
      </div>

      <UIButton
        class="w-full"
        variant="outline"
        type="button"
        @click="createActivityAttendanceForm.hours = activity.hours"
      >
        Use suggested hours
      </UIButton>

      <UIButton class="w-full" type="submit"> Submit </UIButton>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  activity: typeof activitiesTable.$inferSelect;
  attendanceId?: string;
  edit?: boolean;
}>();

const emit = defineEmits(["finishedAction"]);

const route = useRoute("orgs-organization_slug-activities");

const createActivityAttendanceForm = ref({
  hours: 0.5,
});

async function createActivityAttedance(activityId: string) {
  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}/activities/attendances`,
    {
      method: "POST",
      body: {
        activityId,
        hours: createActivityAttendanceForm.value.hours,
      },
      onResponse: ({ response }) => {
        if (getMessageStatusType(response.status) === "success") {
          useTrackEvent("attedance_created", {
            props: {
              organizationId: route.params.organization_slug,
              hours: createActivityAttendanceForm.value.hours,
            },
          });
        }
      },
      onResponseError: (res) => {
        console.log(res);
        toast.error(res.response._data.data.details);
      },
    }
  );

  toast.promise(fetcher, {
    loading: "Creating attendance...",
    success: (data) => data.message,
  });
  emit("finishedAction");
}

async function updateActivityAttedance() {
  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}/activities/attendances/${props.attendanceId}`,
    {
      method: "PUT",
      body: {
        action: "edit",
        data: {
          hours: createActivityAttendanceForm.value.hours,
        },
      },
    }
  );

  toast.promise(fetcher, {
    loading: "Updating attendance...",
    success: () => "Attendance updated successfully",
    error: () => "Failed to update attendance",
  });
  emit("finishedAction");
}
</script>
