import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: unknown };

export function ok<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, message } satisfies ApiResponse<T>, {
    status,
  });
}

export function created<T>(data: T, message?: string): NextResponse {
  return ok(data, message, 201);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(error: string, details?: unknown): NextResponse {
  return NextResponse.json(
    { success: false, error, details } satisfies ApiResponse,
    { status: 400 }
  );
}

export function unauthorized(error = "Unauthorized"): NextResponse {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, {
    status: 401,
  });
}

export function forbidden(error = "Forbidden"): NextResponse {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, {
    status: 403,
  });
}

export function notFound(error = "Not found"): NextResponse {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, {
    status: 404,
  });
}

export function conflict(error: string): NextResponse {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, {
    status: 409,
  });
}

export function tooManyRequests(error = "Too many requests"): NextResponse {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, {
    status: 429,
  });
}

export function serverError(error = "Internal server error"): NextResponse {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, {
    status: 500,
  });
}
