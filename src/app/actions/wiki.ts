"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function getWikiPages(parentId: string | null = null) {
    try {
        const pages = await prisma.page.findMany({
            where: { parentId },
            include: {
                author: { select: { name: true } },
                _count: { select: { children: true } }
            },
            orderBy: { title: "asc" }
        });
        
        return { success: true, pages };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getWikiPageBySlug(slug: string) {
    try {
        const page = await prisma.page.findUnique({
            where: { slug },
            include: {
                author: { select: { name: true } },
                children: { select: { title: true, slug: true } },
                parent: { select: { title: true, slug: true } }
            }
        });
        
        if (!page) return { success: false, error: "Page not found" };
        return { success: true, page };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createWikiPage(data: { title: string; content?: string; parentId?: string; icon?: string }) {
    try {
        const session = await auth();
        const userRole = session?.user ? (session.user as any).role : null;
        
        if (!session?.user?.id || (userRole !== "ADMIN" && userRole !== "MANAGER" && userRole !== "SUPERADMIN")) {
            return { success: false, error: "Unauthorized" };
        }

        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);

        const page = await prisma.page.create({
            data: {
                title: data.title,
                slug,
                content: data.content || "",
                icon: data.icon || "FileText",
                parentId: data.parentId || null,
                authorId: session.user.id
            }
        });

        // Notify all users about the new Wiki page
        const users = await prisma.user.findMany({ select: { id: true } });
        await prisma.notification.createMany({
            data: users.map(u => ({
                userId: u.id,
                title: "New Wiki Document",
                message: `A new document "${data.title}" has been added to the Company Wiki.`,
                href: `/wiki/${slug}`,
                type: "INFO"
            }))
        });

        return { success: true, page };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateWikiPage(id: string, data: { title?: string; content?: string; parentId?: string | null; icon?: string }) {
    try {
        const session = await auth();
        const userRole = session?.user ? (session.user as any).role : null;
        
        if (!session?.user?.id || (userRole !== "ADMIN" && userRole !== "MANAGER" && userRole !== "SUPERADMIN")) {
            return { success: false, error: "Unauthorized" };
        }

        const updateData: any = { ...data };
        if (data.title) {
            updateData.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
        }

        const page = await prisma.page.update({
            where: { id },
            data: updateData
        });

        return { success: true, page };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteWikiPage(id: string) {
    try {
        const session = await auth();
        const userRole = session?.user ? (session.user as any).role : null;
        
        if (!session?.user?.id || (userRole !== "ADMIN" && userRole !== "MANAGER" && userRole !== "SUPERADMIN")) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.page.delete({ where: { id } });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
