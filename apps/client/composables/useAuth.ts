import type { Session, User } from "lucia";

export const useAuth = () =>
  useState<{
    user: User | null;
    session: Session | null;
  }>("auth", () => ({
    user: null,
    session: null,
  }));
