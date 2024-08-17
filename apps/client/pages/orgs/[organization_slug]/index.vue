<script setup lang="ts">
const route = useRoute("orgs-organization_slug");
const membership = useMembership();

if (membership.value) {
  await navigateTo(`/orgs/${route.params.organization_slug}/home`);
} else {
  await navigateTo(`/orgs/${route.params.organization_slug}/join`);
}
</script>
