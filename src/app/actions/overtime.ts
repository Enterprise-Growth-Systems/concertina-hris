"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function submitOvertime(formData: FormData) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const reason = formData.get("reason") as string;
    const attachmentUrl = formData.get("attachmentUrl") as string;

    if (!startDateStr || !endDateStr || !startTime || !endTime || !reason) {
        return { success: false, error: "Missing required fields." };
    }

    try {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return { success: false, error: "Invalid date format." };
        }

        await prisma.overtimeRequest.create({
            data: {
                userId: session.user.id,
                startDate: startDate,
                endDate: endDate,
                startTime,
                endTime,
                reason,
                attachmentUrl: attachmentUrl || null,
                status: "PENDING"
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "OVERTIME_REQUESTED",
                userId: session.user.id,
                details: `Requested overtime for ${startDateStr} to ${endDateStr}`
            }
        });

        revalidatePath("/overtime");
        return { success: true };
    } catch (error) {
        console.error("Failed to submit overtime:", error);
        return { success: false, error: "Database error occurred." };
    }
}

export async function updateOvertimeStatus(requestId: string, status: "APPROVED" | "REJECTED") {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    
    if (userRole !== "ADMIN" && userRole !== "MANAGER") {
        throw new Error("Unauthorized");
    }

    try {
        const overtime = await prisma.overtimeRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        });

        if (!overtime) {
            return { success: false, error: "Overtime request not found." };
        }

        // Managers can only approve their own team (unless they are admin)
        if (userRole === "MANAGER" && overtime.user.managerId !== session.user.id) {
            return { success: false, error: "You can only approve overtime for your direct reports." };
        }

        await prisma.overtimeRequest.update({
            where: { id: requestId },
            data: {
                status,
                managerId: session.user.id
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: `OVERTIME_${status}`,
                userId: session.user.id,
                details: `${status} overtime request ${requestId}`
            }
        });

        revalidatePath("/admin/overtime");
        return { success: true };
    } catch (error) {
        console.error("Failed to update overtime status:", error);
        return { success: false, error: "Database error occurred." };
    }
}
