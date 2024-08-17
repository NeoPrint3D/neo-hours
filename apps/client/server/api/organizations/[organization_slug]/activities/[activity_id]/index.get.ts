export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "member",
    }),
  ],
  handler: async (event) => {
    const validatedRouterParams = await getValidatedRouterParams(
      event,
      (params) =>
        z
          .object({
            organization_slug: z.string(),
            activity_id: z.string(),
          })
          .parse(params)
    );

    const db = useDrizzle();

    const activity = await db
      .select()
      .from(activitiesTable)
      .where(
        and(
          eq(activitiesTable.id, validatedRouterParams.activity_id),
          eq(
            activitiesTable.organizationId,
            validatedRouterParams.organization_slug
          )
        )
      )
      .limit(1);

    if (!activity.length) {
      throw createCustomError({
        statusCode: 404,
        statusMessage: "Not found",
        message: "Activity not found",
        data: {
          details: "Activity not found",
        },
      });
    }

    return activity[0];
  },
});
