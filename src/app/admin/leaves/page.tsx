import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { updateLeaveRequestStatus } from "@/app/actions/admin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { LeaveApprovalsClientPage } from "./components/leave-approvals-client-page";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function AdminLeavesPage() {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/login");
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "MANAGER") {
        redirect("/");
    }
    const pendingRequests = await prisma.leaveRequest.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });

    const processedRequests = await prisma.leaveRequest.findMany({
        where: { status: { not: "PENDING" } },
        include: { user: true },
        orderBy: { updatedAt: "desc" },
        take: 1000,
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">PFFD Approvals</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Review and manage employee PFFD requests.
                </p>
            </div>

            <div className="space-y-6">
                <h2 className="font-semibold text-xl">Pending Requests</h2>
                {pendingRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed bg-card/50 text-card-foreground p-12 text-center text-muted-foreground">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                            <span className="text-primary text-xl">✨</span>
                        </div>
                        <p>All caught up! No pending PFFD requests to review.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pendingRequests.map((request: any) => (
                            <div key={request.id} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg">{request.user.name}</h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                            Pending
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        <span className="capitalize text-foreground">{request.leaveType === 'LEAVE_CREDITS' ? 'PFFD Credits' : request.leaveType.toLowerCase() + ' PFFD'}</span> • {format(request.startDate, "MMM d")} to {format(request.endDate, "MMM d, yyyy")}
                                    </p>
                                    {request.reason && (
                                        <p className="text-sm mt-3 pt-3 border-t italic text-muted-foreground max-w-2xl">
                                            "{request.reason}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex sm:flex-col gap-2 shrink-0">
                                    <form action={async () => {
                                        "use server";
                                        await updateLeaveRequestStatus(request.id, "APPROVED");
                                    }}>
                                        <SubmitButton variant="success" className="w-full sm:w-32">
                                            Approve
                                        </SubmitButton>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await updateLeaveRequestStatus(request.id, "REJECTED");
                                    }}>
                                        <SubmitButton variant="outline" className="w-full sm:w-32 text-destructive border-destructive hover:bg-destructive hover:text-white">
                                            Reject
                                        </SubmitButton>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <LeaveApprovalsClientPage initialProcessedRequests={processedRequests} />
        </div>
    );
}
