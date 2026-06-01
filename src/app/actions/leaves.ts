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
        if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
}

export async function submitLeaveRequest(formData: FormData) {
    try {
        const leaveType = formData.get("leaveType") as string;
        const startDateStr = formData.get("startDate") as string;
        const endDateStr = formData.get("endDate") as string;
        const reason = formData.get("reason") as string;
        const attachmentUrl = formData.get("attachmentUrl") as string;

        if (!leaveType || !startDateStr || !endDateStr || !attachmentUrl || attachmentUrl.trim() === "") {
            return { success: false, error: "Missing required fields, including Attachment Link" };
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (startDate > endDate) {
            return { success: false, error: "Start date must be before end date" };
        }

        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return { success: false, error: "Not authenticated" };
        }

        const employeeId = session.user.id;
        const daysRequested = calculateWorkingDays(startDate, endDate);

        if (daysRequested <= 0) {
            return { success: false, error: "Leave request must include at least one working day" };
        }

        // Verify balance
        const balanceRecord = await prisma.leaveBalance.findUnique({
            where: {
                userId_leaveType: {
                    userId: employeeId,
                    leaveType: leaveType,
                }
            }
        });

        const currentBalance = balanceRecord?.balance || 0;
        if (daysRequested > currentBalance) {
            return { success: false, error: `Insufficient balance. You requested ${daysRequested} days, but only have ${currentBalance} left.` };
        }

        await prisma.leaveRequest.create({
            data: {
                userId: employeeId,
                leaveType,
                startDate,
                endDate,
                reason,
                attachmentUrl,
                status: "PENDING",
            },
        });

        revalidatePath("/leaves");
        return { success: true };
    } catch (error) {
        console.error("Error submitting leave request:", error);
        return { success: false, error: "Failed to submit request" };
    }
}
