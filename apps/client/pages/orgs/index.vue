<template>
  <main class="min-h-page space-y-3">
    <h1 class="mt-10 text-3xl font-bold">Organizations</h1>
    <p class="text-lg">Public organizations</p>
    <ul v-if="organizations" class="grid sm:grid-cols-2 gap-3">
      <li
        v-for="organization in organizations.publicOrganizations"
        :key="organization.id"
        class="border-gradient-content rounded-3xl p-5"
      >
        <NuxtLink :to="`/orgs/${organization.slug}/join`">{{
          organization.name
        }}</NuxtLink>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const { data: organizations } = await useFetch("/api/organizations");
</script>
