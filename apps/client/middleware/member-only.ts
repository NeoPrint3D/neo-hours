// export default defineNuxtRouteMiddleware(async (to) => {
//   const organizationMembership = useMembership()
//   const organization = useOrganization()
//   const auth = useAuth()

//   if (to.path.includes("/join")) return

//   if (auth.value.user && !auth.value.user.id) return navigateTo("/login")

//   const organizationData = await $fetch(`/api/organizations/${to.params.organization_slug}`, {
//     headers: useRequestHeaders(),
//     ignoreResponseError: true,
//   })

//   console.log(organizationData)

//   if ((organizationData as unknown as CustomError).statusCode) {
//     showError({ ...(organizationData as unknown as CustomError) })
//   } else if (organizationData) {
//     organization.value = organizationData as typeof organizationsTable.$inferSelect
//   }

//   const membershipData = await $fetch(
//     `/api/organizations/${to.params.organization_slug}/membership`,
//     {
//       headers: useRequestHeaders(),
//       ignoreResponseError: true,
//     }
//   )

//   if ((membershipData as unknown as CustomError).statusCode) {
//     // showError({ ...(membershipData as unknown as CustomError) })
//     return navigateTo(`/orgs/${organization.value?.slug}/join`)
//   } else if (membershipData.id) {
//     organizationMembership.value = membershipData
//   }
// })

export default defineNuxtRouteMiddleware(async (to) => {});
