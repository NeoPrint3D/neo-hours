export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();
  to.meta.pageTransition = false;
  to.meta.layoutTransition = false;
  if (auth.value.user?.verifiedAt) {
    return navigateTo("/orgs");
  }
  if (auth.value.session && !auth.value.user?.verifiedAt)
    return navigateTo("/verify-email");
});
