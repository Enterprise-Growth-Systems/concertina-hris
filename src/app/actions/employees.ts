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
                        leaveType: "LEAVE_CREDITS",
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
