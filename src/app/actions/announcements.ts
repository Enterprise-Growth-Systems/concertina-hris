"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function getAnnouncements() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
                author: {
                    select: { name: true }
                }
            }
        });
        
        return { success: true, announcements };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createAnnouncement(title: string, content: string) {
    try {
        const session = await auth();
        const userRole = session?.user ? (session.user as any).role : null;
        const userId = session?.user?.id;
        
        if (!userId || (userRole !== "ADMIN" && userRole !== "MANAGER" && userRole !== "SUPERADMIN")) {
            return { success: false, error: "Unauthorized" };
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                authorId: userId
            }
        });

        // Also create notifications for everyone
        const users = await prisma.user.findMany({ select: { id: true } });
        await prisma.notification.createMany({
            data: users.map(u => ({
                userId: u.id,
                title: "New Announcement: " + title,
                message: content.substring(0, 50) + "...",
                type: "INFO"
            }))
        });

        return { success: true, announcement };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAnnouncement(id: string) {
    try {
        const session = await auth();
        const userRole = session?.user ? (session.user as any).role : null;
        
        if (!session?.user?.id || (userRole !== "ADMIN" && userRole !== "MANAGER" && userRole !== "SUPERADMIN")) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.announcement.delete({ where: { id } });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
