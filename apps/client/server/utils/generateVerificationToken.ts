import { TimeSpan } from "lucia";
import { createDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";

export async function generateVerificationToken(userId: string, email: string) {
  const db = useDrizzle();
  await db
    .delete(verificationTokensTable)
    .where(eq(verificationTokensTable.userId, userId));

  const token = generateRandomString(32, alphabet("0-9", "a-z"));

  await db.insert(verificationTokensTable).values({
    email,
    userId,
    token,
    expiresAt: createDate(new TimeSpan(15, "m")).getTime(),
  });

  return token;
}
