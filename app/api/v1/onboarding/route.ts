import { type NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/middleware";
import { ok, badRequest } from "@/lib/api/response";
import { businessService } from "@/lib/services/business.service";
import { createBusinessSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// POST /api/v1/onboarding — create a new business + owner (public endpoint)
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const parsed = createBusinessSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    // Check if email is already used in ANY business (global uniqueness for owner email)
    // Note: users are unique per business, but owner email should be globally unique for login clarity
    const existingUser = await prisma.user.findFirst({
      where: { email: parsed.data.email, isOwner: true },
    });
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "An account with this email already exists",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await businessService.createBusinessWithOwner(parsed.data);

    return ok(
      {
        businessId: result.business.id,
        businessSlug: result.business.slug,
        ownerId: result.owner.id,
      },
      "Business created successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
