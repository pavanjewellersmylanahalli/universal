import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], // Configured with Credentials provider in auth.ts (Node only)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.businessId = user.businessId;
        token.businessName = user.businessName;
        token.businessSlug = user.businessSlug;
        token.isOwner = user.isOwner;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.businessId = token.businessId as string;
        session.businessName = token.businessName as string;
        session.businessSlug = token.businessSlug as string;
        session.isOwner = token.isOwner as boolean;
        session.permissions = token.permissions as string[];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
