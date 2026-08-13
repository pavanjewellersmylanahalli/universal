import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── Business Onboarding ─────────────────────────────────────────────────────

export const businessStep1Schema = z.object({
  type: z.enum([
    "JEWELLERY_SHOP",
    "GIRVI",
    "GOLD_LOAN",
    "FINANCE",
    "SILVER",
    "PAWN",
    "OTHER",
  ]),
  name: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().optional(),
});

export const businessStep2BaseSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
});

export const businessStep2Schema = businessStep2BaseSchema.refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const businessStep3Schema = z.object({
  address: z.string().min(5, "Enter a valid address"),
  city: z.string().min(2, "Enter a city"),
  state: z.string().min(2, "Enter a state"),
  country: z.string().min(2, "Enter a country"),
  pinCode: z.string().optional(),
  currency: z.string().min(3, "Enter a currency"),
  timezone: z.string().min(2, "Enter a timezone"),
  language: z.string().min(2, "Enter a language"),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
});

export const createBusinessSchema = businessStep1Schema
  .merge(businessStep2BaseSchema)
  .merge(businessStep3Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type BusinessStep1Input = z.infer<typeof businessStep1Schema>;
export type BusinessStep2Input = z.infer<typeof businessStep2Schema>;
export type BusinessStep3Input = z.infer<typeof businessStep3Schema>;
