import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['query'] })

async function main() {
    console.log('Seeding database...')

    // Clean up existing data to ensure idempotent seeding
    await prisma.leaveRequest.deleteMany()
    await prisma.leaveBalance.deleteMany()
    await prisma.timeLog.deleteMany()
    await prisma.user.deleteMany()

    // Create the Official Company Admin user
    const admin = await prisma.user.create({
        data: {
            email: 'joseff.tan@egrowthsystems.com',
            name: 'Joseff Tan (Super Admin)',
            role: 'ADMIN',
            leaveBalances: {
                create: [
                    { leaveType: 'LEAVE_CREDITS', balance: 35 },
                ],
            },
        },
    })

    // Create a Manager user
    const manager = await prisma.user.create({
        data: {
            email: 'manager@concertinahr.local',
            name: 'Marketing Manager',
            role: 'MANAGER',
            leaveBalances: {
                create: [
                    { leaveType: 'LEAVE_CREDITS', balance: 25 },
                ],
            },
        },
    })

    // Create an Employee user
    const employee = await prisma.user.create({
        data: {
            email: 'employee@concertinahr.local',
            name: 'John Doe',
            role: 'EMPLOYEE',
            leaveBalances: {
                create: [
                    { leaveType: 'LEAVE_CREDITS', balance: 20 },
                ],
            },
            timeLogs: {
                create: [
                    {
                        clockIn: new Date(new Date().setHours(8, 0, 0, 0)),
                        clockOut: new Date(new Date().setHours(17, 0, 0, 0)),
                        status: 'ON_TIME',
                    },
                    {
                        clockIn: new Date(new Date(Date.now() - 86400000).setHours(9, 15, 0, 0)),
                        clockOut: new Date(new Date(Date.now() - 86400000).setHours(18, 0, 0, 0)),
                        status: 'LATE',
                    }
                ]
            }
        },
    })

    console.log('Seeding finished.')
    console.log({ admin, manager, employee })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
