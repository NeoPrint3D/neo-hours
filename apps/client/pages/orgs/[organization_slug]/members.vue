<template>
  <main class="min-h-page space-y-3">
    <div class="flex justify-between items-center">
      <h1 class="text-4xl font-semibold">Members</h1>
      <div class="flex flex-col">
        <UIButton size="xs" @click="copyToClipboard(organization?.joinCode!)">
          <Icon class="mr-1" name="lucide:clipboard" />
          Join Code
        </UIButton>
      </div>
    </div>

    <UITabs
      v-model="membersTabStatus"
      class="w-full"
      @update:model-value="
        router.push({
          query: {
            status: membersTabStatus,
          },
        })
      "
    >
      <UITabsList class="mb-4">
        <UITabsTrigger
          v-if="organization?.requireMembershipApproval"
          value="pending"
          :class="{ 'selected-tab': membersTabStatus === 'pending' }"
        >
          <Icon class="mr-1" name="lucide:clock" />
          Pending Members
        </UITabsTrigger>
        <UITabsTrigger value="active">
          <Icon class="mr-1" name="lucide:check" />
          Active Members
        </UITabsTrigger>
        <UITabsTrigger value="inactive">
          <Icon class="mr-1" name="lucide:x" />
          Inactive Members
        </UITabsTrigger>
      </UITabsList>
    </UITabs>
    <BaseSearchBar v-model="membersSearch" for-label="members" />

    <UITable>
      <UITableHeader>
        <UITableRow>
          <UITableHead>
            <UICheckbox class="rounded-[4px] size-5" />
          </UITableHead>
          <UITableHead>Name</UITableHead>
          <UITableHead>Role</UITableHead>
          <UITableHead>Email</UITableHead>
          <UITableHead v-if="organization?.additionalInfo.type === 'school'"
            >School Id</UITableHead
          >
          <UITableHead v-if="organization?.additionalInfo.type === 'school'">
            Grade
          </UITableHead>
          <UITableHead>Actions</UITableHead>
        </UITableRow>
      </UITableHeader>

      <UITableBody v-if="members?.length && membership">
        <UITableRow
          v-for="(member, index) in membersSearch ? searchedMembers : members"
          :key="`${member.id}-${selectedEditedMember.id}`"
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: {
              type: 'keyframes',
              ease: 'easeIn',
              duration: 200,
              delay: index * 150,
            },
          }"
          :class="{
            'shadow-xl shadow-primary/20':
              selectedEditedMember.id === member.id,
          }"
        >
          <UITableCell>
            <UICheckbox class="rounded-[4px] size-5" />
          </UITableCell>
          <UITableCell>
            <div
              v-if="
                !selectedEditedMember.id ||
                selectedEditedMember.id !== member.id
              "
            >
              <span
                v-html="highlightSearch(member.displayName!, membersSearch)"
              />

              <span v-if="membership.id === member.id" class="font-bold">
                (Me)
              </span>
            </div>
            <UIInput
              v-else
              v-model="selectedEditedMember.displayName"
              class="w-fit"
              :default-value="selectedEditedMember.displayName"
            />
          </UITableCell>
          <UITableCell>
            <span
              v-if="
                !selectedEditedMember.id ||
                selectedEditedMember.id !== member.id
              "
              class="chip w-full justify-center bg-primary/20 capitalize"
            >
              {{ member.role }}
            </span>

            <UISelect v-else v-model="selectedEditedMember.role">
              <UISelectTrigger
                class="ml-auto w-fit border text-muted-foreground hover:bg-background/20"
              >
                <Icon class="mr-1" name="lucide:settings-2" />
                <UISelectValue :placeholder="member.role" />
              </UISelectTrigger>
              <UISelectContent>
                <UISelectGroup>
                  <UISelectLabel>Role</UISelectLabel>
                  <UISelectItem
                    v-for="role in membership.role === 'owner'
                      ? ['owner', 'admin', 'member']
                      : membership.role === 'admin'
                        ? ['admin', 'member']
                        : ['member']"
                    :key="role"
                    :value="role"
                    >{{ role }}</UISelectItem
                  >
                </UISelectGroup>
              </UISelectContent>
            </UISelect>
          </UITableCell>
          <UITableCell>
            {{ member.email! }}
          </UITableCell>
          <UITableCell
            v-if="
              organization?.additionalInfo.type === 'school' &&
              member.role !== 'owner'
            "
          >
            {{
              (member.additionalInfo as OrganizationMemberSchoolAdditionalInfo)
                .details.studentId
            }}
          </UITableCell>
          <UITableCell
            v-if="
              organization?.additionalInfo.type === 'school' &&
              member.role !== 'owner'
            "
          >
            {{
              (member.additionalInfo as OrganizationMemberSchoolAdditionalInfo)
                .details.grade
            }}th
          </UITableCell>

          <UITableCell
            v-if="
              hasRequiredPermission(membership?.role, member.role) &&
              membership.role !== member.role &&
              (!selectedEditedMember.id ||
                selectedEditedMember.id === member.id)
            "
          >
            <div
              v-if="membersTabStatus === 'pending'"
              class="flex flex-col gap-2"
            >
              <UIButton
                size="xs"
                class="w-28"
                @click="approveMember(member.id, member.email!)"
              >
                Approve
              </UIButton>
              <UIButton
                size="xs"
                variant="destructive"
                class="w-28"
                @click="rejectMember(member.id, member.email!)"
              >
                Reject
              </UIButton>
            </div>

            <div
              v-else-if="membersTabStatus === 'active'"
              class="flex flex-col gap-2"
            >
              <UIButton
                class="w-28"
                size="xs"
                @click="
                  () => {
                    if (selectedEditedMember.id === member.id) {
                      if (selectedEditedMember.role === 'owner') {
                        toast.info(
                          'Are you sure you want to make this member an owner?',
                          {
                            action: {
                              label: 'Yes',
                              onClick: () => {
                                updateMember();
                              },
                            },
                          }
                        );
                        return;
                      }
                      updateMember();
                    } else {
                      selectedEditedMember.id = member.id!;
                      selectedEditedMember.displayName = member.displayName!;
                      selectedEditedMember.role = member.role!;
                      selectedEditedMember.email! = member.email!;
                    }
                  }
                "
              >
                {{ selectedEditedMember.id === member.id ? "Update" : "Edit" }}
              </UIButton>
              <UIButton
                v-if="selectedEditedMember.id === member.id"
                class="w-28"
                size="xs"
                variant="outline"
                @click="
                  () => {
                    selectedEditedMember = {
                      id: '',
                      displayName: '',
                      role: '',
                      email: '',
                    };
                  }
                "
                >Cancel</UIButton
              >
              <UIButton
                size="xs"
                variant="destructive"
                class="w-28"
                @click="deactivateMember(member.id, member.email!)"
              >
                Deactivate
              </UIButton>
            </div>

            <div
              v-else-if="membersTabStatus === 'inactive'"
              class="flex flex-col gap-2"
            >
              <UIButton
                size="xs"
                class="w-28"
                @click="reactivateMember(member.id, member.email!)"
              >
                Reactivate
              </UIButton>
              <UIButton
                size="xs"
                variant="destructive"
                class="w-28"
                @click="deleteMember(member.id, member.email!)"
              >
                Delete
              </UIButton>
            </div>
          </UITableCell>
        </UITableRow>
      </UITableBody>

      <UITableCaption v-if="status === 'pending'">
        Loading members
        <Icon class="mr-1 animate-spin" name="lucide:loader" />
      </UITableCaption>
      <UITableCaption
        v-else-if="members && members.length === 0 && status === 'success'"
        >No members found.</UITableCaption
      >
      <UITableCaption v-else
        >A list of members in your organization.
      </UITableCaption>
    </UITable>
  </main>
