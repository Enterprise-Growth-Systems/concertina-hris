"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

function calculateWorkingDays(start: Date, end: Date, schedules: { dayOfWeek: number }[]): number {
    let count = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    const workingDays = schedules.length > 0 
        ? new Set(schedules.map(s => s.dayOfWeek))
        : new Set([1, 2, 3, 4, 5]);

    while (current <= endDate) {
        const day = current.getDay();
        if (workingDays.has(day)) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
}

export async function updateLeaveRequestStatus(requestId: string, status: "APPROVED" | "REJECTED") {
    try {
        const session = await auth();
        const userRole = session?.user ? (session.user as any).role : null;
        
        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            throw new Error("Unauthorized: Only Admins and Managers can update leave requests.");
        }

        const request = await prisma.leaveRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        });

        if (!request) {
            return { success: false, error: "Request not found" };
        }

        if (userRole === "MANAGER" && request.user.managerId !== session!.user!.id) {
            throw new Error("Unauthorized: You can only approve requests for your direct reports.");
        }

        // If status hasn't changed, do nothing
        if (request.status === status) {
            return { success: true };
        }

        // 1. Calculate working days
        const schedules = await prisma.schedule.findMany({
            where: { userId: request.userId },
            select: { dayOfWeek: true }
        });
        const daysRequested = calculateWorkingDays(request.startDate, request.endDate, schedules);

        if (status === "APPROVED" && request.status !== "APPROVED") {
            // Verify they still have enough balance BEFORE locking
            const balanceRecord = await prisma.leaveBalance.findUnique({
                where: {
                    userId_leaveType: {
                        userId: request.userId,
                        leaveType: request.leaveType,
                    }
                }
            });

            const currentBalance = balanceRecord?.balance || 0;
            if (daysRequested > currentBalance) {
                return { success: false, error: `Insufficient balance. Employee requested ${daysRequested} days, but only has ${currentBalance} left.` };
            }
        }

        // 2. Atomically lock and update the request status
        const updateResult = await prisma.leaveRequest.updateMany({
            where: { id: requestId, status: request.status },
            data: { status }
        });

        // If count is 0, another concurrent request already processed it!
        if (updateResult.count === 0) {
            return { success: false, error: "Request was already updated by another process." };
        }

        if (status === "APPROVED" && request.status !== "APPROVED") {
            // Deduct from balance
            await prisma.leaveBalance.updateMany({
                where: { userId: request.userId, leaveType: request.leaveType },
                data: { balance: { decrement: daysRequested } }
            });
        } else if (status === "REJECTED" && request.status === "APPROVED") {
            // Refund the balance if it was previously approved
            await prisma.leaveBalance.updateMany({
                where: { userId: request.userId, leaveType: request.leaveType },
                data: { balance: { increment: daysRequested } }
            });
        }

        // Send Email Notification
        if (request.user.email) {
            const subject = `Leave Request ${status.charAt(0) + status.slice(1).toLowerCase()}`;
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Leave Request Update</h2>
                    <p>Hello ${request.user.name},</p>
                    <p>Your leave request for <strong>${request.startDate.toDateString()} to ${request.endDate.toDateString()}</strong> has been <strong>${status}</strong> by your manager.</p>
                    <p>Type: ${request.leaveType}</p>
                    <br/>
                    <p>Best regards,<br/>Concertina HR System</p>
                </div>
            `;
            // Fire and forget (don't await to avoid blocking the UI)
            sendEmail(request.user.email, subject, html).catch(console.error);
            
            // Also create an in-app notification
            await prisma.notification.create({
                data: {
                    userId: request.userId,
                    title: `Leave Request ${status.charAt(0) + status.slice(1).toLowerCase()}`,
                    message: `Your request for ${request.leaveType} (${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()}) was ${status.toLowerCase()}.`,
                    href: "/requests",
                    type: "INFO"
                }
            });
        }

        // Revalidate affected paths
        revalidatePath("/");
        revalidatePath("/admin/leaves");
        revalidatePath("/leaves");

        return { success: true };
    } catch (error) {
        console.error("Error updating leave request:", error);
        return { success: false, error: "Failed to update request" };
    }
}
