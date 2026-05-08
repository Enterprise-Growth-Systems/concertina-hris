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
                    data: { clockOut: now, status: "FORCED_CHECKOUT" },
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

                let newStatus = activeLog.status;

                if (schedule && schedule.endTime) {
                    const [endH, endM] = schedule.endTime.split(':').map(Number);
                    if (!isNaN(endH) && !isNaN(endM)) {
                        let scheduledEnd = new Date(
                            activeLogInManila.getFullYear(), 
                            activeLogInManila.getMonth(), 
                            activeLogInManila.getDate(), 
                            endH, 
                            endM, 
                            0
                        );
                        
                        // If endTime hour is less than clockIn hour, the shift crosses midnight
                        if (endH < activeLogInManila.getHours() - 4) { // using -4 to be safe for 9am to 1am etc.
                            scheduledEnd.setDate(scheduledEnd.getDate() + 1);
                        }

                        // Undertime if clocking out more than 15 minutes before the scheduled end
                        const undertimeThreshold = new Date(scheduledEnd.getTime() - 15 * 60000);

                        if (nowPHT < undertimeThreshold) {
                            if (newStatus === "LATE") {
                                newStatus = "LATE_AND_UNDERTIME";
                            } else if (newStatus === "ON_TIME") {
                                newStatus = "UNDERTIME";
                            }
                        }
                    }
                }

                await prisma.timeLog.update({
                    where: { id: activeLog.id },
                    data: { clockOut: now, status: newStatus }, // Keep actual UTC time for clockOut
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

        let startHour = 9;
        let startMinute = 0;

        if (schedule && schedule.startTime) {
            const [h, m] = schedule.startTime.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
                startHour = h;
                startMinute = m;
            }
        }

        // Calculate their exact scheduled start time for today using the Manila pseudo-Date
        const scheduledStart = new Date(nowPHT.getFullYear(), nowPHT.getMonth(), nowPHT.getDate(), startHour, startMinute, 0);
        
        // Add a 15-minute grace period buffer
        const lateThreshold = new Date(scheduledStart.getTime() + 15 * 60000);
        
        const isLate = nowPHT > lateThreshold;

        await prisma.timeLog.create({
            data: {
                userId: employeeId,
                clockIn: now, // Save actual UTC time to database
                status: isLate ? "LATE" : "ON_TIME",
            },
        });

        await prisma.auditLog.create({
            data: { action: "CLOCK_IN", userId: employeeId, details: isLate ? "Late Clock In" : "On-Time Clock In" }
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
