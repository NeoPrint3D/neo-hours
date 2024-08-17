import { z } from "zod";

export default defineEventHandler({
  onRequest: [
    middlewareRateLimit({
      namespace: "auth.check-email",
      limit: 10,
      duration: 60,
    }),
  ],
  handler: async (event) => {
    const emailResult = await getValidatedQuery(event, (query) =>
      z
        .object({
          email: z.string().email("Invalid email address"),
        })
        .parse(query)
    );

    const db = useDrizzle();
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, emailResult.email));

    if (users.length > 0 && users[0].verifiedAt) {
      throw createError({
        statusCode: 402,
        statusMessage: "Email exists",
        message: " Email already exists please login",
      });
    }

    return {
      message: "Email is available",
    };
  },
});
