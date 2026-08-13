// Prisma seed script — DEVELOPMENT ONLY
// Do NOT run in production automatically

import { PrismaClient, BusinessType, AuditAction } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding development database...");

  // Create demo business
  const business = await prisma.business.upsert({
    where: { slug: "demo-jewellers" },
    update: {},
    create: {
      name: "Demo Jewellers",
      slug: "demo-jewellers",
      type: BusinessType.JEWELLERY_SHOP,
      description: "Demo business for testing the Universal Girvi Management System",
      email: "demo@example.com",
      phone: "+91-9876543210",
      address: "123 Gold Street",
      city: "Mumbai",
      state: "Maharashtra",
      country: "IN",
      pinCode: "400001",
      currency: "INR",
      timezone: "Asia/Kolkata",
      language: "en",
      isSetupDone: true,
    },
  });

  // Create business settings
  await prisma.businessSettings.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      girviPrefix: "GIRVI",
      girviPadding: 6,
      customerPrefix: "CUST",
      customerPadding: 6,
      defaultLtv: 70,
      defaultInterestRate: 2,
      gracePeriodDays: 7,
      penaltyRate: 0.5,
      paymentAllocationOrder: "INTEREST,PENALTY,CHARGES,PRINCIPAL",
      receiptHeader: "Demo Jewellers | Your Trusted Pawn Partner",
      termsConditions:
        "Items will be released only upon full payment. Unclaimed items after 90 days may be auctioned.",
    },
  });

  // System permissions
  const permissions = [
    // Customer
    { code: "customer:view", category: "customer", name: "View Customers" },
    { code: "customer:create", category: "customer", name: "Create Customer" },
    { code: "customer:edit", category: "customer", name: "Edit Customer" },
    { code: "customer:delete", category: "customer", name: "Delete Customer" },
    // KYC
    { code: "kyc:view", category: "kyc", name: "View KYC" },
    { code: "kyc:manage", category: "kyc", name: "Manage KYC" },
    // Girvi
    { code: "girvi:view", category: "girvi", name: "View Girvi" },
    { code: "girvi:create", category: "girvi", name: "Create Girvi" },
    { code: "girvi:edit", category: "girvi", name: "Edit Girvi" },
    { code: "girvi:approve", category: "girvi", name: "Approve Girvi" },
    { code: "girvi:renew", category: "girvi", name: "Renew Girvi" },
    { code: "girvi:redeem", category: "girvi", name: "Redeem Girvi" },
    { code: "girvi:cancel", category: "girvi", name: "Cancel Girvi" },
    // Payment
    { code: "payment:view", category: "payment", name: "View Payments" },
    { code: "payment:receive", category: "payment", name: "Receive Payment" },
    { code: "payment:reverse", category: "payment", name: "Reverse Payment" },
    // Vault
    { code: "vault:view", category: "vault", name: "View Vault" },
    { code: "vault:manage", category: "vault", name: "Manage Vault" },
    // Reports
    { code: "report:view", category: "report", name: "View Reports" },
    { code: "report:export", category: "report", name: "Export Reports" },
    // Users
    { code: "user:view", category: "user", name: "View Users" },
    { code: "user:manage", category: "user", name: "Manage Users" },
    // Settings
    { code: "settings:view", category: "settings", name: "View Settings" },
    { code: "settings:manage", category: "settings", name: "Manage Settings" },
    // Audit
    { code: "audit:view", category: "audit", name: "View Audit Logs" },
    // Interest
    { code: "interest:manage", category: "interest", name: "Manage Interest Rules" },
    // Bank Pledge
    { code: "bankpledge:view", category: "bankpledge", name: "View Bank Pledges" },
    { code: "bankpledge:manage", category: "bankpledge", name: "Manage Bank Pledges" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  const allPerms = await prisma.permission.findMany();

  // Create system roles for the demo business
  const ownerRole = await prisma.role.upsert({
    where: { businessId_name: { businessId: business.id, name: "Owner" } },
    update: {},
    create: {
      businessId: business.id,
      name: "Owner",
      description: "Full access to all business data and settings",
      isSystem: true,
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { businessId_name: { businessId: business.id, name: "Viewer" } },
    update: {},
    create: {
      businessId: business.id,
      name: "Viewer",
      description: "Read-only access",
      isSystem: true,
    },
  });

  // Assign all permissions to owner
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: ownerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: ownerRole.id, permissionId: perm.id },
    });
  }

  // Assign view-only permissions to viewer
  const viewPerms = allPerms.filter((p) => p.code.endsWith(":view"));
  for (const perm of viewPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: viewerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: viewerRole.id, permissionId: perm.id },
    });
  }

  // Create demo users
  const ownerPasswordHash = await hash("DemoOwner@123", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const owner = await prisma.user.upsert({
    where: { businessId_email: { businessId: business.id, email: "owner@demo.com" } },
    update: {},
    create: {
      businessId: business.id,
      email: "owner@demo.com",
      name: "Demo Owner",
      phone: "+91-9876543210",
      passwordHash: ownerPasswordHash,
      isOwner: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: owner.id, roleId: ownerRole.id } },
    update: {},
    create: { userId: owner.id, roleId: ownerRole.id },
  });

  const viewerPasswordHash = await hash("DemoViewer@123", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const viewer = await prisma.user.upsert({
    where: { businessId_email: { businessId: business.id, email: "viewer@demo.com" } },
    update: {},
    create: {
      businessId: business.id,
      email: "viewer@demo.com",
      name: "Demo Viewer",
      passwordHash: viewerPasswordHash,
      isOwner: false,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: viewer.id, roleId: viewerRole.id } },
    update: {},
    create: { userId: viewer.id, roleId: viewerRole.id },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      businessId: business.id,
      userId: owner.id,
      action: AuditAction.BUSINESS_CREATED,
      entity: "Business",
      entityId: business.id,
      newValues: { name: business.name, slug: business.slug },
    },
  });

  console.log("✅ Seed complete!");
  console.log(`
📋 Demo Credentials:
  Business: Demo Jewellers (slug: demo-jewellers)
  Owner:    owner@demo.com  / DemoOwner@123
  Viewer:   viewer@demo.com / DemoViewer@123
  `);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
