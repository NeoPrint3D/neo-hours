export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();
  await navigateTo("/login");
  if (!auth.value.user?.verifiedAt) {
    console.log("redirecting to login");
    await navigateTo("/login");
  }
});
