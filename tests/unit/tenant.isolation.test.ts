import { describe, it, expect } from "vitest";
import { SYSTEM_PERMISSIONS } from "@/lib/constants/permissions";
import { assertTenantAccess } from "@/lib/api/tenant";

describe("Permissions", () => {
  it("all permission codes are unique", () => {
    const codes = SYSTEM_PERMISSIONS.map((p) => p.code);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  it("all permission codes follow category:action format", () => {
    for (const perm of SYSTEM_PERMISSIONS) {
      const parts = perm.code.split(":");
      expect(parts.length).toBe(2);
      expect(parts[0]).toBe(perm.category);
    }
  });

  it("contains critical permissions", () => {
    const codes = SYSTEM_PERMISSIONS.map((p) => p.code);
    const required = [
      "customer:view",
      "customer:create",
      "girvi:create",
      "girvi:redeem",
      "payment:receive",
      "audit:view",
      "settings:manage",
    ];
    for (const required_code of required) {
      expect(codes).toContain(required_code);
    }
  });
});

describe("Tenant Isolation Logic", () => {
  it("assertTenantAccess throws when businessIds differ", () => {
    const session = {
      userId: "user-1",
      businessId: "business-A",
      businessName: "Business A",
      isOwner: false,
      permissions: [],
    };
    expect(() => assertTenantAccess("business-B", session)).toThrow();
  });

  it("assertTenantAccess passes when businessIds match", () => {
    const session = {
      userId: "user-1",
      businessId: "business-A",
      businessName: "Business A",
      isOwner: false,
      permissions: [],
    };
    expect(() => assertTenantAccess("business-A", session)).not.toThrow();
  });
});
