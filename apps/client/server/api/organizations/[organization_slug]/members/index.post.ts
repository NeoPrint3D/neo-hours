import type { User } from "lucia";
import { joinRequestEmailTemplate } from "~/lib/constants/emailTemplates";

export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "verified",
    }),
    middlewareRateLimit({
      namespace: "members.create",
      limit: 10,
      duration: 60,
    }),
  ],
  handler: async (event) => {
    const validatedParams = await getValidatedRouterParams(event, (params) =>
      z
        .object({
          organization_slug: z.string(),
        })
        .parse(params)
    );
    const validatedBody = await readValidatedBody(event, (body) =>
      z
        .object({
          action: z.enum(["join"]),
          joinCode: z.string().min(6).max(6),
          displayName: z.string().min(1).max(50),
          additionalInfo: z.object({
            type: z.enum(["school"]),
            details: z.object({
              studentId: z.string(),
              grade: z.number().int().min(1).max(12),
            }),
          }),
        })
        .parse(body)
    );

    const db = useDrizzle();

    switch (validatedBody.action) {
      case "join": {
        const user = event.context.user!;
        const organization = (
          await db
            .select()
            .from(organizationsTable)
            .where(eq(organizationsTable.id, validatedParams.organization_slug))
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

        const existingMember = (
          await db
            .select()
            .from(organizationMembersTable)
            .where(
              and(
                eq(
                  organizationMembersTable.organizationId,
                  validatedParams.organization_slug
                ),
                eq(organizationMembersTable.userId, user.id)
              )
            )
        )[0];

        if (existingMember) {
          throw createCustomError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "User is already a member of this organization",
            data: {
              details: "User is already a member of this organization",
            },
          });
        }

        if (organization.joinCode !== validatedBody.joinCode) {
          throw createCustomError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "Invalid join code",
            data: {
              details: "Invalid join code",
            },
          });
        }

        const membership = await db
          .insert(organizationMembersTable)
          .values({
            organizationId: validatedParams.organization_slug,
            displayName: validatedBody.displayName,
            userId: user.id,
            role: "member",
            status: organization.requireMembershipApproval
              ? "pending"
              : "active",
            additionalInfo: validatedBody.additionalInfo,
          })
          .returning({ id: organizationMembersTable.id });

        console.log("membership", membership);

        const upperManagementEmails = await db
          .select({
            email: usersTable.email,
          })
          .from(organizationMembersTable)
          .leftJoin(
            usersTable,
            eq(organizationMembersTable.userId, usersTable.id)
          )
          .where(
            and(
              eq(organizationMembersTable.organizationId, organization.id),
              eq(organizationMembersTable.role, "owner")
            )
          );

        if (organization.requireMembershipApproval) {
          await Promise.all([
            ...upperManagementEmails
              .map((member) => member.email)
              .map((email) =>
                sendEmail({
                  to: email as string,
                  subject: "New member joined",
                  html: joinRequestEmailTemplate({
                    organization,
                    email: user.email,
                  }),
                })
              ),
          ]);
        }

        return {
          message: organization.requireMembershipApproval
            ? "Pending approval"
            : "Joined organization",
        };
      }
    }
  },
});
