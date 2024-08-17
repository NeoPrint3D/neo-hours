<template>
  <div
    v-if="
      hide
        ? !hasRequiredPermission(
            allowChange ? selectedRole : membership?.role,
            'owner'
          )
        : isOrganizationPermission(role)
          ? hasRequiredPermission(
              allowChange ? selectedRole : membership?.role,
              role
            )
          : auth.user && auth.user.verifiedAt
    "
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
// TODO Fix the bad organization patterns
const membership = useMembership();
const selectedRole = useSelectedRole();

const auth = useAuth();
defineProps<{
  role: AppPermissions;
  only?: boolean;
  hide?: boolean;
  allowChange?: boolean;
}>();
</script>
