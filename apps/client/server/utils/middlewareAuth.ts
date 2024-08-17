export interface AuthMiddlewareOption {
  role: AppPermissions;
}

const defaultOptions: AuthMiddlewareOption = {
  role: "verified",
};

export const middlewareAuth = (
  options: AuthMiddlewareOption = defaultOptions
) => {
  return defineEventHandler(async (event) => {
    const db = useDrizzle();
    if (options.role === "verified") {
      if (!event.context.user) {
        throw createCustomError({
          statusCode: 401,
          statusMessage: "Unauthorized",
          message: "Please log in",
          data: {
            redirectTo: "/login",
            redirectText: "Log in",
            details: "Must be logged in to access this resource",
          },
        });
      }
      if (!isUserVerified(event.context.user)) {
        throw createCustomError({
          statusCode: 403,
          statusMessage: "Forbidden",
          message: "Please verify your email address",
          data: {
            details: "Must verify your email address to access this resource",
          },
        });
      }
    }
    if (isOrganizationPermission(options.role)) {
      const validatedParams = await getValidatedRouterParams(event, (params) =>
        z
          .object({
            organization_slug: z.string(),
          })
          .parse(params)
      );
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

      if (!event.context.user) {
        throw createCustomError({
          statusCode: 401,
          statusMessage: "Unauthorized",
          message: "Please log in",
          data: {
            redirectTo: "/login",
            redirectText: "Log in",
            details: "Must be logged in to access this resource",
          },
        });
      }

      const membershipData = await db
        .select()
        .from(organizationMembersTable)
        .where(
          and(
            eq(organizationMembersTable.organizationId, organization.id),
            eq(organizationMembersTable.userId, event.context.user.id)
          )
        )
        .limit(1);

      if (!membershipData.length) {
        throw createCustomError({
          statusCode: 403,
          statusMessage: "Forbidden",
          message: "Not a member of this organization",
          data: {
            details:
              "Must be a member of this organization to access this resource",
          },
        });
      }
      const membership = membershipData[0];

      if (membership.status !== "active") {
        throw createCustomError({
          statusCode: 403,
          statusMessage: "Forbidden",
          message: "Membership is not active",
          data: {
            details: "Membership must be active to access this resource",
          },
        });
      }

      if (
        !hasRequiredPermission(membership.role, options.role) ||
        membership.organizationId !== organization.id
      ) {
        throw createCustomError({
          statusCode: 403,
          statusMessage: "Forbidden",
          message: "You do not have the required permission",
          data: {
            details:
              "You do not have the required permission to access this resource",
          },
        });
      }

      event.context.membership = membership;
    }
  });
};
