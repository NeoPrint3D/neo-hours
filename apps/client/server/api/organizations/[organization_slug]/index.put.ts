import { alphabet, generateRandomString } from "oslo/crypto";

const baseSchema = z.object({
  action: z.enum(["edit", "regenerate_join_code", "update_additional_info"]),
});

const editSchema = baseSchema.extend({
  action: z.literal("edit"),
  data: z.object({
    name: z
      .string()
      .min(3, "Minimum 3 characters")
      .max(255, "Maximum 255 characters")
      .optional(),
    description: z.string().optional(),
    organizationSlug: z.string().optional(),
    public: z.boolean().optional(),
    requireMembershipApproval: z.boolean().optional(),
  }),
});

const regenerateJoinCodeSchema = baseSchema.extend({
  action: z.literal("regenerate_join_code"),
});

const updateAdditionalInfoSchema = baseSchema.extend({
  action: z.literal("update_additional_info"),
  data: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("school"),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      gradeCutOff: z.number().optional(),
    }),
    z.object({
      type: z.literal("consistent"),
    }),
    z.object({
      type: z.literal("rotating"),
      ageCutOff: z.number().optional(),
    }),
  ]),
});

export default defineEventHandler({
  onRequest: [
    middlewareRateLimit({
      namespace: "organization.put",
      limit: 10,
      duration: 60,
    }),
    middlewareAuth({
      role: "owner",
    }),
  ],
  handler: async (event) => {
    const organization = event.context.organization!;
    const validatedParams = await getValidatedRouterParams(event, (params) =>
      z
        .object({
          organization_slug: z.string(),
        })
        .parse(params)
    );

    const validatedBody = await readValidatedBody(event, (body) =>
      z
        .discriminatedUnion("action", [
          editSchema,
          regenerateJoinCodeSchema,
          updateAdditionalInfoSchema,
        ])
        .parse(body)
    );
    const db = useDrizzle();

    switch (validatedBody.action) {
      case "edit": {
        await db
          .update(organizationsTable)
          .set({
            ...validatedBody.data,
          })
          .where(
            eq(organizationsTable.slug, validatedParams.organization_slug)
          );
        return {
          message: "Successfully edited organization",
        };
      }
      case "regenerate_join_code": {
        const newJoinCode = generateRandomString(6, alphabet("A-Z", "0-9"));
        await db
          .update(organizationsTable)
          .set({
            joinCode: newJoinCode,
          })
          .where(
            eq(organizationsTable.slug, validatedParams.organization_slug)
          );
        return {
          message: "Successfully regenerated join code",
        };
      }
      case "update_additional_info": {
        switch (organization.additionalInfo.type) {
          case "school": {
            console.log("validatedBody.data", validatedBody.data);

            const rawDb = hubDatabase();

            const stmt = /* sql */ `
            UPDATE organizations
            SET additional_info = JSON_REPLACE(
              additional_info,
            ${Object.entries(validatedBody.data)
              .map(([key, value]) => `'$.details.${key}', ?`)
              .join(", ")}
            )
            WHERE slug = '${validatedParams.organization_slug}'
          `;

            console.log(stmt);

            const res = await rawDb
              .prepare(stmt)
              .bind(...Object.values(validatedBody.data))
              .run();

            console.log(res);
            break;
          }
          case "consistent": {
            await db
              .update(organizationsTable)
              .set({
                additionalInfo: {
                  type: "consistent",
                  details: {},
                },
              })
              .where(
                eq(organizationsTable.slug, validatedParams.organization_slug)
              );
            break;
          }
          case "rotating": {
            const res = await db
              .update(organizationsTable)
              .set({
                additionalInfo: sql`JSON_REPLACE(additional_info, $.details.gradeCutOff, 5)`,
              })
              .where(
                eq(organizationsTable.slug, validatedParams.organization_slug)
              );

            console.log(res.error);
            break;
          }
        }
      }
    }
  },
});
