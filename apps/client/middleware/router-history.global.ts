export default defineNuxtRouteMiddleware(async (to, from) => {
  const lastRoute = useLastRoute();
  lastRoute.value = from.path;
});
