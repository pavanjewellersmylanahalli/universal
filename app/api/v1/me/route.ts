import { withAuth } from "@/lib/api/middleware";
import { ok } from "@/lib/api/response";
import { userRepository } from "@/lib/repositories/user.repository";
import { handleApiError } from "@/lib/api/middleware";

export const runtime = "nodejs";

export const GET = withAuth(async (_req, session) => {
  try {
    const user = await userRepository.findById(session.userId);
    if (!user) {
      return ok(null, "User not found");
    }

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      image: user.image,
      isOwner: user.isOwner,
      businessId: session.businessId,
      businessName: session.businessName,
      permissions: session.permissions,
    });
  } catch (error) {
    return handleApiError(error);
  }
});
