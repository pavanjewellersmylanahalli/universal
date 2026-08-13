import { NextRequest } from "next/server";
import { withAuth, withPermission, validateBody, handleApiError } from "@/lib/api/middleware";
import { ok } from "@/lib/api/response";
import { businessService } from "@/lib/services/business.service";
import { z } from "zod";

export const runtime = "nodejs";

const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

// GET /api/v1/business — get current business profile
export const GET = withAuth(async (_req, session) => {
  try {
    const profile = await businessService.getBusinessProfile(session.businessId);
    return ok(profile);
  } catch (error) {
    return handleApiError(error);
  }
});

// PATCH /api/v1/business — update business profile (settings:manage required)
export const PATCH = withAuth(
  withPermission("settings:manage", async (req, session) => {
    try {
      const body = await validateBody(req, updateBusinessSchema);
      const updated = await businessService.updateBusinessProfile(session.businessId, body);
      return ok(updated);
    } catch (error) {
      return handleApiError(error);
    }
  })
);
