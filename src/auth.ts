import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Email and Password",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "employee@concertinahr.local" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user) return null;

                // Legacy fallback: If the user hasn't set a password yet, enforce the default "concertina2026"
                if (!user.password) {
                    if (credentials.password === "concertina2026") {
                        return user;
                    }
                    return null;
                }

                // Secure check: Verify the provided password against the hashed password
                const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
                
                if (isPasswordValid) {
                    return user;
                }

                return null;
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "EMPLOYEE";
                // If user.password is null/falsy, they are using the default password
                token.requiresPasswordChange = !(user as any).password;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
                (session.user as any).requiresPasswordChange = token.requiresPasswordChange;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    trustHost: true,
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only",
});
