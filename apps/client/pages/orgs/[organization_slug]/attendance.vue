<template>
  <main ref="outsidePaginationRef" class="h-page space-y-3">
    <h1 class="text-4xl font-semibold">Attendance</h1>

    <div class="overflow-auto space-y-5">
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

      <BaseSearchBar v-model="attendanceSearch" for-label="attendances" />
      <UITable :key="attendanceStatus" v-motion-fade-visible class="h-[90%]">
        <UITableHeader>
          <UITableRow>
            <UITableHead>Member</UITableHead>
            <UITableHead> Activity Name </UITableHead>
            <UITableHead>Hours {{ attendanceStatus }} </UITableHead>
            <UITableHead>Action</UITableHead>
          </UITableRow>
        </UITableHeader>
        <UITableBody>
          <UITableRow
            v-for="attendance in attendanceSearch.length > 3
              ? searchedAttendances
              : attendances!.attendances"
            :key="attendance.id"
          >
            <UITableCell class="font-medium">
              {{ attendance.member?.name }}
            </UITableCell>
            <UITableCell>
              <NuxtLink
                class="underline"
                :to="`/orgs/${route.params.organization_slug}/activities/${attendance.activity?.id}`"
              >
                <span
                  v-html="
                    highlightSearch(
                      attendance.activity?.name || '',
                      attendanceSearch
                    )
                  "
                />
              </NuxtLink>
            </UITableCell>

            <UITableCell>{{
              `${attendance.hours}${attendance.hours === 1 ? " hr" : " hrs"}`
            }}</UITableCell>
            <UITableCell>
              <div class="flex w-fit flex-col justify-center gap-1">
                <UIButton
                  v-show="['pending', 'rejected'].includes(attendanceStatus)"
                  size="xs"
                  class="w-full justify-start"
                  @click="updateAttendance(attendance.id, 'approve')"
                >
                  <Icon class="mr-1" name="lucide:check" />
                  Approve
                </UIButton>
                <UIButton
                  v-show="['pending', 'approved'].includes(attendanceStatus)"
                  class="w-full justify-start"
                  variant="destructive"
                  size="xs"
                  @click="updateAttendance(attendance.id, 'reject')"
                >
                  <Icon class="mr-1" name="lucide:x" />
                  Reject
                </UIButton>
              </div>
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
        <UITableCaption v-else
          >A list of attendances in your organization.</UITableCaption
        >
      </UITable>
    </div>
    <!-- 
          <div
            v-if="paginatedAttendances.length"
            class="mt-20 flex w-full items-end justify-between"
          >
            <UIButton variant="outline" :disabled="currentPage === 1" @click="currentPage--">
              Previous
            </UIButton>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <UIButton
              variant="outline"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              Next
            </UIButton>
          </div> -->

    <BasePagination
      v-if="attendances && attendances.attendances.length"
      :total="attendances.total"
      :container-ref="outsidePaginationRef"
    />
  </main>
</template>

<script setup lang="ts">
import { highlightSearch } from "#imports";
useSeoMeta({
  title: "Attendance",
  description: "Attendance page for your organization",
});
const route = useRoute("orgs-organization_slug-attendance");
const router = useRouter();

type AttendanceStatus = "pending" | "approved" | "rejected";

const attendanceStatus = ref(
  (route.query.status || "approved") as AttendanceStatus
);

const outsidePaginationRef = ref<HTMLDivElement>();

const selectedOrganizationPeriod = useSelectedPeriod();

const attendanceSearch = ref("");
const searchedAttendances = ref<
  (typeof activityAttendancesTable.$inferSelect & {
    activity: {
      id: string;
      name: string;
    };
  })[]
>([]);

const {
  data: attendances,
  refresh: refreshAttendances,
  status,
} = await useLazyFetch(
  () =>
    `/api/organizations/${route.params.organization_slug}/activities/attendances`,
  {
    query: {
      status: computed(() => attendanceStatus.value),
      organizationPeriodId: selectedOrganizationPeriod.value?.id,
    },
    onResponseError: (res) => {
      toast.error(res.response._data.data.details);
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
watchDebounced(attendanceSearch, async () => {
  if (!selectedOrganizationPeriod.value) {
    toast.error("Please select an organization period.");
    return;
  }

  if (!attendanceSearch.value && attendanceSearch.value.length < 3) {
    toast.error("Please enter a search query.");
    return;
  }

  const attendances = await $fetch(
    `/api/organizations/:organization_slug/activities/attendances/search`,
    {
      query: {
        q: `${attendanceSearch.value}*`,
        status: attendanceStatus.value,
      },
    }
  );

  searchedAttendances.value = attendances as typeof searchedAttendances.$value;
});
async function updateAttendance(
  attendanceId: string,
  action: "approve" | "reject"
) {
  if (!selectedOrganizationPeriod.value) {
    toast.error("Please select an organization period.");
    return;
  }
  const fetcher = $fetch<{
    message: string;
  }>(
    `/api/organizations/${route.params.organization_slug}/activities/attendances/${attendanceId}`,
    {
      method: "PUT",
      body: {
        action,
      },
      onResponse: async (res) => {
        refreshAttendances();
      },
      onResponseError: (res) => {
        toast.error(res.response._data.data.details);
      },
    }
  );

  toast.promise(fetcher, {
    loading: "Updating attendance...",
    success: (data) => data.message,
  });
}
</script>
