import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin users
  const adminUsers = [
    {
      name: 'Super Admin',
      email: 'superadmin@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN' as const,
      phone: '+91 9876543210',
    },
    {
      name: 'Operations Admin',
      email: 'operations@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'OPERATIONS_ADMIN' as const,
      phone: '+91 9876543211',
    },
    {
      name: 'Finance Admin',
      email: 'finance@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'FINANCE_ADMIN' as const,
      phone: '+91 9876543212',
    },
    {
      name: 'Support Agent',
      email: 'support@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'SUPPORT_AGENT' as const,
      phone: '+91 9876543213',
    },
    {
      name: 'Compliance Officer',
      email: 'compliance@fms.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'COMPLIANCE_OFFICER' as const,
      phone: '+91 9876543214',
    },
  ];

  for (const admin of adminUsers) {
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: admin.email },
    });

    if (!existingAdmin) {
      await prisma.adminUser.create({
        data: admin,
      });
      console.log(`Created admin user: ${admin.email}`);
    } else {
      console.log(`Admin user already exists: ${admin.email}`);
    }
  }

  // Create dummy customers
  const customers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+919000000001',
      role: 'CUSTOMER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'Alice Cooper',
      email: 'alice@example.com',
      phone: '+919000000002',
      role: 'CUSTOMER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'Bob Marley',
      email: 'bob@example.com',
      phone: '+919000000003',
      role: 'CUSTOMER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      phone: '+919000000004',
      role: 'CUSTOMER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'Diana Prince',
      email: 'diana@example.com',
      phone: '+919000000005',
      role: 'CUSTOMER' as const,
      status: 'ACTIVE' as const,
    },
  ];

  for (const customer of customers) {
    const existingCustomer = await prisma.user.findUnique({
      where: { email: customer.email },
    });
    if (!existingCustomer) {
      await prisma.user.create({ data: customer });
      console.log(`Created customer: ${customer.email}`);
    }
  }

  // Create dummy providers
  const providers = [
    {
      name: 'Fix It Felix',
      email: 'felix@provider.com',
      phone: '+919000000006',
      role: 'PROVIDER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'Handy Manny',
      email: 'manny@provider.com',
      phone: '+919000000007',
      role: 'PROVIDER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'Bob The Builder',
      email: 'bob_builder@provider.com',
      phone: '+919000000008',
      role: 'PROVIDER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'Sam Fireman',
      email: 'sam@provider.com',
      phone: '+919000000009',
      role: 'PROVIDER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'Postman Pat',
      email: 'pat@provider.com',
      phone: '+919000000010',
      role: 'PROVIDER' as const,
      status: 'ACTIVE' as const,
    },
  ];

  for (const provider of providers) {
    const existingProvider = await prisma.user.findUnique({
      where: { email: provider.email },
    });
    if (!existingProvider) {
      await prisma.user.create({ data: provider });
      console.log(`Created provider: ${provider.email}`);
    }
  }

  // Create dummy bookings
  const createdCustomers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
  });
  const createdProviders = await prisma.user.findMany({
    where: { role: 'PROVIDER' },
  });

  if (createdCustomers.length > 0 && createdProviders.length > 0) {
    const statuses = [
      'PENDING_ASSIGNMENT',
      'ASSIGNED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ];
    const services = [
      { name: 'Pipe Leak Repair', category: 'Plumbing', price: 500 },
      { name: 'AC Service', category: 'HVAC', price: 1500 },
      { name: 'House Cleaning', category: 'Cleaning', price: 2000 },
      { name: 'Sofa Cleaning', category: 'Cleaning', price: 1200 },
      { name: 'Electrical Wiring', category: 'Electrical', price: 800 },
    ];

    for (let i = 1; i <= 20; i++) {
      const bookingNumber = `BKG-${String(i).padStart(4, '0')}`;
      const existingBooking = await prisma.booking.findUnique({
        where: { bookingNumber },
      });

      if (!existingBooking) {
        const customer =
          createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
        const provider =
          createdProviders[Math.floor(Math.random() * createdProviders.length)];
        const service =
          services[Math.floor(Math.random() * services.length)];
        const status =
          statuses[Math.floor(Math.random() * statuses.length)];

        // Random date in the last 30 days or next 7 days
        const dateOffset = Math.floor(Math.random() * 37) - 30;
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + dateOffset);

        await prisma.booking.create({
          data: {
            bookingNumber,
            serviceId: `SVC-${Math.floor(Math.random() * 1000)}`,
            serviceName: service.name,
            serviceCategory: service.category,
            customerId: customer.id,
            providerId:
              status !== 'PENDING_ASSIGNMENT' ? provider.id : undefined,
            status: status as any,
            amount: service.price,
            location: {
              address: '123 Dummy St, Test City',
              lat: 12.9716,
              lng: 77.5946,
            },
            scheduledDate: bookingDate,
            bookingDate: new Date(bookingDate.getTime() - 86400000), // Booked 1 day before schedule
            paymentStatus: status === 'COMPLETED' ? 'PAID' : 'PENDING',
            estimatedDuration: '2 hours',
          },
        });
        console.log(`Created booking: ${bookingNumber}`);
      }
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
