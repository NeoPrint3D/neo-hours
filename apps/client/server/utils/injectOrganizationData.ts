export const injectOrganizationData = () => {
  return defineEventHandler({
    handler: async (event) => {
      const validatedParams = await getValidatedRouterParams(event, (params) =>
        z
          .object({
            organization_slug: z.string(),
          })
          .parse(params)
      );

      const db = useDrizzle();

      const organization = (
        await db
          .select()
          .from(organizationsTable)
          .where(eq(organizationsTable.slug, validatedParams.organization_slug))
      )[0];

      if (!organization) {
        throw createCustomError({
          statusCode: 404,
          statusMessage: "Organization not found",
          message: "Organization not found",
          data: {
            details: "Organization not found",
          },
        });
      }

      event.context.organization = organization;
    },
  });
};
