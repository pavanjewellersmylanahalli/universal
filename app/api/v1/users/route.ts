import { withAuth, withPermission, handleApiError } from "@/lib/api/middleware";
import { ok } from "@/lib/api/response";
import { userRepository } from "@/lib/repositories/user.repository";

export const runtime = "nodejs";

// GET /api/v1/users — list users in the authenticated user's business
export const GET = withAuth(
  withPermission("user:view", async (req, session) => {
    try {
      const url = new URL(req.url);
      const skip = parseInt(url.searchParams.get("skip") ?? "0");
      const take = Math.min(parseInt(url.searchParams.get("take") ?? "20"), 100);

      const [users, total] = await Promise.all([
        userRepository.findManyByBusiness(session.businessId, { skip, take }),
        userRepository.countByBusiness(session.businessId),
      ]);

      return ok({
        items: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          phone: u.phone,
          isOwner: u.isOwner,
          isActive: u.isActive,
          roles: u.roles.map((ur) => ur.role.name),
          lastLoginAt: u.lastLoginAt,
          createdAt: u.createdAt,
        })),
        total,
        skip,
        take,
      });
    } catch (error) {
      return handleApiError(error);
    }
  })
);
