import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { OvertimeClientPage } from "./components/overtime-client-page";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function OvertimePage() {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/login");
    }

    const requests = await prisma.overtimeRequest.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            manager: {
                select: { name: true }
            }
        }
    });

    const formattedRequests = requests.map(req => ({
        id: req.id,
        dateRange: `${format(req.startDate, 'MMM d, yyyy')} - ${format(req.endDate, 'MMM d, yyyy')}`,
        timeRange: `${req.startTime} to ${req.endTime}`,
        reason: req.reason,
        status: req.status,
        managerName: req.manager?.name || "Pending",
        attachmentUrl: req.attachmentUrl,
        submittedOn: format(req.createdAt, 'MMM d, yyyy')
    }));

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Overtime Requests</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    File your overtime requests and track their approval status.
                </p>
            </div>
            
            <OvertimeClientPage initialRequests={formattedRequests} />
        </div>
    );
}
