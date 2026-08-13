// System-wide permission definitions
// These are seeded into the permissions table

export const SYSTEM_PERMISSIONS = [
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
  // Interest
  { code: "interest:view", category: "interest", name: "View Interest Rules" },
  { code: "interest:manage", category: "interest", name: "Manage Interest Rules" },
  // Vault
  { code: "vault:view", category: "vault", name: "View Vault" },
  { code: "vault:manage", category: "vault", name: "Manage Vault" },
  // Bank Pledge
  { code: "bankpledge:view", category: "bankpledge", name: "View Bank Pledges" },
  { code: "bankpledge:manage", category: "bankpledge", name: "Manage Bank Pledges" },
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
] as const;

export type PermissionCode = (typeof SYSTEM_PERMISSIONS)[number]["code"];

export const PERMISSION_CODES = SYSTEM_PERMISSIONS.map((p) => p.code);
