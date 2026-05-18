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
        
        // Vercel servers run in UTC. To calculate thresholds correctly, we construct a 
        // "pseudo-Date" that represents the exact local time in Manila.
        const manilaStr = now.toLocaleString("en-US", { timeZone: "Asia/Manila", hour12: false });
        const nowPHT = new Date(manilaStr);

        const startOfToday = new Date(nowPHT.getFullYear(), nowPHT.getMonth(), nowPHT.getDate(), 0, 0, 0);

        // 1. Check if the user has an active (open) time log
        const activeLog = await prisma.timeLog.findFirst({
            where: {
                userId: employeeId,
                clockOut: null,
            },
            orderBy: {
                clockIn: "desc",
            },
        });

        if (activeLog) {
            // Did they forget to clock out yesterday?
            // Convert their actual UTC clockIn to a Manila pseudo-Date for accurate comparison
            const activeLogInManila = new Date(activeLog.clockIn.toLocaleString("en-US", { timeZone: "Asia/Manila", hour12: false }));
            
            if (activeLogInManila < startOfToday) {
                // Force close yesterday's log at 23:59:59 PHT (which is calculated based on startOfToday)
                // We use the absolute `now` to close it, OR we could use end of yesterday.
                // We'll just close it using the absolute UTC time of right now, or you can calculate exact end of yesterday.
                // Let's use `now` for simplicity to record exactly when the forced checkout triggered.
                await prisma.timeLog.update({
                    where: { id: activeLog.id },
                    data: { clockOut: now },
                });
                
                await prisma.auditLog.create({
                    data: { action: "FORCED_CLOCK_OUT", userId: employeeId, details: "System forcefully closed stale time log from previous day." }
                });
                // We let it continue below to create their new clock-in for today!
            } else {
                // Normal clock out for today
                const clockInDayOfWeek = activeLogInManila.getDay();
                const schedule = await prisma.schedule.findUnique({
                    where: {
                        userId_dayOfWeek: {
                            userId: employeeId,
                            dayOfWeek: clockInDayOfWeek,
                        }
                    }
                });

                await prisma.timeLog.update({
                    where: { id: activeLog.id },
                    data: { clockOut: now }, // Keep actual UTC time for clockOut
                });

                await prisma.auditLog.create({
                    data: { action: "CLOCK_OUT", userId: employeeId, details: "User clocked out." }
                });

                revalidatePath("/");
                return { success: true };
            }
        }

        // 2. User is clocking in (either standard, or after an auto-checkout)
        const todayDayOfWeek = nowPHT.getDay();
        const schedule = await prisma.schedule.findUnique({
            where: {
                userId_dayOfWeek: {
                    userId: employeeId,
                    dayOfWeek: todayDayOfWeek,
                }
            }
        });

        await prisma.timeLog.create({
            data: {
                userId: employeeId,
                clockIn: now, // Save actual UTC time to database
            },
        });

        await prisma.auditLog.create({
            data: { action: "CLOCK_IN", userId: employeeId, details: "User clocked in" }
        });

        // Refresh the dashboard data
        revalidatePath("/");

        return { success: true };
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
