export default defineEventHandler({
  onRequest: [
    middlewareRateLimit({
      namespace: "auth.login",
      limit: 10,
      duration: 60,
    }),
  ],
  handler: async (event) => {
    const { session } = event.context;

    if (session) {
      throw createError({
        status: 400,
        statusMessage: "Bad Request",
        message: "Already logged in",
      });
    }

    const loginFormResult = await readValidatedBody(event, (body) =>
      z
        .object({
          email: z.string().email("Must be a valid email"),
        })
        .parse(body)
    );

    const db = useDrizzle();

    const userRes = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, loginFormResult.email));

    if (userRes.length === 0) {
      throw createError({
        status: 404,
        statusMessage: "Not Found",
        message: "User not found please signup",
      });
    }

    if (!userRes[0].verifiedAt) {
      throw createError({
        status: 403,
        statusMessage: "Email not verified",
        message: "Email not verified please verify your email",
      });
    }

    const { id: userId, email } = userRes[0];

    const token = await generateVerificationToken(userId, email);

    // const html = await renderEmail(VerificationEmail, {
    //   name: loginFormResult.data.email.split("@")[0],
    //   verificationLink: `${process.env.NUXT_BASE_URL}/api/auth/verify-email?token=${token}&email=${userRes[0].email}`,
    // })

    const emailRes = await sendEmail({
      to: email,
      subject: "Verify your email address to login",
      html: magicEmailTemplate({
        token,
      }),
    });

    if (!emailRes.success) {
      throw createError({
        status: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to send email",
      });
    }

    return {
      message: "Email sent successfully",
    };
  },
});
