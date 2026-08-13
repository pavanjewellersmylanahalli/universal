import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  unauthorized,
  forbidden,
  serverError,
  badRequest,
} from "@/lib/api/response";
import {
  AppError,
  AuthError,
  ForbiddenError,
  TenantError,
  ValidationError,
} from "@/lib/api/errors";
import { logger } from "@/lib/logger";
import { ZodSchema } from "zod";

export type AuthenticatedSession = {
  userId: string;
  businessId: string;
  businessName: string;
  isOwner: boolean;
  permissions: string[];
};

type ApiHandler<TContext = AuthenticatedSession> = (
  req: NextRequest,
  context: TContext,
  params?: Record<string, string>
) => Promise<NextResponse>;

/**
 * Wraps an API handler with authentication.
 * Extracts userId and businessId from the JWT session.
 * NEVER trusts businessId from the request body/params.
 */
export function withAuth(handler: ApiHandler): ApiHandler<AuthenticatedSession> {
  return async (req, _ctx, params) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return unauthorized();
      }

      const sessionAny = session as any;

      const context: AuthenticatedSession = {
        userId: session.user.id!,
        businessId: sessionAny.businessId,
        businessName: sessionAny.businessName,
        isOwner: sessionAny.isOwner ?? false,
        permissions: sessionAny.permissions ?? [],
      };

      if (!context.userId || !context.businessId) {
        return unauthorized("Invalid session");
      }

      return handler(req, context, params);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Wraps an API handler with permission check.
 * Must be used AFTER withAuth.
 */
export function withPermission(
  requiredPermission: string,
  handler: ApiHandler<AuthenticatedSession>
): ApiHandler<AuthenticatedSession> {
  return async (req, ctx, params) => {
    try {
      const hasPermission =
        ctx.isOwner || ctx.permissions.includes(requiredPermission);

      if (!hasPermission) {
        logger.warn("Permission denied", {
          userId: ctx.userId,
          businessId: ctx.businessId,
          required: requiredPermission,
        });
        return forbidden(`Missing permission: ${requiredPermission}`);
      }

      return handler(req, ctx, params);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Validates that a resource's businessId matches the session's businessId.
 * Call this before returning any tenant-owned resource.
 */
export function assertTenantAccess(
  resourceBusinessId: string,
  session: AuthenticatedSession
): void {
  if (resourceBusinessId !== session.businessId) {
    throw new TenantError();
  }
}

/**
 * Validates request body against a Zod schema.
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }

  return result.data;
}

/**
 * Central API error handler — converts typed errors to HTTP responses.
 * Never exposes stack traces or raw DB errors to clients.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return unauthorized(error.message);
  }
  if (error instanceof ForbiddenError || error instanceof TenantError) {
    return forbidden(error.message);
  }
  if (error instanceof ValidationError) {
    return badRequest(error.message, error.details);
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }

  // Unknown error — log but don't expose internals
  logger.error("Unhandled API error", { error });
  return serverError();
}
