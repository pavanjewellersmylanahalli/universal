import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { verify } from "@node-rs/argon2";
import { loginSchema } from "@/lib/validations/auth";
import { logger } from "@/lib/logger";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Trust all hosts (required for production deployment)
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
});
