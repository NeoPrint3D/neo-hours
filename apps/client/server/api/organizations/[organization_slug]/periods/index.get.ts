export default defineEventHandler({
  onRequest: [
    injectOrganizationData(),
    middlewareAuth({
      role: "verified",
    }),
  ],
  handler: async (event) => {
    const organization = event.context.organization!;
    const db = useDrizzle();

    const organizationPeriods = await db
      .select()
      .from(organizationPeriodsTable)
      .where(eq(organizationPeriodsTable.organizationId, organization.id))
      .orderBy(desc(organizationPeriodsTable.startDate));

    return organizationPeriods;
  },
});
