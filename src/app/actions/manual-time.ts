"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function submitManualTimeRequest(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const logType = formData.get("logType") as string;
    const logDateTimeStr = formData.get("logDateTime") as string;
    const reason = formData.get("reason") as string;

    if (!logType || !logDateTimeStr || !reason) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        const logDateTime = new Date(logDateTimeStr);
        
        if (isNaN(logDateTime.getTime())) {
            return { success: false, error: "Invalid date format." };
        }

        const employee = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { manager: true }
        });

        await prisma.manualTimeRequest.create({
            data: {
                userId: session.user.id,
                logType,
                logDateTime,
                reason,
                status: "PENDING"
            }
        });

        // Send Email Notification to Manager
        if (employee?.manager && employee.manager.email) {
            const subject = `New Manual Time Request: ${employee.name}`;
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">New Manual Time Request Submitted</h2>
                    <p>Hello ${employee.manager.name},</p>
                    <p><strong>${employee.name}</strong> has submitted a new manual time request for your review.</p>
                    <p><strong>Log Type:</strong> ${logType}</p>
                    <p><strong>Date & Time:</strong> ${logDateTime.toDateString()} at ${logDateTime.toLocaleTimeString()}</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <br/>
                    <p>Please log in to the Concertina HR dashboard to approve or reject this request.</p>
                    <br/>
                    <p>Best regards,<br/>Concertina HR System</p>
                </div>
            `;
            sendEmail(employee.manager.email, subject, html).catch(console.error);
        }

        revalidatePath("/requests");
        return { success: true };
    } catch (error) {
        console.error("Failed to submit manual time request:", error);
        return { success: false, error: "Database error occurred" };
    }
}

export async function approveManualTimeRequest(requestId: string) {
    const session = await auth();
    const role = session?.user ? (session.user as any).role : null;
    
    if (role !== "ADMIN" && role !== "MANAGER") {
        throw new Error("Unauthorized: Only Admins and Managers can approve requests.");
    }

    try {
        // Find the request
        const request = await prisma.manualTimeRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        });

        if (!request) {
            return { success: false, error: "Request not found" };
        }

        if (role === "MANAGER" && request.user.managerId !== session!.user!.id) {
            throw new Error("Unauthorized: You can only approve requests for your direct reports.");
        }
        
        if (request.status !== "PENDING") {
            return { success: false, error: "Request is already processed" };
        }

        const dateStart = new Date(request.logDateTime);
        dateStart.setHours(0, 0, 0, 0);
        
        const dateEnd = new Date(request.logDateTime);
        dateEnd.setHours(23, 59, 59, 999);

        // Atomically lock the request to prevent double-approval race conditions
        const updateResult = await prisma.manualTimeRequest.updateMany({
            where: { id: requestId, status: "PENDING" },
            data: {
                status: "APPROVED",
                managerId: session!.user!.id
            }
        });

        if (updateResult.count === 0) {
            return { success: false, error: "Request was already processed by another user." };
        }

        // Transaction to mutate timelog safely since we hold the atomic status change
        await prisma.$transaction(async (tx) => {

            if (request.logType === "Clock In") {
                // If it's a Clock In, we create a new TimeLog for that day (or update if there's somehow a phantom log)
                // Let's check if they already have a TimeLog for that day
                const existingLogs = await tx.timeLog.findMany({
                    where: {
                        userId: request.userId,
                        clockIn: {
                            gte: dateStart,
                            lte: dateEnd
                        }
                    },
                    orderBy: { clockIn: 'asc' }
                });

                if (existingLogs.length > 0) {
                    // Update the first log of the day's clockIn time
                    await tx.timeLog.update({
                        where: { id: existingLogs[0].id },
                        data: { clockIn: request.logDateTime }
                    });
                } else {
                    // Create a new log
                    await tx.timeLog.create({
                        data: {
                            userId: request.userId,
                            clockIn: request.logDateTime
                        }
                    });
                }
            } else if (request.logType === "Clock Out") {
                // For a clock out, we find the latest log for that day and update it
                const existingLogs = await tx.timeLog.findMany({
                    where: {
                        userId: request.userId,
                        clockIn: {
                            gte: dateStart,
                            lte: dateEnd
                        }
                    },
                    orderBy: { clockIn: 'desc' }
                });

                if (existingLogs.length > 0) {
                    // Update the latest log's clockOut time
                    await tx.timeLog.update({
                        where: { id: existingLogs[0].id },
                        data: { clockOut: request.logDateTime }
                    });
                } else {
                    // If no clock in exists for that day, we still have to create one with a null clock in (which our schema doesn't allow, clockIn has a default)
                    // Let's create one with clockIn = clockOut as a fallback
                    await tx.timeLog.create({
                        data: {
                            userId: request.userId,
                            clockIn: request.logDateTime, // fallback
                            clockOut: request.logDateTime
                        }
                    });
                }
            }
            
        // Audit Log
            await tx.auditLog.create({
                data: {
                    action: "MANUAL_TIME_APPROVED",
                    userId: session!.user!.id as string,
                    details: `Approved ${request.logType} request ${requestId} for user ${request.userId}`
                }
            });
        });

        // Send Email Notification
        if (request.user.email) {
            const subject = `Manual Time Request Approved`;
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #10b981;">Manual Time Request Approved</h2>
                    <p>Hello ${request.user.name},</p>
                    <p>Your manual time request for <strong>${request.logDateTime.toDateString()} at ${request.logDateTime.toLocaleTimeString()}</strong> has been <strong>APPROVED</strong> by your manager.</p>
                    <p>Log Type: ${request.logType}</p>
                    <br/>
                    <p>Best regards,<br/>Concertina HR System</p>
                </div>
            `;
            sendEmail(request.user.email, subject, html).catch(console.error);
        }

        revalidatePath("/admin/manual-time");
        return { success: true };
    } catch (error) {
        console.error("Failed to approve request:", error);
        return { success: false, error: "Database error occurred" };
    }
}

