"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function getNotifications() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20
        });
        
        return { success: true, notifications };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markNotificationAsRead(notificationId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        await prisma.notification.update({
            where: { id: notificationId, userId: session.user.id },
            data: { readAt: new Date() }
        });
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markAllNotificationsAsRead() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        await prisma.notification.updateMany({
            where: { userId: session.user.id, readAt: null },
            data: { readAt: new Date() }
        });
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
