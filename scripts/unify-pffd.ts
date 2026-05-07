import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting DB Standardization to PFFD...");
    const balances = await prisma.leaveBalance.findMany();

    const userPffdTotals: Record<string, number> = {};

    for (const b of balances) {
        if (!userPffdTotals[b.userId]) {
            userPffdTotals[b.userId] = 0;
        }
        userPffdTotals[b.userId] += b.balance;
    }

    console.log("Deleting all old leave balances...");
    await prisma.leaveBalance.deleteMany();

    console.log("Re-inserting unified PFFD balances...");
    for (const [userId, total] of Object.entries(userPffdTotals)) {
        // Round to 2 decimal places to avoid long floats from 0.83 + 1.67 etc
        const roundedTotal = Math.round(total * 100) / 100;
        await prisma.leaveBalance.create({
            data: {
                userId,
                leaveType: "PFFD",
                balance: roundedTotal
            }
        });
        console.log(`User ${userId} -> PFFD: ${roundedTotal}`);
    }

    // Also update any existing LeaveRequests to be PFFD if they were something else
    await prisma.leaveRequest.updateMany({
        where: { leaveType: { not: "PFFD" } },
        data: { leaveType: "PFFD" }
    });

    console.log("Standardization complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
