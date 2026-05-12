const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.timeLog.findMany({
        orderBy: { clockIn: "desc" },
        take: 5
    });
    console.log(logs.map(l => ({ id: l.id, clockIn: l.clockIn, clockOut: l.clockOut })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
