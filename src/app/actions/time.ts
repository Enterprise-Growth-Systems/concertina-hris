"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // import the auth module

const prisma = new PrismaClient();

export async function toggleClockStatus() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return { success: false, error: "Not authenticated" };
        }

        const employeeId = session.user.id;

        const now = new Date();
        const manilaStr = now.toLocaleString("en-US", { timeZone: "Asia/Manila", hour12: false });
        const nowPHT = new Date(manilaStr);
        const startOfToday = new Date(nowPHT.getFullYear(), nowPHT.getMonth(), nowPHT.getDate(), 0, 0, 0);

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
            // Did they forget to clock out yesterday on ANY of the active logs?
            const activeLog = activeLogs[0];
            const activeLogInManila = new Date(activeLog.clockIn.toLocaleString("en-US", { timeZone: "Asia/Manila", hour12: false }));
            
            if (activeLogInManila < startOfToday) {
                // Force close yesterday's log(s)
                await prisma.timeLog.updateMany({
                    where: { userId: employeeId, clockOut: null },
                    data: { clockOut: now },
                });
                
                await prisma.auditLog.create({
                    data: { action: "FORCED_CLOCK_OUT", userId: employeeId, details: "System forcefully closed stale time log(s) from previous day." }
                });
                // Let it continue below to create their new clock-in for today
            } else {
                // Normal clock out for today. Close ALL duplicate active logs if they exist.
                await prisma.timeLog.updateMany({
                    where: { userId: employeeId, clockOut: null },
                    data: { clockOut: now },
                });

                await prisma.auditLog.create({
                    data: { action: "CLOCK_OUT", userId: employeeId, details: "User clocked out." }
                });

                revalidatePath("/");
                return { success: true };
            }
        }

        // 2. User is clocking in. Verify no active logs exist right now to prevent double-click race condition.
        // We do a fast transaction to ensure idempotency.
        const result = await prisma.$transaction(async (tx) => {
            const currentActive = await tx.timeLog.findFirst({
                where: { userId: employeeId, clockOut: null }
            });

            if (currentActive) {
                return { success: true }; // Silently succeed if they are already clocked in (race condition caught)
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

            return { success: true };
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
