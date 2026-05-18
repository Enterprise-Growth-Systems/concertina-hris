import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { RequestsClientPage } from "./components/requests-client-page";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        redirect("/login");
    }

    const employeeId = session.user.id;

    // Fetch Overtime Data
    const overtimeRequestsRaw = await prisma.overtimeRequest.findMany({
        where: { userId: employeeId },
        orderBy: { createdAt: "desc" },
        include: {
            manager: {
                select: { name: true }
            }
        }
    });

    const overtimeRequests = overtimeRequestsRaw.map(req => ({
        id: req.id,
        dateRange: `${format(req.startDate, 'MMM d, yyyy')} - ${format(req.endDate, 'MMM d, yyyy')}`,
        timeRange: `${req.startTime} to ${req.endTime}`,
        reason: req.reason,
        status: req.status,
        managerName: req.manager?.name || "Pending",
        attachmentUrl: req.attachmentUrl,
        submittedOn: format(req.createdAt, 'MMM d, yyyy')
    }));

    // Fetch Leaves Data
    const leaveRequestsRaw = await prisma.leaveRequest.findMany({
        where: { userId: employeeId },
        orderBy: { createdAt: "desc" },
    });

    const leaveRequests = leaveRequestsRaw.map(req => ({
        id: req.id,
        leaveType: req.leaveType,
        startDate: req.startDate,
        endDate: req.endDate,
        status: req.status,
        createdAt: req.createdAt,
    }));

    const balances = await prisma.leaveBalance.findMany({
        where: { userId: employeeId },
    });

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Employee Requests</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Manage your Pre-Funded Flex Days and Overtime requests.
                </p>
            </div>
            
            <RequestsClientPage 
                overtimeRequests={overtimeRequests} 
                leaveRequests={leaveRequests} 
                balances={balances} 
            />
        </div>
    );
}
