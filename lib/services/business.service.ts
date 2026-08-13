import { hash } from "@node-rs/argon2";
import { prisma } from "@/lib/db";
import { businessRepository } from "@/lib/repositories/business.repository";
import type { CreateBusinessInput } from "@/lib/validations/auth";
import { SYSTEM_PERMISSIONS } from "@/lib/constants/permissions";
import { logger } from "@/lib/logger";
import { type BusinessType } from "@prisma/client";


function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export class BusinessService {
  async createBusinessWithOwner(input: CreateBusinessInput) {
    // Generate unique slug
    let slug = generateSlug(input.name);
    let attempt = 0;
    while (await businessRepository.slugExists(slug)) {
      attempt++;
      slug = `${generateSlug(input.name)}-${attempt}`;
    }

    // Hash password
    const passwordHash = await hash(input.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Run atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create business
      const business = await tx.business.create({
        data: {
          name: input.name,
          slug,
          type: input.type as BusinessType,
          email: input.email,
          phone: input.phone,
          address: input.address,
          city: input.city,
          state: input.state,
          country: input.country ?? "IN",
          pinCode: input.pinCode,
          currency: input.currency ?? "INR",
          timezone: input.timezone ?? "Asia/Kolkata",
          language: input.language ?? "en",
          isSetupDone: true,
        },
      });

      // Create default settings
      await tx.businessSettings.create({
        data: { businessId: business.id },
      });

      // Create system permissions (idempotent)
      for (const perm of SYSTEM_PERMISSIONS) {
        await tx.permission.upsert({
          where: { code: perm.code },
          update: {},
          create: perm,
        });
      }

      // Create owner role
      const ownerRole = await tx.role.create({
        data: {
          businessId: business.id,
          name: "Owner",
          description: "Full access — all permissions",
          isSystem: true,
        },
      });

      // Assign all permissions to owner role
      const allPerms = await tx.permission.findMany();
      await tx.rolePermission.createMany({
        data: allPerms.map((p) => ({
          roleId: ownerRole.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });

      // Create additional default roles
      await tx.role.createMany({
        data: [
          { businessId: business.id, name: "Manager", isSystem: true },
          { businessId: business.id, name: "Operator", isSystem: true },
          { businessId: business.id, name: "Cashier", isSystem: true },
          { businessId: business.id, name: "Viewer", isSystem: true },
        ],
      });

      // Create owner user
      const owner = await tx.user.create({
        data: {
          businessId: business.id,
          email: input.email,
          name: input.ownerName,
          phone: input.phone,
          passwordHash,
          isOwner: true,
          isActive: true,
        },
      });

      // Assign owner role
      await tx.userRole.create({
        data: { userId: owner.id, roleId: ownerRole.id },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          businessId: business.id,
          userId: owner.id,
          action: "BUSINESS_CREATED",
          entity: "Business",
          entityId: business.id,
          newValues: { name: business.name, slug: business.slug },
        },
      });

      return { business, owner, ownerRole };
    });

    logger.info("Business created", {
      businessId: result.business.id,
      slug: result.business.slug,
      ownerId: result.owner.id,
    });

    return result;
  }

  async getBusinessProfile(businessId: string) {
    return businessRepository.findWithSettings(businessId);
  }

  async updateBusinessProfile(
    businessId: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pinCode: string;
      gstNumber: string;
      panNumber: string;
      website: string;
    }>
  ) {
    return businessRepository.update(businessId, data);
  }
}

export const businessService = new BusinessService();
