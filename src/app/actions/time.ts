"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // import the auth module

const prisma = new PrismaClient();

export async function toggleClockStatus(): Promise<{ success: boolean; isClockedIn?: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return { success: false, error: "Not authenticated" };
        }

        const employeeId = session.user.id;
        const now = new Date();

        // Fetch ALL active logs to gracefully handle any race-condition duplicates
        const activeLogs = await prisma.timeLog.findMany({
            where: {
                userId: employeeId,
                clockOut: null,
            },
            orderBy: {
                clockIn: "desc",
            },
        });

        if (activeLogs.length > 0) {
            const activeLog = activeLogs[0];
            const hoursSinceClockIn = (now.getTime() - activeLog.clockIn.getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceClockIn > 16) {
                // They forgot to clock out. Force close their stale log(s) at 9 hours after clock-in (standard shift length)
                const forcedClockOut = new Date(activeLog.clockIn.getTime() + (9 * 60 * 60 * 1000));

                await prisma.timeLog.updateMany({
                    where: { userId: employeeId, clockOut: null },
                    data: { clockOut: forcedClockOut },
                });
                
                await prisma.auditLog.create({
                    data: { action: "FORCED_CLOCK_OUT", userId: employeeId, details: "System forcefully closed stale time log (>16 hours) using standard 9h shift." }
                });
                
                revalidatePath("/");
                // DO NOT automatically clock them back in. Return clocked out state.
                return { success: true, isClockedIn: false };
            } else {
                // Normal clock out (handles graveyard shifts spanning midnight correctly)
                await prisma.timeLog.updateMany({
                    where: { userId: employeeId, clockOut: null },
                    data: { clockOut: now },
                });

                await prisma.auditLog.create({
                    data: { action: "CLOCK_OUT", userId: employeeId, details: "User clocked out." }
                });

                revalidatePath("/");
                return { success: true, isClockedIn: false };
            }
        }

        // 2. User is clocking in. Verify no active logs exist right now to prevent double-click race condition.
        // We do a fast transaction to ensure idempotency.
        const result = await prisma.$transaction(async (tx) => {
            const currentActive = await tx.timeLog.findFirst({
                where: { userId: employeeId, clockOut: null }
            });

            if (currentActive) {
                // Race condition caught! They are already clocked in.
                return { success: true, isClockedIn: true }; 
            }

            await tx.timeLog.create({
                data: {
                    userId: employeeId,
                    clockIn: now,
                },
            });

            await tx.auditLog.create({
                data: { action: "CLOCK_IN", userId: employeeId, details: "User clocked in" }
            });

            return { success: true, isClockedIn: true };
        });

        revalidatePath("/");
        return result;

    } catch (error) {
        console.error("Error toggling clock status:", error);
        return { success: false, error: "Failed to update time log" };
    }
}

export async function getClockStatus() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return { isClockedIn: false, clockInTime: null };
        }

        const employeeId = session.user.id;

        const activeLog = await prisma.timeLog.findFirst({
            where: {
                userId: employeeId,
                clockOut: null,
            },
            orderBy: {
                clockIn: "desc",
            },
        });

        return {
            isClockedIn: !!activeLog,
            clockInTime: activeLog?.clockIn || null
        };
    } catch (error) {
        console.error("Error getting clock status:", error);
        return { isClockedIn: false, clockInTime: null };
    }
}
