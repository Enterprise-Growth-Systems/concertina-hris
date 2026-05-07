import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const usersData = [
  {
    name: 'Clemen Rose Iniego',
    email: 'clemen@concertina.team',
    role: 'ADMIN',
    position: 'Head of Human Resources',
    department: 'HR',
    schedules: [
      { dayOfWeek: 1, startTime: '03:00', endTime: '12:00' },
      { dayOfWeek: 2, startTime: '03:00', endTime: '12:00' },
      { dayOfWeek: 3, startTime: '03:00', endTime: '12:00' },
      { dayOfWeek: 4, startTime: '03:00', endTime: '12:00' },
      { dayOfWeek: 5, startTime: '03:00', endTime: '12:00' },
    ],
    pto: { PFFD: 5 },
  },
  {
    name: 'Melody Saldivar Dalmacio',
    email: 'melodydalmacio@concertina.team',
    role: 'ADMIN',
    position: 'Human Resource Specialist',
    department: 'HR',
    schedules: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '01:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '01:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '01:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '01:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '01:00' },
    ],
    pto: { PFFD: 5 },
  },
  {
    name: 'May-Ann Susana',
    email: 'ann@concertina.team',
    role: 'ADMIN',
    position: 'Human Resource Specialist',
    department: 'HR',
    schedules: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '02:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '02:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '02:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '02:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '02:00' },
    ],
    pto: { PFFD: 5 },
  },
  {
    name: 'Jorica Ravacio',
    email: 'jorica.ravacio@concertina.team',
    role: 'EMPLOYEE',
    position: 'Supervisor, Client Delivery',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 1, startTime: '06:00', endTime: '15:00' },
      { dayOfWeek: 2, startTime: '06:00', endTime: '15:00' },
      { dayOfWeek: 3, startTime: '06:00', endTime: '15:00' },
      { dayOfWeek: 4, startTime: '06:00', endTime: '15:00' },
      { dayOfWeek: 5, startTime: '06:00', endTime: '15:00' },
    ],
    pto: { PFFD: 2 },
  },
  {
    name: 'Chimbylyn Iniego',
    email: 'chimbylyn.iniego@egrowthsystems.com',
    role: 'EMPLOYEE',
    position: 'Customer Service Representative',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 2, startTime: '07:00', endTime: '16:00' },
      { dayOfWeek: 3, startTime: '07:00', endTime: '16:00' },
      { dayOfWeek: 4, startTime: '07:00', endTime: '16:00' },
      { dayOfWeek: 5, startTime: '07:00', endTime: '16:00' },
      { dayOfWeek: 6, startTime: '07:00', endTime: '16:00' },
    ],
    pto: { ETO: 1.66, VTO: 3.34 },
  },
  {
    name: 'Ian Smith II Brecinio',
    email: 'ian.brecinio@egrowthsystems.com',
    role: 'EMPLOYEE',
    position: 'Customer Service Manager',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 2, startTime: '04:30', endTime: '13:30' },
      { dayOfWeek: 3, startTime: '04:30', endTime: '13:30' },
      { dayOfWeek: 4, startTime: '04:30', endTime: '13:30' },
      { dayOfWeek: 5, startTime: '04:30', endTime: '13:30' },
      { dayOfWeek: 6, startTime: '05:30', endTime: '14:30' },
    ],
    pto: { ETO: 0.83, VTO: 2.67 },
  },
  {
    name: 'Reana Jasmine Calixto Baceril',
    email: 'reanajasmine@concertina.team',
    role: 'EMPLOYEE',
    position: 'Customer Service Representative',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 2, startTime: '08:30', endTime: '17:30' },
      { dayOfWeek: 3, startTime: '08:30', endTime: '17:30' },
      { dayOfWeek: 4, startTime: '08:30', endTime: '17:30' },
      { dayOfWeek: 5, startTime: '08:30', endTime: '17:30' },
    ],
    pto: { ETO: 0.32, VTO: 1.68 },
  },
  {
    name: 'Lynsy Jane Silva',
    email: 'lynsy.silva@egrowthsystems.com',
    role: 'EMPLOYEE',
    position: 'Customer Service Representative',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 4, startTime: '05:30', endTime: '14:30' },
      { dayOfWeek: 5, startTime: '05:30', endTime: '14:30' },
      { dayOfWeek: 6, startTime: '05:30', endTime: '14:30' },
      { dayOfWeek: 0, startTime: '05:30', endTime: '14:30' },
    ],
    pto: { ETO: 0.83, VTO: 1.67 },
  },
  {
    name: 'Beverly Branzuela',
    email: 'beverly.branzuela@egrowthsystems.com',
    role: 'EMPLOYEE',
    position: 'Customer Service Representative',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 1, startTime: '08:30', endTime: '17:30' },
      { dayOfWeek: 2, startTime: '07:30', endTime: '16:30' },
      { dayOfWeek: 5, startTime: '07:30', endTime: '16:30' },
      { dayOfWeek: 6, startTime: '08:30', endTime: '17:30' },
      { dayOfWeek: 0, startTime: '08:30', endTime: '17:30' },
    ],
    pto: { ETO: 0.83, VTO: 2.17 },
  },
  {
    name: 'Gian Carlo Gonzales',
    email: 'gian.gonzales@egrowthsystems.com',
    role: 'EMPLOYEE',
    position: 'Customer Service Representative',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 2, startTime: '06:00', endTime: '15:00' },
      { dayOfWeek: 3, startTime: '06:00', endTime: '15:00' },
      { dayOfWeek: 4, startTime: '06:00', endTime: '15:00' },
      { dayOfWeek: 5, startTime: '06:00', endTime: '15:00' },
      { dayOfWeek: 6, startTime: '06:00', endTime: '15:00' },
    ],
    pto: { ETO: 0.83, VTO: 1.67 },
  },
  {
    name: 'Eunice Ferns',
    email: 'eunice.ferns@egrowthsystems.com',
    role: 'EMPLOYEE',
    position: 'Customer Service Representative',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '09:30', endTime: '18:30' },
      { dayOfWeek: 4, startTime: '09:30', endTime: '18:30' },
      { dayOfWeek: 0, startTime: '09:00', endTime: '18:00' },
    ],
    pto: { ETO: 1.66, VTO: 5.34 },
  },
  {
    name: 'Rin Josseph B. Miñoza',
    email: 'rin.minoza@egrowthsystems.com',
    role: 'EMPLOYEE',
    position: 'Customer Service Representative',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 0, startTime: '08:00', endTime: '17:00' },
    ],
    pto: { ETO: 1.66, VTO: 3.34 },
  },
  {
    name: 'Caryl Barbette Celestial',
    email: 'caryl.celestial@egrowthsystems.com',
    role: 'EMPLOYEE',
    position: 'Customer Service Representative',
    department: 'Operations',
    schedules: [
      { dayOfWeek: 1, startTime: '06:30', endTime: '15:30' },
      { dayOfWeek: 2, startTime: '06:30', endTime: '15:30' },
      { dayOfWeek: 3, startTime: '06:30', endTime: '15:30' },
      { dayOfWeek: 6, startTime: '07:30', endTime: '16:30' },
      { dayOfWeek: 0, startTime: '07:30', endTime: '16:30' },
    ],
    pto: {}, // Not Yet Eligible
  },
];

async function main() {
  console.log('Starting Day 1 Database Seeding...');

  for (const data of usersData) {
    console.log(`Processing: ${data.name}`);

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        role: data.role,
        position: data.position,
        department: data.department,
      },
      create: {
        email: data.email,
        name: data.name,
        role: data.role,
        position: data.position,
        department: data.department,
        password: null, // triggers concertina2026 default
      },
    });

    // Clear old schedules and recreate
    await prisma.schedule.deleteMany({
      where: { userId: user.id },
    });

    for (const sched of data.schedules) {
      await prisma.schedule.create({
        data: {
          userId: user.id,
          dayOfWeek: sched.dayOfWeek,
          startTime: sched.startTime,
          endTime: sched.endTime,
        },
      });
    }

    // Upsert PTO balances
    for (const [leaveType, balance] of Object.entries(data.pto)) {
      await prisma.leaveBalance.upsert({
        where: {
          userId_leaveType: {
            userId: user.id,
            leaveType: leaveType,
          },
        },
        update: {
          balance: balance as number,
        },
        create: {
          userId: user.id,
          leaveType: leaveType,
          balance: balance as number,
        },
      });
    }

    console.log(`Successfully completed user: ${data.name}`);
  }

  console.log('Day 1 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
