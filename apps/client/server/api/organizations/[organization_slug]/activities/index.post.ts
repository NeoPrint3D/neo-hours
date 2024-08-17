export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "admin",
    }),
  ],
  handler: async (event) => {
    const validatedBody = await readValidatedBody(event, (body) =>
      z
        .object({
          name: z
            .string()
            .min(3, "Minimum 3 characters")
            .max(255, "Maximum 255 characters"),
          hours: z
            .number()
            .min(0.5, "Minimum 0.5 hours")
            .max(24, "Maximum 24 hours"),
          description: z.string().optional(),
          scheduledStartDatetime: z.string(),
          scheduledEndDatetime: z.string().optional(),
          location: z.string().optional(),
          organizationPeriodId: z
            .string()
            .min(1, "Organization period is required"),
          contactVerificationInfo: z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
          }),
          isPublished: z.boolean(),
        })
        .parse(body)
    );

    const validatedParams = await getValidatedRouterParams(event, (params) =>
      z
        .object({
          organization_slug: z.string(),
        })
        .parse(params)
    );

    console.log(validatedBody);
    const db = useDrizzle();

    await db.insert(activitiesTable).values({
      ...validatedBody,
      organizationId: validatedParams.organization_slug,
      contactVerificationInfo: {
        name: validatedBody.contactVerificationInfo.name || "",
        email: validatedBody.contactVerificationInfo.email || "",
        phone: validatedBody.contactVerificationInfo.phone || "",
      },
    });

    return {
      message: "Successfully created activity",
    };
  },
});
