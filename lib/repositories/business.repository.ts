import { prisma } from "@/lib/db";
import type { Business, BusinessSettings } from "@prisma/client";

export class BusinessRepository {
  async findById(id: string): Promise<Business | null> {
    return prisma.business.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Business | null> {
    return prisma.business.findUnique({ where: { slug } });
  }

  async findWithSettings(id: string) {
    return prisma.business.findUnique({
      where: { id },
      include: { settings: true },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    type: Business["type"];
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
    currency?: string;
    timezone?: string;
    language?: string;
  }): Promise<Business> {
    return prisma.business.create({ data });
  }

  async update(id: string, data: Partial<Business>): Promise<Business> {
    return prisma.business.update({ where: { id }, data });
  }

  async markSetupDone(id: string): Promise<Business> {
    return prisma.business.update({
      where: { id },
      data: { isSetupDone: true },
    });
  }

  async createSettings(
    businessId: string,
    data?: Partial<BusinessSettings>
  ): Promise<BusinessSettings> {
    return prisma.businessSettings.create({
      data: { businessId, ...data },
    });
  }

  async updateSettings(
    businessId: string,
    data: Partial<BusinessSettings>
  ): Promise<BusinessSettings> {
    return prisma.businessSettings.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.business.count({ where: { slug } });
    return count > 0;
  }
}

export const businessRepository = new BusinessRepository();
