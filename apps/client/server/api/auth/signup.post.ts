export default defineEventHandler({
  onRequest: [
    middlewareRateLimit({
      namespace: "auth.signup",
      limit: 10,
      duration: 60,
    }),
  ],
  handler: async (event) => {
    const signupFormResult = await readValidatedBody(event, (body) =>
      z
        .object({
          name: z
            .string()
            .min(3, "Name is too short")
            .max(255, "Name is too long"),
          email: z.string().email("Invalid email address"),
        })
        .parse(body)
    );
    const db = useDrizzle();

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, signupFormResult.email));

    if (user.length > 0 && user[0].verifiedAt) {
      throw createError({
        status: 409,
        statusMessage: "Conflict",
        message: "Email already exists",
      });
    }

    let userId: string = "";

    if (user.length > 0 && !user[0].verifiedAt) {
      const userUpdateRes = await db
        .update(usersTable)
        .set({
          displayName: signupFormResult.name,
        })
        .where(eq(usersTable.email, signupFormResult.email))
        .returning({
          userId: usersTable.id,
        });
      userId = userUpdateRes[0].userId;
    }

    const userCreateRes = await db
      .insert(usersTable)
      .values({
        displayName: signupFormResult.name,
        email: signupFormResult.email,
      })
      .returning({
        userId: usersTable.id,
      });

    if (userCreateRes.length > 0) userId = userCreateRes[0].userId;

    const token = await generateVerificationToken(
      userId,
      signupFormResult.email
    );

    // const html = await renderEmail(VerificationEmail, {
    //   name: signupFormResult.email.split("@")[0],
    //   verificationLink: `${process.env.NUXT_BASE_URL}/api/auth/verify-email?token=${token}&email=${signupFormResult.email}`,
    // })

    const emailRes = await sendEmail({
      to: signupFormResult.email,
      subject: "Verify your email address",
      html: magicEmailTemplate({
        token,
      }),
    });

    if (!emailRes.success) {
      console.error(emailRes.message);
      throw createError({
        status: 500,
        statusMessage: "Internal server error",
        message: "Failed to send email",
      });
    }

    setResponseStatus(event, 201);
  },
});
