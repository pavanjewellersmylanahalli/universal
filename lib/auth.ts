import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { verify } from "@node-rs/argon2";
import { loginSchema } from "@/lib/validations/auth";
import { logger } from "@/lib/logger";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: { email, isActive: true, deletedAt: null },
          include: {
            business: { select: { id: true, name: true, slug: true, isActive: true } },
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || !user.business.isActive) {
          logger.warn("Login failed: user not found or business inactive", { email });
          return null;
        }

        // Check account lock
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          logger.warn("Login failed: account locked", { email, userId: user.id });
          return null;
        }

        if (!user.passwordHash) return null;

        const passwordValid = await verify(user.passwordHash, password);

        if (!passwordValid) {
          // Increment failed attempts
          const failedAttempts = user.failedLoginAttempts + 1;
          const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: failedAttempts,
              lockedUntil: lockUntil,
            },
          });

          // Audit
          await prisma.auditLog.create({
            data: {
              businessId: user.businessId,
              userId: user.id,
              action: "USER_LOGIN_FAILED",
              entity: "User",
              entityId: user.id,
              newValues: { failedAttempts, locked: !!lockUntil },
            },
          });

          logger.warn("Login failed: invalid password", { email, failedAttempts });
          return null;
        }

        // Successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        await prisma.auditLog.create({
          data: {
            businessId: user.businessId,
            userId: user.id,
            action: "USER_LOGIN",
            entity: "User",
            entityId: user.id,
          },
        });

        const permissions = [
          ...new Set(
            user.roles.flatMap((ur) =>
              ur.role.permissions.map((rp) => rp.permission.code)
            )
          ),
        ];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          businessId: user.businessId,
          businessName: user.business.name,
          businessSlug: user.business.slug,
          isOwner: user.isOwner,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in — store everything from authorize()
        token.id = user.id;
        token.businessId = (user as any).businessId;
        token.businessName = (user as any).businessName;
        token.businessSlug = (user as any).businessSlug;
        token.isOwner = (user as any).isOwner;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session as any).businessId = token.businessId;
        (session as any).businessName = token.businessName;
        (session as any).businessSlug = token.businessSlug;
        (session as any).isOwner = token.isOwner;
        (session as any).permissions = token.permissions;
      }
      return session;
    },
  },
});
