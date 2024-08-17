export default defineEventHandler({
  onRequest: [
    middlewareRateLimit({
      namespace: "organization.get",
      limit: 60,
      duration: 60,
    }),
    injectOrganizationData(),
  ],
  handler: async (event) => {
    const organization = event.context.organization!;

    return organization;
  },
});
