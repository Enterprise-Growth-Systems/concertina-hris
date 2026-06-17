import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role?: string | null;
      requiresPasswordChange?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string | null;
    requiresPasswordChange?: boolean;
    password?: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    role?: string | null;
    requiresPasswordChange?: boolean;
  }
}
