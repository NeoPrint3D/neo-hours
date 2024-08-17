<template>
  <main ref="outsidePaginationRef" class="h-page space-y-3">
    <h1 class="text-4xl font-semibold">
      Welcome
      <span class="text-primary">
        {{ membership?.displayName }}
      </span>
    </h1>
    <h2 class="mt-10 text-2xl font-semibold">My Attendance</h2>

    <div class="overflow-auto p-1">
      <UITabs v-model="attendanceStatus" class="w-full">
        <UITabsList class="mb-4">
          <UITabsTrigger
            value="pending"
            :class="{ 'selected-tab': attendanceStatus === 'pending' }"
          >
            <Icon class="mr-1" name="lucide:clock" />
            Pending Approvals
          </UITabsTrigger>
          <UITabsTrigger value="approved">
            <Icon class="mr-1" name="lucide:check" />
            Approved Attendances
          </UITabsTrigger>

          <UITabsTrigger value="rejected">
            <Icon class="mr-1" name="lucide:x" />
            Rejected Attendances
          </UITabsTrigger>
        </UITabsList>
      </UITabs>

      <!-- <BaseSearchBar for-label="attendances" /> -->
      <UITable :key="attendanceStatus" v-motion-fade-visible class="h-[90%]">
        <UITableHeader>
          <UITableRow>
            <UITableHead> Activity Name </UITableHead>
            <UITableHead>Hours</UITableHead>
            <UITableHead> Date </UITableHead>
            <UITableHead v-if="['rejected'].includes(attendanceStatus)"
              >Action</UITableHead
            >
          </UITableRow>
        </UITableHeader>
        <UITableBody>
          <UITableRow
            v-for="attendance in attendances?.attendances"
            :key="attendance.id"
          >
            <UITableCell>
              <NuxtLink
                class="underline"
                :to="`/orgs/${route.params.organization_slug}/activities/${attendance.activity?.id}`"
              >
                {{ attendance.activity?.name }}
              </NuxtLink>
            </UITableCell>

            <UITableCell>{{
              `${attendance.requestedHours}${attendance.requestedHours === 1 ? " hr" : " hrs"}`
            }}</UITableCell>

            <UITableCell>{{
              new Date(
                attendance.scheduledStartDatetime || ""
              ).toLocaleDateString()
            }}</UITableCell>

            <UITableCell v-if="['rejected'].includes(attendanceStatus)">
              <AppPermission allow-change only hide role="owner">
                <UIDialog v-model:open="attendanceDialogOpen">
                  <UIDialogTrigger as-child>
                    <UIButton class="w-full justify-start" size="xs">
                      <Icon class="mr-1" name="lucide:pencil-line" />
                      Edit
                    </UIButton>
                  </UIDialogTrigger>
                  <UIDialogContent
                    class="max-w-lg rounded-xl text-left text-sm"
                  >
                    <UIDialogHeader>
                      <UIDialogTitle>
                        <Icon name="lucide:hand" />
                        Here for {{ attendance.activity?.name }} activity
                      </UIDialogTitle>
                      <UIDialogDescription>
                        <p>
                          Tell us how many hours you spent on this activity.
                        </p>
                      </UIDialogDescription>
                    </UIDialogHeader>
                    <OrganizationActivtyAttendanceForm
                      edit
                      :attendance-id="attendance.id"
                      :activity="attendance.activity!"
                      @finished-action="
                        () => {
                          attendanceDialogOpen = false;
                          refreshAttendances();
                        }
                      "
                    />
                  </UIDialogContent>
                </UIDialog>
              </AppPermission>
            </UITableCell>
          </UITableRow>
          <UITableRow v-if="attendances" class="font-bold text-xs">
            <UITableCell class="border">
              Total Activities: {{ attendances.total }}
            </UITableCell>
            <UITableCell class="border">
              Total Hours: {{ attendances.totalHours
              }}{{ attendances.totalHours === 1 ? "hr" : "hrs" }}</UITableCell
            >
            <UITableCell class="border">
              From:
              {{
                dayjs(
                  attendances.attendances[0]?.activity?.scheduledStartDatetime
                ).format("MM/DD/YYYY")
              }}
              -
              {{
                dayjs(
                  attendances.attendances[attendances.attendances.length - 1]
                    ?.activity?.scheduledStartDatetime
                ).format("MM/DD/YYYY")
              }}
            </UITableCell>
          </UITableRow>
        </UITableBody>

        <UITableCaption v-if="status === 'pending'">
          Loading attendances
          <Icon class="mr-1 animate-spin" name="lucide:loader" />
        </UITableCaption>
        <UITableCaption
          v-else-if="attendances && !attendances.attendances.length"
          >No attendances found.</UITableCaption
        >
        <UITableCaption v-else>A list of your attendances.</UITableCaption>
      </UITable>
    </div>

    <BasePagination
      v-if="attendances && attendances.attendances.length"
      :total="attendances.total"
      :container-ref="outsidePaginationRef"
    />
  </main>
</template>

<script setup lang="ts">
import dayjs from "dayjs";

useSeoMeta({
  title: "My Attendance",
  description: "My attendance page for your organization",
});

const attendanceDialogOpen = ref(false);

const route = useRoute("orgs-organization_slug-attendance");
const router = useRouter();

const membership = useMembership();

type AttendanceStatus = "pending" | "approved" | "rejected";

const attendanceStatus = ref(
  (route.query.status || "pending") as AttendanceStatus
);

const outsidePaginationRef = ref<HTMLDivElement>();

const selectedOrganizationPeriod = useSelectedPeriod();

console.log(selectedOrganizationPeriod.value);
const {
  data: attendances,
  refresh: refreshAttendances,
  status,
} = useLazyFetch(
  () =>
    `/api/organizations/${route.params.organization_slug}/activities/attendances`,
  {
    query: {
      status: computed(() => attendanceStatus.value),
      organizationPeriodId: selectedOrganizationPeriod.value?.id,
    },
    onResponseError: (res) => {
      toast.error(
        res.response._data.data.details || !selectedOrganizationPeriod.value
          ? "No Organization Period Avaliable."
          : "Failed to fetch attendances"
      );
    },
  }
);

watch(attendanceStatus, async () => {
  await router.push({
    query: {
      status: attendanceStatus.value,
    },
  });
});
</script>
