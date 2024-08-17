<template>
  <nav
    v-if="organization"
    class="sticky top-0 z-50 flex h-screen w-48 flex-col self-start bg-background backdrop-blur-2xl"
  >
    <div class="flex h-14 flex-col items-center justify-center">
      <NuxtLink
        :key="organization.name"
        v-motion-fade
        class="flex items-center font-black text-2xl"
        to="/"
      >
        {{ organization.name }}
      </NuxtLink>
    </div>
    <UISeparator class="mx-auto w-3/4" />
    <ul class="flex flex-col gap-2 p-2">
      <li v-for="link in navLinks.topLinks" :key="link.path">
        <UIButton
          :key="selectedRole"
          v-motion-slide-visible-left
          class="w-full justify-start text-start"
          as-child
          size="sm"
          :variant="selectedLink === link.path ? 'default' : 'ghost'"
          @click="
            () => {
              selectedLink = link.path;
              viewTransition = '';
            }
          "
        >
          <NuxtLink :to="link.path">
            <Icon class="mr-1" size="16" :name="link.icon" />
            {{ link.name }}
          </NuxtLink>
        </UIButton>
      </li>
    </ul>
    <UISeparator class="mx-auto mt-auto w-3/4" />
    <ul class="flex flex-col gap-2 p-2">
      <li v-for="link in navLinks.bottomLinks" :key="link.path">
        <UIButton
          :key="selectedRole"
          v-motion-slide-visible-left
          class="w-full cursor-pointer justify-start text-start"
          size="sm"
          variant="ghost"
          :as-child="!!link.path"
          @click="link.action ? link.action() : (selectedLink = link.path)"
        >
          <NuxtLink v-if="link.path" :to="link.path">
            <Icon class="mr-1" size="16" :name="link.icon" />
            {{ link.name }}
          </NuxtLink>
          <span v-else>
            <Icon class="mr-1" size="16" :name="link.icon" />
            {{ link.name }}
          </span>
        </UIButton>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { sidebarLinks } from "../../lib/client/sidebarLinks";

const route = useRoute("orgs-organization_slug");

const organization = useOrganization();

const viewTransition = useViewTransition();
const selectedLink = ref(route.path);

const selectedRole = useSelectedRole();

const navLinks = ref(
  sidebarLinks(selectedRole.value, route.params.organization_slug)
);

watch(selectedRole, (role) => {
  navLinks.value = sidebarLinks(role, route.params.organization_slug);
});
</script>
