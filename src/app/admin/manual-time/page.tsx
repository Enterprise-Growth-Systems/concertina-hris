import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ManualTimeClientPage } from "./components/manual-time-client-page";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function ManualTimeAdminPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, id: true }
    });

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGER")) {
        redirect("/");
    }

    // Fetch requests depending on role
    // ADMIN sees all. MANAGER sees their own team members.
    let whereClause = {};
    if (currentUser.role === "MANAGER") {
        whereClause = {
            user: {
                managerId: currentUser.id
            }
        };
    }

    const requestsRaw = await prisma.manualTimeRequest.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { name: true, email: true, department: true }
            },
            manager: {
                select: { name: true }
            }
        }
    });

    const pendingRequests = requestsRaw
        .filter(req => req.status === "PENDING")
        .map(req => ({
            id: req.id,
            employeeName: req.user.name,
            department: req.user.department || "N/A",
            logType: req.logType,
            logDateTime: req.logDateTime,
            reason: req.reason,
            submittedOn: format(req.createdAt, 'MMM d, yyyy')
        }));

    const processedRequests = requestsRaw
        .filter(req => req.status !== "PENDING")
        .map(req => ({
            id: req.id,
            employeeName: req.user.name,
            department: req.user.department || "N/A",
            logType: req.logType,
            logDateTime: req.logDateTime,
            reason: req.reason,
            status: req.status,
            managerName: req.manager?.name || "System",
            submittedOn: format(req.createdAt, 'MMM d, yyyy')
        }));

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Manual Time Approvals</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Review and manage manual time log entries submitted by employees.
                </p>
            </div>
            
            <ManualTimeClientPage 
                pendingRequests={pendingRequests} 
                processedRequests={processedRequests} 
            />
        </div>
    );
}