</template>

<script setup lang="ts">
import type { OrganizationMemberSchoolAdditionalInfo } from "@neo-hours/db";
import { highlightSearch, toast, hasRequiredPermission } from "#imports";

definePageMeta({
  middleware: ["admin-only"],
});
useSeoMeta({
  title: "Members",
  description: "Members page for your organization",
});
const route = useRoute("orgs-organization_slug-members");
const router = useRouter();
const organization = useOrganization();
const membership = useMembership();

const membersTabStatus = ref((route.query.status as string) || "active");
const membersSearch = ref("");
const searchedMembers = ref<
  (typeof organizationMembersTable.$inferSelect & {
    email: string;
  })[]
>([]);
const {
  data: members,
  refresh: refreshMembers,
  status,
} = await useLazyFetch(
  `/api/organizations/${route.params.organization_slug}/members`,
  {
    query: {
      status: computed(() => membersTabStatus.value),
    },
    transform: (data) =>
      data.filter((member) => member.id !== membership.value?.id),
    onResponseError: (res) => {
      toast.error(res.response._data.data.details);
    },
  }
);

const selectedEditedMember = ref({
  id: "",
  displayName: "",
  role: "",
  email: "",
});

const clipboard = useClipboard();
const copyToClipboard = (text: string) => {
  clipboard.copy(text);
  toast(`📋 Copied '${text}' to clipboard`);
};

// const selectedMembers = ref<(typeof selectedEditedMember)[]>([]);

