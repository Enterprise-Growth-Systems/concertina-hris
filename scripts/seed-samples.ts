import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample data...');

  // Get first user (usually Admin)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No users found. Please seed users first.');
    return;
  }

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: 'New Policy Published',
        message: 'The "Employee Code of Conduct" has been updated in the Company Wiki.',
        href: '/wiki/employee-code-of-conduct',
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      },
      {
        userId: user.id,
        title: 'System Update',
        message: 'The HR dashboard will undergo maintenance this Sunday from 2 AM to 4 AM.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      }
    ]
  });

  console.log('Sample notifications seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
