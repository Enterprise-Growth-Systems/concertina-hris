import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample notifications for all users...');

  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log('No users found.');
    return;
  }

  for (const user of users) {
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
  }

  console.log(`Sample notifications seeded successfully for ${users.length} users.`);
  
  // Also let's deduplicate Announcements
  console.log('Deduping Announcements...');
  const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
  });
  
  const seenTitles = new Set();
  const duplicateIds = [];
  
  for (const a of announcements) {
      if (seenTitles.has(a.title)) {
          duplicateIds.push(a.id);
      } else {
          seenTitles.add(a.title);
      }
  }
  
  if (duplicateIds.length > 0) {
      await prisma.announcement.deleteMany({
          where: { id: { in: duplicateIds } }
      });
      console.log(`Deleted ${duplicateIds.length} duplicate announcements.`);
  } else {
      console.log('No duplicate announcements found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
