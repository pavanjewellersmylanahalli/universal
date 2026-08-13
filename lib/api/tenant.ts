import { TenantError } from "./errors";
import { type AuthenticatedSession } from "./middleware";

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
