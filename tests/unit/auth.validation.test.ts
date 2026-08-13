import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("Authentication Validation", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePass1",
      confirmPassword: "SecurePass1",
    };

    it("accepts valid registration data", () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects password without uppercase", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "securepass1",
        confirmPassword: "securepass1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password without number", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "SecurePassword",
        confirmPassword: "SecurePassword",
      });
      expect(result.success).toBe(false);
    });

    it("rejects mismatched passwords", () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: "DifferentPass1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.flatten().fieldErrors.confirmPassword;
        expect(confirmError).toBeDefined();
      }
    });

    it("rejects short name", () => {
      const result = registerSchema.safeParse({ ...validData, name: "A" });
      expect(result.success).toBe(false);
    });
  });
});
