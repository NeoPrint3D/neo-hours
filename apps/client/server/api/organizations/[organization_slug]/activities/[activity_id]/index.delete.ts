export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "admin",
    }),
  ],
  handler: async (event) => {
    const validatedRouterParams = await getValidatedRouterParams(
      event,
      (params) =>
        z
          .object({
            activity_id: z.string(),
          })
          .parse(params)
    );

    const db = useDrizzle();

    await db
      .delete(activitiesTable)
      .where(eq(activitiesTable.id, validatedRouterParams.activity_id));

    return {
      message: "Successfully deleted activity",
    };
  },
});
