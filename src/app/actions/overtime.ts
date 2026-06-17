"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";



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

        const employee = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { manager: true }
        });

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

        // Send Email Notification to Manager
        if (employee?.manager && employee.manager.email) {
            const subject = `New Overtime Request: ${employee.name}`;
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">New Overtime Request Submitted</h2>
                    <p>Hello ${employee.manager.name},</p>
                    <p><strong>${employee.name}</strong> has submitted a new overtime request for your review.</p>
                    <p><strong>Dates:</strong> ${startDate.toDateString()} to ${endDate.toDateString()}</p>
                    <p><strong>Hours:</strong> ${startTime} to ${endTime}</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <br/>
                    <p>Please log in to the Concertina HR dashboard to approve or reject this request.</p>
                    <br/>
                    <p>Best regards,<br/>Concertina HR System</p>
                </div>
            `;
            sendEmail(employee.manager.email, subject, html).catch(console.error);
        }

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

    const userRole = session.user.role;
    
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

        // Send Email Notification
        if (overtime.user.email) {
            const subject = `Overtime Request ${status.charAt(0) + status.slice(1).toLowerCase()}`;
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Overtime Request Update</h2>
                    <p>Hello ${overtime.user.name},</p>
                    <p>Your overtime request for <strong>${overtime.startDate.toDateString()} to ${overtime.endDate.toDateString()}</strong> has been <strong>${status}</strong> by your manager.</p>
                    <p>Requested Hours: ${overtime.startTime} - ${overtime.endTime}</p>
                    <br/>
                    <p>Best regards,<br/>Concertina HR System</p>
                </div>
            `;
            sendEmail(overtime.user.email, subject, html).catch(console.error);
        }

        revalidatePath("/admin/overtime");
        return { success: true };
    } catch (error) {
        console.error("Failed to update overtime status:", error);
        return { success: false, error: "Database error occurred." };
    }
}