async function updateMember() {
  const fetcher = $fetch<{
    message: string;
  }>(
    `/api/organizations/${route.params.organization_slug}/members/${selectedEditedMember.value.id}`,
    {
      method: "PUT",
      body: {
        action: "edit",
        data: {
          displayName: selectedEditedMember.value.displayName,
          role: selectedEditedMember.value.role,
          email: selectedEditedMember.value.email,
        },
      },
      onResponseError: (error) => {
        console.error(error);
        toast.error(error.response._data.data.details);
      },
    }
  );

  toast.promise(fetcher, {
    loading: "Updating member...",
    success: (data) => data.message,
  });
  await refreshMembers();
  selectedEditedMember.value = {
    id: "",
    displayName: "",
    email: "",
    role: "",
  };
}

async function approveMember(memberId: string, memberEmail: string) {
  const res = await $fetch<{
    message: string;
  }>(
    `/api/organizations/${route.params.organization_slug}/members/${memberId}`,
    {
      method: "PUT",
      body: {
        action: "approve",
        data: {
          email: memberEmail,
        },
      },
      onResponseError: (error) => {
        console.error(error);
        toast.error(error.response._data.data.details);
      },
    }
  );

  await refreshMembers();

  toast.success(res.message);
  selectedEditedMember.value = {
    id: "",
    displayName: "",
    email: "",
    role: "",
  };
}

async function rejectMember(memberId: string, memberEmail: string) {
  const res = await $fetch<{
    message: string;
  }>(
    `/api/organizations/${route.params.organization_slug}/members/${memberId}`,
    {
      method: "PUT",
      body: {
        action: "reject",
        data: {
          email: memberEmail,
        },
      },
      onResponseError: (error) => {
        console.error(error);
        toast.error(error.response._data.data.details);
      },
    }
  );

  await refreshMembers();
  toast.success(res.message);
  selectedEditedMember.value = {
    id: "",
    displayName: "",
    email: "",
    role: "",
  };
}
async function deactivateMember(memberId: string, memberEmail: string) {
  const res = await $fetch<{
    message: string;
  }>(
    `/api/organizations/${route.params.organization_slug}/members/${memberId}`,
    {
      method: "PUT",
      body: {
        action: "deactivate",
        data: {
          email: memberEmail,
        },
      },
      onResponseError: (error) => {
        console.error(error);
        toast.error(error.response._data.data.details);
      },
    }
  );

  await refreshMembers();
  toast.success(res.message);
  selectedEditedMember.value = {
    id: "",
    displayName: "",
    email: "",
    role: "",
  };
}
async function reactivateMember(memberId: string, memberEmail: string) {
  const res = await $fetch<{
    message: string;
  }>(
    `/api/organizations/${route.params.organization_slug}/members/${memberId}`,
    {
      method: "PUT",
      body: {
        action: "reactivate",
        data: {
          email: memberEmail,
        },
      },
      onResponseError: (error) => {
        console.error(error);
        toast.error(error.response._data.data.details);
      },
    }
  );

  await refreshMembers();
  toast.success(res.message);
  selectedEditedMember.value = {
    id: "",
    displayName: "",
    email: "",
    role: "",
  };
}
async function deleteMember(memberId: string, memberEmail: string) {
  const res = await $fetch<{
    message: string;
  }>(
    `/api/organizations/${route.params.organization_slug}/members/${memberId}`,
    {
      method: "DELETE",
      body: {
        data: {
          email: memberEmail,
        },
      },
      onResponseError: (error) => {
        console.error(error);
        toast.error(error.response._data.data.details);
      },
    }
  );

  await refreshMembers();
  toast.success(res.message);
  selectedEditedMember.value = {
    id: "",
    displayName: "",
    email: "",
    role: "",
  };
}
debouncedWatch(
  membersSearch,
  async () => {
    if (!membersSearch.value || membersSearch.value.length < 3) {
      return;
    }

    console.log("Searching for members...");
    const members = await $fetch(
      `/api/organizations/${route.params.organization_slug}/members/search`,
      {
        query: {
          q: `${membersSearch.value}*`,
          status: membersTabStatus.value,
        },
      }
    );

    console.log("Members found:", members);
    searchedMembers.value = [
      ...(members as (typeof organizationMembersTable.$inferSelect)[]).filter(
        (m) => m.id !== membership.value?.id
      ),
    ] as unknown as (typeof organizationMembersTable.$inferSelect & {
      email: string;
    })[];
  },
  {
    debounce: 500,
  }
);
</script>

<style scoped>
.animate-wiggle {
  animation: wiggle 0.5s infinite;
  animation-timing-function: ease-in-out;
  transform-origin: center;
}

@keyframes wiggle {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  50% {
    transform: rotate(0deg);
  }
  75% {
    transform: rotate(-5deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
