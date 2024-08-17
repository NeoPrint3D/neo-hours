<template>
  <Teleport to="#teleports">
    <div
      v-if="isDrawerOpen"
      class="fixed inset-0 z-50 bg-black bg-opacity-50"
      @click="isDrawerOpen = false"
    />
    <div
      v-if="isDrawerOpen"
      ref="mobileSidebarRef"
      v-motion-fade-visible
      class="fixed z-50 top-0 bottom-0 right-0 w-[80dvw] translate-x-0 transform border-b border-l bg-background/60 p-3 shadow-lg backdrop-blur-xl transition-transform duration-200"
    >
      <div class="flex items-center justify-between">
        <UIButton
          class="ml-auto"
          variant="ghost"
          size="icon"
          @click="isDrawerOpen = false"
        >
          <Icon size="20" name="lucide:x" />
        </UIButton>
      </div>
      <div class="flex h-[calc(100dvh-3.5rem)] flex-col gap-5 px-3">
        <h2 class="text-4xl font-black capitalize">
          {{ organization?.name }}
        </h2>
        <div class="flex flex-col gap-3">
          <div class="flex gap-3 items-center">
            <p class="font-bold">Period:</p>

            <UISelect v-model="selectedOrganizationPeriodId">
              <UISelectTrigger class="w-full">
                <UISelectValue
                  class="font-bold"
                  :placeholder="
                    periods && periods.length > 0
                      ? `${dayjs(periods[0].startDate, { utc: true }).format(
                          'MMM DD, YYYY'
                        )} - ${dayjs(periods[0].endDate, { utc: true }).format(
                          'MMM DD, YYYY'
                        )}`
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
                    {{
                      dayjs(organizationPeriod.startDate, { utc: true }).format(
                        "MMM DD, YYYY"
                      )
                    }}
                    -
                    {{
                      dayjs(organizationPeriod.endDate, { utc: true }).format(
                        "MMM DD, YYYY"
                      )
                    }}
                  </UISelectItem>
                </UISelectGroup>
              </UISelectContent>
            </UISelect>
          </div>

          <div
            v-if="hasRequiredPermission(membership?.role, 'admin')"
            class="flex items-center gap-3"
          >
            <p class="font-bold">Role:</p>
            <UISelect v-model="selectedRole">
              <UISelectTrigger class="gap-1.5 w-full">
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
        </div>

        <UIButton
          v-for="link in navLinks.topLinks"
          :key="`${link.path}-${selectedRole}`"
          v-motion-slide-visible-left
          class="justify-start text-lg"
          as-child
          :variant="selectedLink === link.path ? 'default' : 'ghost'"
          @click="
            () => {
              selectedLink = link.path;
              isDrawerOpen = false;
            }
          "
        >
          <NuxtLink :to="link.path">
            <Icon class="mr-1" size="24" :name="link.icon" />
            {{ link.name }}
          </NuxtLink>
        </UIButton>

        <div class="mt-auto flex flex-col gap-3 mb-3">
          <UIButton
            v-for="link in navLinks.bottomLinks"
            :key="`${link.name}-${selectedRole}`"
            v-motion-slide-visible-left
            class="justify-start"
            :as-child="!!link.path"
            variant="ghost"
            @click="link.action && link.action()"
          >
            <NuxtLink
              v-if="link.path"
              :to="link.path"
              @click="
                () => {
                  selectedLink = link.path;
                  isDrawerOpen = false;
                }
              "
            >
              <Icon class="mr-1" size="24" :name="link.icon" />
              {{ link.name }}
            </NuxtLink>
            <span v-else>
              <Icon class="mr-1" size="24" :name="link.icon" />
              {{ link.name }}
            </span>
          </UIButton>
        </div>
      </div>
    </div>
  </Teleport>
  <header
    :key="String(y > 64)"
    v-motion-fade
    class="border-gradient-content z-50 m-3 h-16 rounded-xl backdrop-blur-xl transition-all"
    :class="
      y > 64
        ? 'fixed left-0 right-0 top-0 shadow-xl shadow-secondary/20'
        : 'shadow-0 relative'
    "
  >
    <div class="flex h-full items-center justify-between px-4">
      <div>
        <NuxtLink
          v-if="organization"
          class="flex items-center text-2xl font-black"
          to="/"
        >
          {{ organization.name }}
        </NuxtLink>
      </div>
      <div>
        <div
          v-if="auth.session && auth.user?.verifiedAt"
          class="flex items-center gap-2"
        >
          <UIButton size="sm" as-child variant="ghost">
            <NuxtLink :to="`/orgs/${route.params.organization_slug}/home`">
              <Icon size="20" name="lucide:home" class="mr-1" />
              Home
            </NuxtLink>
          </UIButton>

          <UIButton
            size="icon"
            variant="outline"
            @click="isDrawerOpen = !isDrawerOpen"
          >
            <Icon size="32" name="lucide:menu" />
          </UIButton>
        </div>
        <div v-if="auth.session && !auth.user?.verifiedAt">
          <UIButton size="sm">
            <NuxtLink to="/verify-email"> Finish Verifying Email </NuxtLink>
          </UIButton>
        </div>
        <div v-else-if="!auth.session" class="flex gap-2">
          <UIButton variant="ghost">
            <NuxtLink class="btn btn-primary" to="/login"> Login </NuxtLink>
          </UIButton>
          <UIButton>
            <NuxtLink class="btn btn-secondary" to="/signup"> Signup </NuxtLink>
          </UIButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { hasRequiredPermission } from "#imports";
import dayjs from "dayjs";
const { y } = useWindowScroll();
const auth = useAuth();
const membership = useMembership();
const organization = useOrganization();

const isDrawerOpen = ref(false);

const route = useRoute("orgs-organization_slug");
const selectedLink = ref(route.path);

const mobileSidebarRef = ref<HTMLDivElement>();
const periods = usePeriods();
const currentPath = computed(() => route.path);

const selectedOrganizationPeriodId = ref(periods.value![0]?.id);
const selectedOrganizationPeriod = useSelectedPeriod();

// server-side selectedOrganizationPeriodId
selectedOrganizationPeriod.value = periods.value![0];

watch(currentPath, () => {
  selectedOrganizationPeriod.value = periods.value![0];
});
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
const selectedRole = useSelectedRole();

watch(selectedOrganizationPeriodId, () => {
  selectedOrganizationPeriod.value = periods.value!.find(
    (period) => period.id === selectedOrganizationPeriodId.value
  )!;
});
onMounted(() => {
  if (mobileSidebarRef.value) {
    mobileSidebarRef.value.focus();
  }
});

const navLinks = ref(
  sidebarLinks(selectedRole.value, route.params.organization_slug as string)
);

watch(selectedRole, (role) => {
  navLinks.value = sidebarLinks(role, route.params.organization_slug as string);
});
</script>
