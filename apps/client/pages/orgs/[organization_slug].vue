<template>
  <div
    v-if="
      ![`/orgs/${route.params.organization_slug}/join`].includes(route.path)
    "
  >
    <NuxtLayout>
      <div v-if="device.isMobile" class="w-full overflow-hidden">
        <div
          class="fixed h-[30vh] w-full -translate-y-[20vh] rounded-b-full"
          style="
            background: radial-gradient(
              circle at 50% 0,
              hsl(var(--primary) / 0.4),
              transparent
            );
          "
        />
        <div class="fixed inset-0 backdrop-blur-2xl" />
        <OrganizationHeaderMobile />
        <div class="relative z-40 p-5 pb-20">
          <NuxtPage />
        </div>
      </div>
      <div v-else class="flex w-full bg-background">
        <OrganizationSidebarDesktop />

        <div class="h-screen w-full overflow-hidden">
          <OrganizationHeaderDesktop />

          <div class="relative z-40 w-[calc(100%-0rem)] rounded-l-3xl border">
            <OrganizationBackground />

            <div
              class="relative z-50 h-[calc(100vh-3.5rem)] overflow-y-auto p-7 xl:p-12"
              style="scrollbar-gutter: stable"
            >
              <NuxtPage />
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
  <NuxtLayout v-else name="default">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute("orgs-organization_slug");

const membership = useMembership();
const organization = useOrganization();
const auth = useAuth();
const device = useDevice();

if (!auth.value.user?.id) await navigateTo("/login");

const { data: organizationData } = await useFetch(
  `/api/organizations/${route.params.organization_slug}`
);
definePageMeta({
  layout: false,
});

useSeoMeta({
  titleTemplate: `${organizationData.value?.name} | %s`,
  description: organizationData.value?.description,
});

if (!organizationData.value) {
  await navigateTo("/orgs");
} else if (organizationData) {
  organization.value =
    organizationData.value as typeof organizationsTable.$inferSelect;
}

const { data: membershipData } = await useFetch(
  `/api/organizations/${route.params.organization_slug}/membership`
);

if (membershipData.value) {
  membership.value =
    membershipData.value as typeof organizationMembersTable.$inferSelect;
}

if (
  !membershipData.value &&
  route.path !== `/orgs/${route.params.organization_slug}/join`
)
  await navigateTo(`/orgs/${route.params.organization_slug}/join`);

if (
  membershipData.value &&
  route.path === `/orgs/${route.params.organization_slug}/join`
)
  await navigateTo(`/orgs/${route.params.organization_slug}/home`);

const periods = usePeriods();
const { data: periodsData } = await useFetch(
  `/api/organizations/${route.params.organization_slug}/periods`
);
periods.value = periodsData.value;
</script>
