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

  // Create Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Welcome to the New HR Dashboard!',
        content: 'We have completely revamped the Concertina HR Dashboard. Enjoy the new Dark Mode, animated widgets, and the brand new Wiki tab for all company documents.',
        authorId: user.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        title: 'Q3 Townhall Meeting Scheduled',
        content: 'Please be advised that our Q3 Townhall will be held next Friday at 10:00 AM. A calendar invite will be sent out shortly with the Zoom link. See you there!',
        authorId: user.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      }
    ],
  });

  // Create Wiki Pages
  await prisma.page.create({
    data: {
      title: 'Employee Code of Conduct',
      slug: 'employee-code-of-conduct',
      content: `<h2>1. Introduction</h2>
<p>Welcome to Concertina HR! This Code of Conduct sets out the rules, principles, and policies that all employees must follow.</p>
<h2>2. Professionalism</h2>
<ul>
  <li>Always treat colleagues with respect.</li>
  <li>Maintain confidentiality of company data.</li>
  <li>Communicate clearly and professionally.</li>
</ul>
<p>If you have any questions, please contact HR.</p>`,
      authorId: user.id,
    }
  });

  await prisma.page.create({
    data: {
      title: 'IT Security Guidelines',
      slug: 'it-security-guidelines',
      content: `<h2>Password Policy</h2>
<p>All passwords must be at least 12 characters long and include a mix of uppercase, lowercase, numbers, and symbols.</p>
<h2>Phishing Attacks</h2>
<p>Be extremely cautious of unsolicited emails asking for credentials. <strong>Never</strong> share your password with anyone, not even IT support.</p>`,
      authorId: user.id,
    }
  });

  console.log('Sample data seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
