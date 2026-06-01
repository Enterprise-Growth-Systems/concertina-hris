"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const prisma = new PrismaClient();

function calculateWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
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
        const daysRequested = calculateWorkingDays(request.startDate, request.endDate);

        if (status === "APPROVED" && request.status !== "APPROVED") {
            // Verify they still have enough balance
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

        // 2. Update the request status
        await prisma.leaveRequest.update({
            where: { id: requestId },
            data: { status },
        });

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
