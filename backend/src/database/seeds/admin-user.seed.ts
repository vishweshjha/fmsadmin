import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AdminUserRole } from '@prisma/client';

export async function seedAdminUsers(prisma: PrismaClient) {
  const adminUsers = [
    {
      name: 'Super Admin',
      email: 'superadmin@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: AdminUserRole.SUPER_ADMIN,
      isActive: true,
    },
    {
      name: 'Operations Admin',
      email: 'operations@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: AdminUserRole.OPERATIONS_ADMIN,
      isActive: true,
    },
    {
      name: 'Finance Admin',
      email: 'finance@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: AdminUserRole.FINANCE_ADMIN,
      isActive: true,
    },
    {
      name: 'Support Agent',
      email: 'support@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: AdminUserRole.SUPPORT_AGENT,
      isActive: true,
    },
    {
      name: 'Compliance Officer',
      email: 'compliance@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: AdminUserRole.COMPLIANCE_OFFICER,
      isActive: true,
    },
  ];

  for (const userData of adminUsers) {
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      await prisma.adminUser.create({ data: userData });
      console.log(`Created admin user: ${userData.email}`);
    } else {
      console.log(`Admin user already exists: ${userData.email}`);
    }
  }
}
