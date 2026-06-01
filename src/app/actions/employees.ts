"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function addEmployee(formData: FormData) {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can add employees.");
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const pffdBalance = parseInt(formData.get("pffdBalance") as string, 10);

    if (!name || !email || !role || isNaN(pffdBalance)) {
        throw new Error("Missing required fields.");
    }

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                role,
                leaveBalances: {
                    create: {
                        leaveType: "PFFD",
                        balance: pffdBalance
                    }
                }
            }
        });

        revalidatePath("/admin/employees");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to add employee:", error);
        return { success: false, error: "Email may already exist." };
    }
}

export async function deleteEmployee(userId: string) {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can delete employees.");
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
        return { success: false, error: "You cannot delete your own account." };
    }

    try {
        // Use a transaction to securely cascade delete all child records
        await prisma.$transaction([
            prisma.timeLog.deleteMany({ where: { userId } }),
            prisma.leaveBalance.deleteMany({ where: { userId } }),
            prisma.leaveRequest.deleteMany({ where: { userId } }),
            prisma.schedule.deleteMany({ where: { userId } }),
            prisma.specialSchedule.deleteMany({ where: { userId } }),
            prisma.assignedHoliday.deleteMany({ where: { userId } }),
            prisma.auditLog.deleteMany({ where: { userId } }),
            prisma.overtimeRequest.deleteMany({ where: { userId } }),
            prisma.manualTimeRequest.deleteMany({ where: { userId } }),
            // Remove them as a manager from any direct reports
            prisma.user.updateMany({ where: { managerId: userId }, data: { managerId: null } }),
            // Remove their manager signature from any requests they approved
            prisma.overtimeRequest.updateMany({ where: { managerId: userId }, data: { managerId: null } }),
            prisma.manualTimeRequest.updateMany({ where: { managerId: userId }, data: { managerId: null } }),
            // Finally delete the user
            prisma.user.delete({ where: { id: userId } })
        ]);

        revalidatePath("/admin/employees");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete employee:", error);
        return { success: false, error: "Database error occurred during deletion." };
    }
}

export async function updatePffdBalance(userId: string, newBalance: number) {
    const session = await auth();
    const role = session?.user ? (session.user as any).role : null;
    
    if (role !== "ADMIN" && role !== "MANAGER") {
        throw new Error("Unauthorized: Only Admins and Managers can edit PFFD balances.");
    }

    if (role === "MANAGER") {
        const employee = await prisma.user.findUnique({ where: { id: userId } });
        if (!employee || employee.managerId !== session!.user!.id) {
            throw new Error("Unauthorized: You can only edit balances for your direct reports.");
        }
    }

    if (isNaN(newBalance) || newBalance < 0) {
        return { success: false, error: "Invalid balance." };
    }

    try {
        await prisma.leaveBalance.upsert({
            where: {
                userId_leaveType: {
                    userId: userId,
                    leaveType: "PFFD"
                }
            },
            update: {
                balance: newBalance
            },
            create: {
                userId: userId,
                leaveType: "PFFD",
                balance: newBalance
            }
        });

        // Audit log the manual change
        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: "PFFD_MANUAL_ADJUST",
                    userId: session.user.id,
                    details: `Manually adjusted PFFD balance to ${newBalance} for user ${userId}`
                }
            });
        }

        revalidatePath("/admin/employees");
        return { success: true };
    } catch (error) {
        console.error("Failed to update PFFD balance:", error);
        return { success: false, error: "Database error occurred." };
    }
}
export async function updateEmployee(
    userId: string, 
    data: { 
        role?: string, 
        pffdBalance?: number,
        contactNumber?: string,
        emergencyContact?: string,
        address?: string,
        name?: string,
        email?: string,
        department?: string,
        position?: string,
        icId?: string,
        managerId?: string | null
    }
) {
    const session = await auth();
    const currentUserRole = session?.user ? (session.user as any).role : null;
    
    if (currentUserRole !== "ADMIN" && currentUserRole !== "MANAGER") {
        throw new Error("Unauthorized: Only Admins and Managers can edit employees.");
    }

    if (currentUserRole === "MANAGER") {
        const employee = await prisma.user.findUnique({ where: { id: userId } });
        if (!employee || employee.managerId !== session!.user!.id) {
            throw new Error("Unauthorized: You can only edit details for your direct reports.");
        }
    }

    try {
        const updateData: any = {};
        
        // Only admins can change roles, personal info, and employment details
        if (currentUserRole === "ADMIN") {
            if (data.role !== undefined) updateData.role = data.role;
            if (data.contactNumber !== undefined) updateData.contactNumber = data.contactNumber;
            if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;
            if (data.address !== undefined) updateData.address = data.address;
            if (data.name !== undefined) updateData.name = data.name;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.department !== undefined) updateData.department = data.department;
            if (data.position !== undefined) updateData.position = data.position;
            if (data.icId !== undefined) updateData.icId = data.icId;
            if (data.managerId !== undefined) updateData.managerId = data.managerId;
        }

        await prisma.$transaction([
            // Update User fields (role)
            ...(Object.keys(updateData).length > 0 ? [
                prisma.user.update({
                    where: { id: userId },
                    data: updateData
                })
            ] : []),
            // Update PFFD Balance
            ...(data.pffdBalance !== undefined ? [
                prisma.leaveBalance.upsert({
                    where: {
                        userId_leaveType: {
                            userId: userId,
                            leaveType: "PFFD"
                        }
                    },
                    update: {
                        balance: data.pffdBalance
                    },
                    create: {
                        userId: userId,
                        leaveType: "PFFD",
                        balance: data.pffdBalance
                    }
                })
            ] : [])
        ]);

        // Audit log the manual change
        if (session?.user?.id) {
            await prisma.auditLog.create({
                data: {
                    action: "EMPLOYEE_MANUAL_UPDATE",
                    userId: session.user.id,
                    details: `Updated employee ${userId}: ${JSON.stringify(data)}`
                }
            });
        }

        revalidatePath("/admin/employees");
        return { success: true };
    } catch (error) {
        console.error("Failed to update employee:", error);
        return { success: false, error: "Database error occurred." };
    }
}
