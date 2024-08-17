import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { sessionsTable, usersTable } from "@neo-hours/db";
import { Lucia } from "lucia";

export const useLucia = () => {
  const adapter = new DrizzleSQLiteAdapter(
    // @ts-expect-error - idk why this is happening
    useDrizzle(),
    sessionsTable,
    usersTable
  );

  return new Lucia(adapter, {
    sessionCookie: {
      name: "[your-app-name]-session",
      attributes: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    },
    getUserAttributes: (user) => ({
      email: user.email,
      displayName: user.displayName,
      verifiedAt: user.verifiedAt,
      finishedOnboarding: user.finishedOnboarding,
    }),
    getSessionAttributes: (
      session: Partial<typeof sessionsTable.$inferSelect>
    ) => ({}),
  });
};

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof useLucia>;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }

  interface DatabaseUserAttributes {
    email: string;
    displayName: string;
    verified: boolean;
    verifiedAt: number;
    finishedOnboarding: boolean;
  }
  interface DatabaseSessionAttributes {}
}
