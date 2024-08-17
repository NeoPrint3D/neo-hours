import type { User } from "lucia";
import { z } from "zod";

export default defineEventHandler({
  onRequest: [
    middlewareRateLimit({
      namespace: "auth.resend-verification",
      strategy: "user",
      limit: 10,
      duration: 60,
    }),
  ],
  handler: async (event) => {
    const validatedBody = await readValidatedBody(event, (body) =>
      z
        .object({
          email: z.string().email("Invalid email address"),
        })
        .parse(body)
    );
    const db = useDrizzle();

    if (validatedBody.email) {
      const user = (
        await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, validatedBody.email))
      )[0];
      if (!user) {
        throw createError({
          status: 400,
          statusMessage: "Invalid email",
          message: "Invalid email",
        });
      }

      const token = await generateVerificationToken(user.id, user.email);
      const emailRes = await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: magicEmailTemplate({
          token,
        }),
      });

      if (!emailRes.success) {
        throw createError({
          status: 500,
          statusMessage: "Internal Server Error",
          message: "Failed to send verification email",
        });
      }

      setResponseStatus(event, 202);
      return {
        message: "Verification successfully sent",
      };
    }
  },
});
