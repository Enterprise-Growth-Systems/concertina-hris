"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";



function timeStringToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function calculateLeaveDays(
    start: Date, 
    end: Date, 
    schedules: { dayOfWeek: number, startTime: string, endTime: string }[]
): number {
    let totalDays = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    const scheduledDays = new Set<number>();
    if (schedules.length > 0) {
        schedules.forEach(s => scheduledDays.add(s.dayOfWeek));
    } else {
        // Fallback: Mon-Fri
        [1, 2, 3, 4, 5].forEach(d => scheduledDays.add(d));
    }

    while (current <= endDate) {
        if (scheduledDays.has(current.getDay())) {
            totalDays++;
        }
        current.setDate(current.getDate() + 1);
    }

    return totalDays;
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
        // Fetch employee and their manager
        const employee = await prisma.user.findUnique({
            where: { id: employeeId },
            include: { manager: true }
        });

        if (!employee) {
            return { success: false, error: "Employee not found" };
        }


        const schedules = await prisma.schedule.findMany({
            where: { userId: employeeId },
            select: { dayOfWeek: true, startTime: true, endTime: true }
        });

        const daysRequested = calculateLeaveDays(startDate, endDate, schedules);

        if (daysRequested <= 0) {
            return { success: false, error: "Leave request must include at least one working day based on your schedule" };
        }

        // Check for overlapping leaves
        const overlappingLeaves = await prisma.leaveRequest.findFirst({
            where: {
                userId: employeeId,
                status: { in: ["PENDING", "APPROVED"] },
                OR: [
                    { startDate: { lte: endDate }, endDate: { gte: startDate } }
                ]
            }
        });

        if (overlappingLeaves) {
            return { success: false, error: "You already have an existing leave request that overlaps with these dates." };
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

        // Send Email Notification to Manager
        if (employee.manager && employee.manager.email) {
            const subject = `New Leave Request: ${employee.name}`;
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">New Leave Request Submitted</h2>
                    <p>Hello ${employee.manager.name},</p>
                    <p><strong>${employee.name}</strong> has submitted a new <strong>${leaveType}</strong> leave request for your review.</p>
                    <p><strong>Dates:</strong> ${startDate.toDateString()} to ${endDate.toDateString()}</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <br/>
                    <p>Please log in to the Concertina HR dashboard to approve or reject this request.</p>
                    <br/>
                    <p>Best regards,<br/>Concertina HR System</p>
                </div>
            `;
            sendEmail(employee.manager.email, subject, html).catch(console.error);
            
            // Also create an in-app notification
            await prisma.notification.create({
                data: {
                    userId: employee.managerId as string,
                    title: "New Leave Request",
                    message: `${employee.name} has requested ${leaveType} from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`,
                    href: "/admin/requests",
                    type: "INFO"
                }
            });
        }

        revalidatePath("/leaves");
        return { success: true };
    } catch (error) {
        console.error("Error submitting leave request:", error);
        return { success: false, error: "Failed to submit request" };
    }
}
