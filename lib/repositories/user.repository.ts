import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id, deletedAt: null } });
  }

  async findByEmail(businessId: string, email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { businessId_email: { businessId, email }, deletedAt: null },
    });
  }

  async findManyByBusiness(
    businessId: string,
    opts: { skip?: number; take?: number } = {}
  ) {
    return prisma.user.findMany({
      where: { businessId, deletedAt: null },
      include: {
        roles: { include: { role: true } },
      },
      skip: opts.skip ?? 0,
      take: opts.take ?? 20,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    businessId: string;
    email: string;
    name: string;
    phone?: string;
    passwordHash: string;
    isOwner?: boolean;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async countByBusiness(businessId: string): Promise<number> {
    return prisma.user.count({ where: { businessId, deletedAt: null } });
  }
}

export const userRepository = new UserRepository();
