import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ApprovalsClientPage } from "./components/approvals-client-page";

import { AdminScopeToggle } from "@/components/admin/admin-scope-toggle";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage({ searchParams }: { searchParams: { view?: string } }) {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/login");
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, id: true }
    });

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGER")) {
        redirect("/");
    }

    const isDirectScope = searchParams.view === "direct" || currentUser.role === "MANAGER";
    
    const managerWhereClause = isDirectScope
        ? { user: { managerId: currentUser.id } } 
        : {};

    // 1. Fetch Leaves
    const leaveRequestsRaw = await prisma.leaveRequest.findMany({
        where: managerWhereClause,
        include: { user: true },
        orderBy: { createdAt: "asc" },
        take: 1000,
    });

    const pendingLeaves = leaveRequestsRaw.filter(r => r.status === "PENDING");
    const processedLeaves = leaveRequestsRaw.filter(r => r.status !== "PENDING").reverse();

    // 2. Fetch Overtime
    const overtimeRequestsRaw = await prisma.overtimeRequest.findMany({
        where: managerWhereClause,
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
            manager: { select: { name: true } }
        }
    });
    
    const formattedOvertime = overtimeRequestsRaw.map(req => ({
        id: req.id,
        employeeName: req.user.name,
        employeeEmail: req.user.email,
        dateRange: `${format(req.startDate, 'MMM d, yyyy')} - ${format(req.endDate, 'MMM d, yyyy')}`,
        timeRange: `${req.startTime} to ${req.endTime}`,
        reason: req.reason,
        status: req.status,
        managerName: req.manager?.name || "Pending",
        attachmentUrl: req.attachmentUrl,
        submittedOn: format(req.createdAt, 'MMM d, yyyy')
    }));

    // 3. Fetch Manual Time
    const manualTimeRaw = await prisma.manualTimeRequest.findMany({
        where: managerWhereClause,
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true, department: true } },
            manager: { select: { name: true } }
        }
    });

    const pendingManual = manualTimeRaw
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

    const processedManual = manualTimeRaw
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
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Approvals Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Review and manage employee leave, overtime, and manual time requests.
                    </p>
                </div>
                <AdminScopeToggle role={currentUser.role} />
            </div>
            
            <ApprovalsClientPage 
                leaves={{ pending: pendingLeaves, processed: processedLeaves }}
                overtime={formattedOvertime}
                manualTime={{ pending: pendingManual, processed: processedManual }}
            />
        </div>
    );
}
