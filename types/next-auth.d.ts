import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    businessId: string;
    businessName: string;
    businessSlug: string;
    isOwner: boolean;
    permissions: string[];
  }

  interface User {
    businessId?: string;
    businessName?: string;
    businessSlug?: string;
    isOwner?: boolean;
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    businessId: string;
    businessName: string;
    businessSlug: string;
    isOwner: boolean;
    permissions: string[];
  }
}
