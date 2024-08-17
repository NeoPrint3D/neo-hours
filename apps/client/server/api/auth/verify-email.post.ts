import { isWithinExpirationDate } from "oslo";
import { z } from "zod";

export default defineEventHandler({
  onRequest: [
    middlewareRateLimit({
      namespace: "auth.verify",
      limit: 10,
      duration: 60,
    }),
  ],

  handler: async (event) => {
    const validatedBody = await readValidatedBody(event, (body) =>
      z
        .object({
          token: z.string(),
        })
        .parse(body)
    );

    const db = useDrizzle();
    const lucia = useLucia();

    const storedVerificationToken = await db
      .select()
      .from(verificationTokensTable)
      .where(eq(verificationTokensTable.token, validatedBody.token));

    if (storedVerificationToken.length === 0) {
      throw createError({
        status: 404,
        statusMessage: "Not Found",
        message: "Token not found",
      });
    }

    if (
      !isWithinExpirationDate(new Date(storedVerificationToken[0].expiresAt))
    ) {
      throw createError({
        status: 400,
        statusMessage: "Bad Request",
        message: "Token expired",
      });
    }

    await db
      .update(usersTable)
      .set({
        verifiedAt: new Date().toISOString(),
      })
      .where(eq(usersTable.id, storedVerificationToken[0].userId));

    await db
      .delete(verificationTokensTable)
      .where(eq(verificationTokensTable.token, validatedBody.token));

    const session = await lucia.createSession(
      storedVerificationToken[0].userId,
      {}
    );

    appendHeader(
      event,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    return {
      message: "Successfully verified email",
    };
  },
});
