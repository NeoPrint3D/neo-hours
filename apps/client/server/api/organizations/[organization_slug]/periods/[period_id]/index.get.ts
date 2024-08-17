export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "member",
    }),
  ],
  handler: async (event) => {
    const validatedParams = await getValidatedRouterParams(event, (params) =>
      z
        .object({
          organization_slug: z.string(),
          period_id: z.string(),
        })
        .parse(params)
    );

    const db = useDrizzle();

    const organizationPeriod = await db
      .select()
      .from(organizationPeriodsTable)
      .where(
        and(
          eq(
            organizationPeriodsTable.organizationId,
            validatedParams.organization_slug
          ),
          eq(organizationPeriodsTable.id, validatedParams.period_id)
        )
      );

    return organizationPeriod[0];
  },
});
