export default defineNuxtRouteMiddleware(async (to) => {
  const organizationMembership = useMembership();

  const auth = useAuth();

  if (
    auth.value.user &&
    !auth.value.user.id &&
    !hasRequiredPermission(organizationMembership.value?.role, "admin")
  ) {
    return navigateTo("/login");
  }
});
