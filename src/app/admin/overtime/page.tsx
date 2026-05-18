import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { OvertimeApprovalsClient } from "./components/overtime-approvals-client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function AdminOvertimePage() {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/login");
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "MANAGER") {
        redirect("/");
    }

    // Fetch requests. Managers only see their team. Admins see all.
    const whereClause = userRole === "MANAGER" 
        ? { user: { managerId: session.user.id } } 
        : {};

    const requests = await prisma.overtimeRequest.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { name: true, email: true }
            },
            manager: {
                select: { name: true }
            }
        }
    });

    const formattedRequests = requests.map(req => ({
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

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Overtime Approvals</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Review and approve employee overtime requests.
                </p>
            </div>
            
            <OvertimeApprovalsClient requests={formattedRequests} />
        </div>
    );
}
