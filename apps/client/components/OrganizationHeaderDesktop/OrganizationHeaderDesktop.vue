<template>
  <header>
    <nav
      class="sticky top-0 z-50 flex h-14 w-full items-center bg-background px-1 backdrop-blur-2xl"
    >
      <div class="flex items-center gap-2">
        <p class="font-bold">Period:</p>
        <UISelect v-model="selectedOrganizationPeriodId">
          <UISelectTrigger class="w-fit">
            <UISelectValue
              class="font-bold"
              :placeholder="
                periods && periods.length > 0
                  ? periods[0].name
                  : 'No Periods Found'
              "
            />
          </UISelectTrigger>
          <UISelectContent>
            <UISelectGroup>
              <UISelectItem
                v-for="organizationPeriod in periods"
                :key="organizationPeriod.id"
                :value="organizationPeriod.id"
              >
                {{ organizationPeriod.name }}
              </UISelectItem>
              <UIButton
                v-if="!periods?.length"
                class="w-full"
                size="xs"
                as-child
              >
                <NuxtLink
                  :to="`/orgs/${route.params.organization_slug}/periods?createPeriod=true`"
                >
                  <Icon name="lucide:calendar-plus" />
                  Create Period
                </NuxtLink>
              </UIButton>
            </UISelectGroup>
          </UISelectContent>
        </UISelect>
      </div>

      <div
        v-if="hasRequiredPermission(membership?.role, 'admin')"
        class="ml-auto flex items-center gap-2"
      >
        <p class="font-bold">Role:</p>
        <UISelect v-model="selectedRole">
          <UISelectTrigger class="gap-1.5 p-2">
            <div
              class="flex size-7 items-center justify-center rounded-full bg-secondary p-3 text-xs"
            >
              {{
                membership?.displayName
                  .split(" ")
                  .splice(0, 2)
                  .map((name) => name[0])
                  .join("")
              }}
            </div>
            <UISelectValue
              class="capitalize font-black"
              :placeholder="selectedRole || 'Select Permission'"
            />
          </UISelectTrigger>
          <UISelectContent>
            <UISelectGroup>
              <UISelectItem
                v-for="permission in avaliablePermissions"
                :key="permission"
                :value="permission"
                class="capitalize"
              >
                {{ permission }}
              </UISelectItem>
            </UISelectGroup>
          </UISelectContent>
        </UISelect>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { hasRequiredPermission } from "#imports";
const membership = useMembership();

const avaliablePermissions = computed<AppPermissions[]>(() => {
  switch (membership.value?.role) {
    case "owner":
      return ["owner", "admin", "member"];
    case "admin":
      return ["admin", "member"];
    case "member":
      return ["member"];
    default:
      return [];
  }
});
const route = useRoute("orgs-organization_slug");
const periods = usePeriods();

const selectedOrganizationPeriodId = ref(periods.value![0]?.id);
const selectedOrganizationPeriod = useSelectedPeriod();
const currentPath = computed(() => route.path);
// TODO: fix this for client side too
selectedOrganizationPeriod.value = periods.value![0];

watch(currentPath, () => {
  selectedOrganizationPeriodId.value = periods.value![0]?.id;
});

watch(selectedOrganizationPeriodId, () => {
  selectedOrganizationPeriod.value = periods.value!.find(
    (period) => period.id === selectedOrganizationPeriodId.value
  )!;
});
//

const selectedRole = useSelectedRole();
</script>