export async function rejectManualTimeRequest(requestId: string) {
    const session = await auth();
    const role = session?.user ? (session.user as any).role : null;
    
    if (role !== "ADMIN" && role !== "MANAGER") {
        throw new Error("Unauthorized: Only Admins and Managers can reject requests.");
    }

    try {
        const request = await prisma.manualTimeRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        });

        if (!request) {
            return { success: false, error: "Request not found" };
        }

        if (role === "MANAGER" && request.user.managerId !== session!.user!.id) {
            throw new Error("Unauthorized: You can only reject requests for your direct reports.");
        }

        const updateResult = await prisma.manualTimeRequest.updateMany({
            where: { id: requestId, status: "PENDING" },
            data: {
                status: "REJECTED",
                managerId: session!.user!.id
            }
        });

        if (updateResult.count === 0) {
            return { success: false, error: "Request was already processed by another user." };
        }

        await prisma.auditLog.create({
            data: {
                action: "MANUAL_TIME_REJECTED",
                userId: session!.user!.id as string,
                details: `Rejected manual time request ${requestId}`
            }
        });

        // Send Email Notification
        if (request.user.email) {
            const subject = `Manual Time Request Rejected`;
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #ef4444;">Manual Time Request Rejected</h2>
                    <p>Hello ${request.user.name},</p>
                    <p>Your manual time request for <strong>${request.logDateTime.toDateString()} at ${request.logDateTime.toLocaleTimeString()}</strong> has been <strong>REJECTED</strong> by your manager.</p>
                    <p>Log Type: ${request.logType}</p>
                    <br/>
                    <p>Best regards,<br/>Concertina HR System</p>
                </div>
            `;
            sendEmail(request.user.email, subject, html).catch(console.error);
        }

        revalidatePath("/admin/manual-time");
        return { success: true };
    } catch (error) {
        console.error("Failed to reject request:", error);
        return { success: false, error: "Database error occurred" };
    }
}
