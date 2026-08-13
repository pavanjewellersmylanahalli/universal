import { type NextRequest, NextResponse } from "next/server";
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

export type RouteContext = {
  params: Promise<any>;
};

export type StandardRouteHandler = (
  req: NextRequest,
  context: RouteContext
) => Promise<NextResponse>;

export type AuthenticatedRouteHandler = (
  req: NextRequest,
  session: AuthenticatedSession,
  params: any
) => Promise<NextResponse>;

/**
 * Wraps an API handler with authentication.
 * Extracts userId and businessId from the JWT session.
 * NEVER trusts businessId from the request body/params.
 */
export function withAuth(
  handler: AuthenticatedRouteHandler
): StandardRouteHandler {
  return async (req, context) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return unauthorized();
      }

      const authSession: AuthenticatedSession = {
        userId: session.user.id!,
        businessId: session.businessId,
        businessName: session.businessName,
        isOwner: session.isOwner,
        permissions: session.permissions,
      };

      if (!authSession.userId || !authSession.businessId) {
        return unauthorized("Invalid session");
      }

      const resolvedParams = context?.params ? await context.params : {};

      return handler(req, authSession, resolvedParams);
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
  handler: AuthenticatedRouteHandler
): AuthenticatedRouteHandler {
  return async (req, session, params) => {
    const hasPermission =
      session.isOwner || session.permissions.includes(requiredPermission);

    if (!hasPermission) {
      logger.warn("Permission denied", {
        userId: session.userId,
        businessId: session.businessId,
        required: requiredPermission,
      });
      return forbidden(`Missing permission: ${requiredPermission}`);
    }

    return handler(req, session, params);
  };
}

export { assertTenantAccess } from "./tenant";

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
